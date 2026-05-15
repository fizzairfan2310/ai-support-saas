(function () {
  const scriptTag = document.currentScript;
  const chatbotId = scriptTag.getAttribute("data-chatbot-id");
  const API = "http://localhost:5000/api";

  let history = [];
  let sessionId = null;

  // Styles
  const style = document.createElement("style");
  style.innerHTML = `
    #ai-widget-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 60px; height: 60px; border-radius: 50%;
      background: #7F77DD; color: white; font-size: 26px;
      border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      z-index: 99999; transition: all 0.3s;
      display: flex; align-items: center; justify-content: center;
    }
    #ai-widget-btn:hover { transform: scale(1.1); }
    #ai-widget-box {
      position: fixed; bottom: 96px; right: 24px;
      width: 360px; height: 520px; background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      display: none; flex-direction: column;
      z-index: 99999; font-family: 'Inter', sans-serif; overflow: hidden;
      animation: ai-slide-up 0.3s ease;
    }
    @keyframes ai-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #ai-widget-header {
      padding: 20px 20px 16px;
      color: white;
      display: flex; align-items: center; gap: 12px;
    }
    #ai-widget-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    #ai-widget-info { flex: 1; }
    #ai-widget-name { font-weight: 700; font-size: 15px; }
    #ai-widget-status { font-size: 12px; opacity: 0.8; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
    #ai-widget-status::before { content: ''; width: 6px; height: 6px; background: #4CAF50; border-radius: 50%; display: inline-block; }
    #ai-widget-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f8f9fa;
    }
    #ai-widget-messages::-webkit-scrollbar { width: 4px; }
    #ai-widget-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
    .ai-msg-user {
      align-self: flex-end; color: white;
      padding: 10px 14px; border-radius: 18px;
      border-bottom-right-radius: 4px;
      max-width: 80%; font-size: 14px; line-height: 1.5;
      word-break: break-word;
    }
    .ai-msg-bot {
      align-self: flex-start; background: white; color: #222;
      padding: 10px 14px; border-radius: 18px;
      border-bottom-left-radius: 4px;
      max-width: 80%; font-size: 14px; line-height: 1.5;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      word-break: break-word;
    }
    .ai-typing {
      display: flex; gap: 5px; padding: 12px 14px;
      background: white; border-radius: 18px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .ai-typing span {
      width: 7px; height: 7px; background: #bbb;
      border-radius: 50%; animation: ai-bounce 1.2s infinite;
    }
    .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ai-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-8px); }
    }
    #ai-lead-form {
      background: white; margin: 0 16px 12px;
      border-radius: 12px; padding: 14px;
      border: 1px solid #eee; display: none;
    }
    #ai-lead-form p { font-size: 12px; color: #888; margin-bottom: 10px; font-weight: 500; }
    #ai-lead-form input {
      width: 100%; padding: 8px 12px; border: 1px solid #eee;
      border-radius: 8px; font-size: 13px; outline: none;
      margin-bottom: 8px; box-sizing: border-box; font-family: inherit;
    }
    #ai-lead-submit {
      width: 100%; padding: 9px; border: none;
      border-radius: 8px; color: white; font-size: 13px;
      font-weight: 600; cursor: pointer; font-family: inherit;
    }
    #ai-widget-input-row {
      display: flex; gap: 8px; padding: 12px 16px;
      border-top: 1px solid #f0f0f0; background: white;
    }
    #ai-widget-input {
      flex: 1; padding: 10px 14px; border-radius: 20px;
      border: 1px solid #eee; font-size: 14px; outline: none;
      font-family: inherit; background: #f8f9fa;
      transition: border 0.2s;
    }
    #ai-widget-input:focus { border-color: #7F77DD; background: white; }
    #ai-widget-send {
      width: 40px; height: 40px; border-radius: 50%; border: none;
      color: white; cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s; flex-shrink: 0;
    }
    #ai-widget-send:hover { transform: scale(1.1); }
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
      <div id="ai-widget-avatar">🤖</div>
      <div id="ai-widget-info">
        <div id="ai-widget-name">AI Support</div>
        <div id="ai-widget-status">Online</div>
      </div>
    </div>
    <div id="ai-widget-messages"></div>
    <div id="ai-lead-form">
      <p>📧 Leave your contact info for follow-up</p>
      <input id="ai-lead-name" placeholder="Your name" />
      <input id="ai-lead-email" placeholder="Your email" type="email" />
      <button id="ai-lead-submit">Submit</button>
    </div>
    <div id="ai-widget-input-row">
      <input id="ai-widget-input" placeholder="Type a message..." />
      <button id="ai-widget-send">➤</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(box);

  // Chatbot info load karo — color aur name apply karo
  fetch(`${API}/chat/${chatbotId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "__init__", history: [] })
  })
    .then(r => r.json())
    .then(data => {
      const name = data.chatbotName || "AI Support";
      const color = data.color || "#7F77DD";
      const welcome = data.welcomeMessage || "Hi! How can I help you today?";

      // Name update
      document.getElementById("ai-widget-name").textContent = name;

      // Color apply karo
      document.getElementById("ai-widget-header").style.background = color;
      btn.style.background = color;
      document.getElementById("ai-widget-send").style.background = color;
      document.getElementById("ai-lead-submit").style.background = color;

      // Avatar letter
      document.getElementById("ai-widget-avatar").textContent = name[0].toUpperCase();

      // Welcome message
      addMsg("bot", welcome);
    })
    .catch(() => {
      addMsg("bot", "Hi! How can I help you today?");
    });

  // Toggle
  let isOpen = false;
  btn.onclick = () => {
    isOpen = !isOpen;
    box.style.display = isOpen ? "flex" : "none";
    btn.innerHTML = isOpen ? "✕" : "💬";
  };

  // Lead form
  document.getElementById("ai-lead-submit").onclick = async () => {
    const name = document.getElementById("ai-lead-name").value.trim();
    const email = document.getElementById("ai-lead-email").value.trim();
    if (!name || !email) return;

    await fetch(`${API}/chat/${chatbotId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "__lead__",
        history: [],
        sessionId,
        leadName: name,
        leadEmail: email
      })
    });

    document.getElementById("ai-lead-form").style.display = "none";
    addMsg("bot", `Thank you ${name}! We'll reach out to you at ${email} soon. 😊`);
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
        body: JSON.stringify({ message: text, history, sessionId })
      });
      const data = await res.json();
      typing.remove();

      if (data.sessionId) sessionId = data.sessionId;

      addMsg("bot", data.reply || "Sorry, something went wrong.");
      history.push({ role: "assistant", content: data.reply });

      // 3 messages ke baad lead form dikhao
      if (history.length >= 6) {
        document.getElementById("ai-lead-form").style.display = "block";
      }
    } catch {
      typing.remove();
      addMsg("bot", "Connection issue. Please try again.");
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
    if (role === "user") {
      const color = document.getElementById("ai-widget-header").style.background || "#7F77DD";
      div.style.background = color;
    }
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
})();