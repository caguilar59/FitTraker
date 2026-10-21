const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();

function sessionUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email
    };
}

function saveSession(req) {
    return new Promise((resolve, reject) => {
        req.session.save(error => {
            if (error) return reject(error);
            resolve();
        });
    });
}

function clearSessionCookie(res) {
    res.clearCookie("fittraker.sid", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });
}

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Please log in"
        });
    }

    next();
}

// Create an account
router.post("/signup", async (req, res) => {
    try {
        const {
            name,
            password,
            confirmPassword
        } = req.body;

        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !email ||
            typeof password !== "string" ||
            !password ||
            typeof confirmPassword !== "string" ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: "Please fill in all fields"
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                message: "Password must be no more than 72 bytes"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name.trim(),
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Account created successfully"
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        res.status(500).json({
            message: "Unable to create account"
        });
    }
});

// Log in
router.post("/login", async (req, res) => {
    try {
        const password = req.body.password;

        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        if (!email || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Please enter your email and password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        await new Promise((resolve, reject) => {
            req.session.regenerate(error => {
                if (error) return reject(error);
                resolve();
            });
        });

        req.session.user = sessionUser(user);
        await saveSession(req);

        res.json({
            message: "Login successful",
            user: req.session.user
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to log in"
        });
    }
});

// Get current account details from MongoDB
router.get("/me", requireLogin, async (req, res) => {
    res.set("Cache-Control", "no-store");

    try {
        const user = await User.findById(req.session.user.id)
            .select("name email");

        if (!user) {
            return res.status(401).json({
                message: "Account not found. Please log in again."
            });
        }

        res.json({
            user: sessionUser(user)
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to load your account"
        });
    }
});

// Update name and email
router.patch("/profile", requireLogin, async (req, res) => {
    try {
        const name = typeof req.body.name === "string"
            ? req.body.name.trim()
            : "";

        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Please enter your name and a valid email"
            });
        }

        const user = await User.findById(req.session.user.id);

        if (!user) {
            return res.status(401).json({
                message: "Account not found. Please log in again."
            });
        }

        const existingUser = await User.findOne({
            email,
            _id: { $ne: user._id }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "That email is already used by another account"
            });
        }

        user.name = name;
        user.email = email;

        await user.save();

        req.session.user = sessionUser(user);
        await saveSession(req);

        res.json({
            message: "Profile updated successfully",
            user: req.session.user
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "That email is already used by another account"
            });
        }

        res.status(500).json({
            message: "Unable to complete the update. Refresh to check your details."
        });
    }
});

// Change password
router.post("/change-password", requireLogin, async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;

        if (
            typeof currentPassword !== "string" ||
            !currentPassword ||
            typeof newPassword !== "string" ||
            typeof confirmPassword !== "string"
        ) {
            return res.status(400).json({
                message: "Please complete all password fields"
            });
        }

        if (
            newPassword.length < 12 ||
            Buffer.byteLength(newPassword, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Use at least 12 characters and no more than 72 bytes"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New passwords do not match"
            });
        }

        const user = await User.findById(req.session.user.id);

        if (!user) {
            return res.status(401).json({
                message: "Account not found. Please log in again."
            });
        }

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        const samePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (samePassword) {
            return res.status(400).json({
                message: "Choose a password different from your current one"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        req.session.destroy(error => {
            if (error) {
                return res.status(500).json({
                    message: "Password changed, but logout failed. Please log out."
                });
            }

            clearSessionCookie(res);

            res.json({
                message: "Password changed. Please log in again."
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to complete the password change"
        });
    }
});

// Log out
router.post("/logout", (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({
                message: "Unable to log out"
            });
        }

        clearSessionCookie(res);

        res.json({
            message: "Logged out"
        });
    });
});

module.exports = router;