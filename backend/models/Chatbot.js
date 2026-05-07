const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: "AI Assistant" },
    personality: { type: String, default: "helpful and friendly" },
    color: { type: String, default: "#7F77DD" },
    welcomeMessage: { type: String, default: "Hi! How can I help you today?" },
    systemPrompt: { type: String, default: "" },
    totalChats: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chatbot", chatbotSchema);