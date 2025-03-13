const express = require("express");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// 📌 ✅  User Registration
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const newUser = await User.create({ username, email, password });
        res.status(201).json({ message: "User Registered Successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 📌 ✅  User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
