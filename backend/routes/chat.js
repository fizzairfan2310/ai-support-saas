const router = require("express").Router();
const Groq = require("groq-sdk");
const Chatbot = require("../models/Chatbot");
const Chat = require("../models/Chat");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/:chatbotId", async (req, res) => {
    try {
        const { message, history = [], sessionId, leadName, leadEmail } = req.body;

        const chatbot = await Chatbot.findById(req.params.chatbotId);
        if (!chatbot) return res.status(404).json({ error: "Chatbot not found" });

        if (message === "__init__") {
            return res.json({
                chatbotName: chatbot.name,
                welcomeMessage: chatbot.welcomeMessage,
                color: chatbot.color
            });
        }

        if (message === "__lead__") {
            if (sessionId && leadEmail) {
                await Chat.findByIdAndUpdate(sessionId, { leadName, leadEmail });
            } else if (leadEmail) {
                await Chat.create({
                    chatbotId: chatbot._id,
                    messages: [],
                    leadName,
                    leadEmail
                });
            }
            return res.json({ success: true });
        }


        if (leadEmail && sessionId) {
            await Chat.findOneAndUpdate(
                { _id: sessionId },
                { leadName, leadEmail },
                { new: true }
            );
        }

        const systemPrompt = `You are ${chatbot.name}, a customer support AI.
Personality: ${chatbot.personality}.
${chatbot.systemPrompt}
Keep replies concise. Max 2-3 sentences.
If user seems interested, politely ask for their name and email to follow up.`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.slice(-10),
            { role: "user", content: message }
        ];

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages,
            max_tokens: 150
        });

        const reply = response.choices[0].message.content;

        let chat;
        if (sessionId) {
            chat = await Chat.findByIdAndUpdate(
                sessionId,
                {
                    $push: {
                        messages: [
                            { role: "user", content: message },
                            { role: "assistant", content: reply }
                        ]
                    }
                },
                { new: true }
            );
        } else {
            chat = await Chat.create({
                chatbotId: chatbot._id,
                messages: [
                    { role: "user", content: message },
                    { role: "assistant", content: reply }
                ]
            });
        }

        chatbot.totalChats += 1;
        await chatbot.save();

        res.json({ reply, chatbotName: chatbot.name, sessionId: chat._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;