const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    chatbotId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot" },
    messages: [{
        role: String,
        content: String,
        timestamp: { type: Date, default: Date.now }
    }],
    leadName: { type: String, default: "" },
    leadEmail: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);