const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/user");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { name, password, confirmPassword } = req.body;
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

        // Check all fields were entered
        if (typeof name !== "string" || !name.trim() || !email || typeof password !== "string" || !password || typeof confirmPassword !== "string" || !confirmPassword) {
            return res.status(400).json({
                message: "Please fill in all fields"
            });
        }

        // Check passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists"
            });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Account created successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});



router.post("/login", async (req, res) => {
    try {
        const password = req.body.password;
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

        // Check both fields were entered
        if (!email || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Please enter your email and password"
            });
        }

        // Find user by email
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare entered password with hashed password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
        req.session.user = { id: String(user._id), name: user.name, email: user.email };
        await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
router.get('/me', (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!req.session.user) return res.status(401).json({ message: 'Please log in' });
    res.json({ user: req.session.user });
});
router.post('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) return res.status(500).json({ message: 'Unable to log out' });
        res.clearCookie('fittraker.sid', { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        res.json({ message: 'Logged out' });
    });
});
module.exports = router;
