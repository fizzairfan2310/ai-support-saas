const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Chatbot = require("../models/Chatbot");


// Signup
router.post("/signup", async (req, res) => {
    try {
        const { email, password, businessName } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashed, businessName });

        // Default chatbot banao
        await Chatbot.create({ userId: user._id, name: businessName + " Assistant" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token, userId: user._id, businessName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Wrong password" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token, userId: user._id, businessName: user.businessName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;