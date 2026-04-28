// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>AI Assistant</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
      }

      body {
        background: #0f172a;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }

      .chat-container {
        width: 100%;
        max-width: 900px;
        height: 95vh;
        background: #111827;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      }

      .chat-header {
        padding: 20px;
        background: #1f2937;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
      }

      .chat-box {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .message {
        max-width: 80%;
        padding: 14px 16px;
        border-radius: 16px;
        line-height: 1.5;
        font-size: 15px;
        white-space: pre-wrap;
      }

      .user {
        align-self: flex-end;
        background: #2563eb;
      }

      .bot {
        align-self: flex-start;
        background: #374151;
      }

      .chat-input {
        display: flex;
        padding: 16px;
        background: #1f2937;
        gap: 10px;
      }

      .chat-input input {
        flex: 1;
        padding: 14px;
        border: none;
        outline: none;
        border-radius: 12px;
        font-size: 15px;
      }

      .chat-input button {
        padding: 14px 20px;
        border: none;
        border-radius: 12px;
        background: #2563eb;
        color: white;
        cursor: pointer;
        font-weight: bold;
      }

      .chat-input button:hover {
        background: #1d4ed8;
      }

      .typing {
        opacity: 0.7;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="chat-container">
      <div class="chat-header">My AI Assistant</div>
      <div class="chat-box" id="chatBox">
        <div class="message bot">Hello 👋 I’m your AI assistant. Ask me anything.</div>
      </div>
      <div class="chat-input">
        <input type="text" id="userInput" placeholder="Type your message..." />
        <button onclick="sendMessage()">Send</button>
      </div>
    </div>

    <script>
      const chatBox = document.getElementById("chatBox");
      const userInput = document.getElementById("userInput");

      function addMessage(text, sender) {
        const msg = document.createElement("div");
        msg.className = "message " + sender;
        msg.textContent = text;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
        return msg;
      }

      async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, "user");
        userInput.value = "";

        const typingMsg = addMessage("Typing...", "bot typing");

        try {
          const res = await fetch("/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: text }),
          });

          const data = await res.json();
          typingMsg.remove();
          addMessage(data.reply, "bot");
        } catch (error) {
          typingMsg.remove();
          addMessage("Something went wrong.", "bot");
        }
      }

      userInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") sendMessage();
      });
    </script>
  </body>
  </html>
  `);
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a smart, helpful, friendly AI assistant. Reply clearly and naturally. Keep answers useful and human.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: "Error talking to AI.",
    });
  }
});

app.listen(port, () => {
  console.log(\`AI Assistant running at http://localhost:\${port}\`);
});
