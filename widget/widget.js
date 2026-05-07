(function () {
    const scriptTag = document.currentScript;
    const chatbotId = scriptTag.getAttribute("data-chatbot-id");
    const API = "http://localhost:5000/api";

    let history = [];
    let chatbotName = "AI Support";

    // Styles
    const style = document.createElement("style");
    style.innerHTML = `
    #ai-widget-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 60px; height: 60px; border-radius: 50%;
      background: #7F77DD; color: white; font-size: 26px;
      border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      z-index: 99999; transition: transform 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    #ai-widget-btn:hover { transform: scale(1.1); }
    #ai-widget-box {
      position: fixed; bottom: 96px; right: 24px;
      width: 340px; height: 480px; background: white;
      border-radius: 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: none; flex-direction: column;
      z-index: 99999; font-family: sans-serif; overflow: hidden;
    }
    #ai-widget-header {
      padding: 16px 20px; background: #7F77DD;
      color: white; font-weight: 700; font-size: 15px;
      display: flex; align-items: center; gap: 8px;
    }
    #ai-widget-header span {
      width: 10px; height: 10px; background: #00e676;
      border-radius: 50%; display: inline-block;
    }
    #ai-widget-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f9f9f9;
    }
    #ai-widget-messages::-webkit-scrollbar { width: 4px; }
    #ai-widget-messages::-webkit-scrollbar-thumb {
      background: #ddd; border-radius: 10px;
    }
    .ai-msg-user {
      align-self: flex-end; background: #7F77DD; color: white;
      padding: 10px 14px; border-radius: 16px;
      border-bottom-right-radius: 4px;
      max-width: 80%; font-size: 14px; line-height: 1.4;
      word-break: break-word;
    }
    .ai-msg-bot {
      align-self: flex-start; background: white; color: #222;
      padding: 10px 14px; border-radius: 16px;
      border-bottom-left-radius: 4px;
      max-width: 80%; font-size: 14px; line-height: 1.4;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      word-break: break-word;
    }
    .ai-typing {
      display: flex; gap: 4px; padding: 10px 14px;
      background: white; border-radius: 16px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .ai-typing span {
      width: 6px; height: 6px; background: #999;
      border-radius: 50%; animation: ai-bounce 1s infinite;
    }
    .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ai-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    #ai-widget-input-row {
      display: flex; gap: 8px; padding: 12px 16px;
      border-top: 1px solid #eee; background: white;
    }
    #ai-widget-input {
      flex: 1; padding: 10px 14px; border-radius: 20px;
      border: 1px solid #ddd; font-size: 14px; outline: none;
      transition: border 0.2s;
    }
    #ai-widget-input:focus { border-color: #7F77DD; }
    #ai-widget-send {
      padding: 10px 18px; border-radius: 20px; border: none;
      background: #7F77DD; color: white; cursor: pointer;
      font-weight: 600; font-size: 14px; transition: background 0.2s;
    }
    #ai-widget-send:hover { background: #6c63ff; }
  `;
    document.head.appendChild(style);

    // HTML
    const btn = document.createElement("button");
    btn.id = "ai-widget-btn";
    btn.innerHTML = "💬";

    const box = document.createElement("div");
    box.id = "ai-widget-box";
    box.innerHTML = `
    <div id="ai-widget-header">
      <span></span>
      <span id="ai-widget-name">AI Support</span>
    </div>
    <div id="ai-widget-messages"></div>
    <div id="ai-widget-input-row">
      <input id="ai-widget-input" placeholder="Type a message..." />
      <button id="ai-widget-send">Send</button>
    </div>
  `;

    document.body.appendChild(btn);
    document.body.appendChild(box);

    // Chatbot info load karo
    fetch(`${API}/chat/${chatbotId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "__init__", history: [] })
    })
        .then(r => r.json())
        .then(data => {
            chatbotName = data.chatbotName || "AI Support";
            document.getElementById("ai-widget-name").textContent = chatbotName;
        })
        .catch(() => { });

    // Toggle open/close
    let isOpen = false;
    btn.onclick = () => {
        isOpen = !isOpen;
        box.style.display = isOpen ? "flex" : "none";
        btn.innerHTML = isOpen ? "✕" : "💬";
        if (isOpen && history.length === 0) {
            addMsg("bot", "Hi! How can I help you today?");
        }
    };

    // Send message
    const sendMsg = async () => {
        const input = document.getElementById("ai-widget-input");
        const text = input.value.trim();
        if (!text) return;
        input.value = "";
        input.disabled = true;

        addMsg("user", text);
        history.push({ role: "user", content: text });

        // Typing animation
        const msgs = document.getElementById("ai-widget-messages");
        const typing = document.createElement("div");
        typing.className = "ai-typing";
        typing.innerHTML = "<span></span><span></span><span></span>";
        msgs.appendChild(typing);
        msgs.scrollTop = msgs.scrollHeight;

        try {
            const res = await fetch(`${API}/chat/${chatbotId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, history })
            });
            const data = await res.json();
            typing.remove();
            addMsg("bot", data.reply || "Sorry, I could not understand that.");
            history.push({ role: "assistant", content: data.reply });
        } catch {
            typing.remove();
            addMsg("bot", "Connection issue, please try again.");
        }

        input.disabled = false;
        input.focus();
    };

    document.getElementById("ai-widget-send").onclick = sendMsg;
    document.getElementById("ai-widget-input").onkeydown = e => {
        if (e.key === "Enter") sendMsg();
    };

    function addMsg(role, text) {
        const msgs = document.getElementById("ai-widget-messages");
        const div = document.createElement("div");
        div.className = role === "user" ? "ai-msg-user" : "ai-msg-bot";
        div.textContent = text;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }
})();