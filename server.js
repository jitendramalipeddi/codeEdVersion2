// 1. Load environment variables from your .env file
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();

// 2. Setup middleware to handle JSON and serve your index.html
app.use(express.json());
app.use(express.static(__dirname));

// 3. Create the single, secure endpoint for your app to call
app.post('/gemini', async (req, res) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Safety check to ensure the key is loaded correctly
  if (!geminiApiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not loaded from the .env file.");
    return res.status(500).json({ error: "Server is not configured correctly. API key is missing." });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

  try {
    // This payload is now flexible enough to handle all requests from your app
    const payload = {
      contents: [{ parts: [{ text: req.body.prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };
    
    // Pass along system instructions if your app sends them
    if (req.body.systemInstruction) {
        payload.systemInstruction = req.body.systemInstruction;
    }

    const response = await axios.post(apiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error calling Gemini API:", error.response ? error.response.data : "An unknown error occurred");
    res.status(500).json({ error: "Failed to get a response from the Gemini API." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server is running correctly on http://localhost:${PORT}`));