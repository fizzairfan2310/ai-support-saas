# AI Support SaaS 🤖✨

A powerful, full-stack SaaS platform that allows businesses to create, customize, and embed AI-driven customer support chatbots on their websites. Built with modern technologies, it features a comprehensive dashboard for managing chatbots, tracking analytics, and capturing leads.

---

## 🚀 Features

- **Customizable Chatbots**: Create multiple chatbots with unique names, personalities, and system prompts.
- **Visual Customization**: Personalize the chatbot's primary color and welcome message to match your brand.
- **Lead Capture**: Automatically captures lead information (Name & Email) during conversations.
- **Powerful Dashboard**: A centralized hub to manage your chatbots and view performance metrics.
- **Groq-Powered AI**: Leverages the speed and intelligence of Llama 3.1 via Groq SDK for natural and fast responses.
- **Embeddable Widget**: A lightweight, vanilla JavaScript widget that can be easily integrated into any HTML website.
- **Real-time Analytics**: Track the total number of chats and lead generation stats.
- **Authentication**: Secure user login and registration system.

---

## 🛠️ Tech Stack

### Frontend (Dashboard)
- **React 19**: Modern UI library for a responsive experience.
- **Framer Motion**: Smooth, high-quality animations.
- **Recharts**: Beautiful data visualization for chatbot analytics.
- **React Icons**: Extensive icon library.
- **Axios**: Efficient API communication.

### Backend (API)
- **Node.js & Express**: Fast and scalable server-side environment.
- **MongoDB & Mongoose**: Flexible NoSQL database for storing chatbots, chats, and user data.
- **Groq SDK**: High-performance AI inference (Llama 3.1).
- **JWT & BcryptJS**: Secure authentication and password hashing.

### Widget
- **Vanilla JS & HTML**: Lightweight and compatible with all modern browsers and CMS platforms.

---

## 📂 Project Structure

```text
ai-support-saas/
├── backend/            # Express API server
│   ├── models/         # Mongoose schemas (User, Chatbot, Chat)
│   ├── routes/         # API endpoints (Auth, Chatbot, Chat)
│   ├── index.js        # Server entry point
│   └── .env            # Environment variables
├── frontend/
│   └── dashboard/      # React-based admin dashboard
│       ├── src/        # React components, pages, and assets
│       └── public/     # Static assets
└── widget/             # Embeddable widget source files
    ├── widget.js       # Core widget logic
    └── *.html          # Demo/Test implementations
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Groq API Key](https://console.groq.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fizzairfan2310/ai-support-saas.git
   cd ai-support-saas
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GROQ_API_KEY=your_groq_api_key
   ```
   Start the backend server:
   ```bash
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend/dashboard
   npm install
   npm start
   ```

---

## 🧩 Usage

### 1. Create a Chatbot
Log in to the dashboard and click "Create New Chatbot". Define its personality (e.g., "Sarcastic AI Assistant" or "Professional Concierge") and set its system prompt.

### 2. Embed the Widget
To add the chatbot to your website, include the following script before the closing `</body>` tag:

```html
<script 
  src="http://localhost:5000/widget.js" 
  data-chatbot-id="YOUR_CHATBOT_ID">
</script>
```

Replace `YOUR_CHATBOT_ID` with the actual ID from your dashboard.

---

## 🎨 Aesthetic Design
The dashboard features a **Sleek Dark Mode** aesthetic with:
- **Glassmorphism**: Modern frosted-glass effects.
- **Vibrant Gradients**: Deep purple and indigo accents.
- **Interactive Elements**: Micro-animations using Framer Motion.

---

## 📄 License
This project is licensed under the ISC License.

---

Developed with ❤️ by [Fizzairfan](https://github.com/fizzairfan2310)
