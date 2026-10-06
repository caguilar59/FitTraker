const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Check all fields were entered
        if (!name || !email || !password || !confirmPassword) {
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

module.exports = router;

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check both fields were entered
        if (!email || !password) {
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