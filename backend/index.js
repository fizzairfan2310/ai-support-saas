const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "widget")));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected!"))
    .catch(err => console.log("MongoDB error:", err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/chat", require("./routes/chat"));

app.get("/", (req, res) => res.json({ status: "AI SaaS API live!" }));

if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
}

module.exports = app;