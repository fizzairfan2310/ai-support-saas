const router = require("express").Router();
const Chatbot = require("../models/Chatbot");
const Chat = require("../models/Chat");
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "No token" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
};

// Get chatbot
router.get("/", auth, async (req, res) => {
    const chatbot = await Chatbot.findOne({ userId: req.userId });
    res.json(chatbot);
});

// Update chatbot
router.put("/", auth, async (req, res) => {
    const { name, personality, color, welcomeMessage, systemPrompt } = req.body;
    const chatbot = await Chatbot.findOneAndUpdate(
        { userId: req.userId },
        { name, personality, color, welcomeMessage, systemPrompt },
        { new: true }
    );
    res.json(chatbot);
});

// Embed code
router.get("/embed", auth, async (req, res) => {
    const chatbot = await Chatbot.findOne({ userId: req.userId });
    const host = req.get("host");
    const protocol = req.protocol;
    const embedCode = `<script src="${protocol}://${host}/widget.js" data-chatbot-id="${chatbot._id}"></script>`;
    res.json({ embedCode, chatbotId: chatbot._id });
});

// Analytics
router.get("/analytics", auth, async (req, res) => {
    try {
        const chatbot = await Chatbot.findOne({ userId: req.userId });

        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const start = new Date(new Date(date).setHours(0, 0, 0, 0));
            const end = new Date(new Date(date).setHours(23, 59, 59, 999));
            const count = await Chat.countDocuments({
                chatbotId: chatbot._id,
                createdAt: { $gte: start, $lte: end }
            });
            days.push({
                day: start.toLocaleDateString("en-US", { weekday: "short" }),
                chats: count
            });
        }

        const leads = await Chat.find({
            chatbotId: chatbot._id,
            leadEmail: { $ne: "" }
        }).select("leadName leadEmail createdAt");

        const thisWeek = days.reduce((sum, d) => sum + d.chats, 0);

        res.json({
            chartData: days,
            leads,
            totalChats: chatbot.totalChats,
            thisWeek,
            leadsCount: leads.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;