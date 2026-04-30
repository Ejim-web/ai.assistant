const express = require('express');
const app = express();

// CORS middleware – allows your GitHub Pages site to call this API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.post('/chat', async (req, res) => {
  const { provider, messages } = req.body;
  let apiUrl, apiKey, body;
  if (provider === 'deepseek') {
    apiUrl = 'https://api.deepseek.com/chat/completions';
    apiKey = DEEPSEEK_KEY;
    body = { model: 'deepseek-chat', messages, temperature: 0.7 };
  } else if (provider === 'openai') {
    apiUrl = 'https://api.openai.com/v1/chat/completions';
    apiKey = OPENAI_KEY;
    body = { model: 'gpt-3.5-turbo', messages, temperature: 0.7 };
  } else {
    return res.status(400).json({ error: 'Invalid provider' });
  }
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Proxy running with CORS enabled'));
