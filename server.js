import OpenAI from "openai";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("/folder/web")); // Serve static files from your Synology Web Station

// Resolve __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔑 Your OpenAI key
const openai = new OpenAI({
  apiKey: "APIKEY"
});

// 💬 Main Assistant Endpoint
app.post("/gpt", async (req, res) => {
  const userMessage = req.body.message;

  let systemPrompt = "";
  try {
    systemPrompt = fs.readFileSync("/app/prompt.txt", "utf-8");
  } catch (err) {
    console.error("❌ Failed to load prompt.txt:", err.message);
    systemPrompt = "You are a helpful assistant, but the prompt file failed to load.";
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Sorry, no reply generated.";
    res.json({ reply });

  } catch (err) {
    console.error("❌ GPT error:", err.message);
    res.status(500).json({ reply: "Sorry, I couldn’t reach the assistant right now. Please try again later or visit the Info Booth at the event for help." });
  }
});

// 🔓 GET the current prompt
app.get("/get-prompt", (req, res) => {
  try {
    const prompt = fs.readFileSync("/app/prompt.txt", "utf-8");
    res.json({ prompt });
  } catch (err) {
    console.error("❌ Failed to read prompt:", err.message);
    res.status(500).json({ error: "Unable to load prompt." });
  }
});

// ✏️ POST a new prompt (from editor UI)
app.post("/save-prompt", (req, res) => {
  const newPrompt = req.body.prompt;
  if (!newPrompt) {
    return res.status(400).json({ error: "Prompt text is required." });
  }

  try {
    fs.writeFileSync("/app/prompt.txt", newPrompt, "utf-8");
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to write prompt:", err.message);
    res.status(500).json({ error: "Failed to save prompt." });
  }
});

// Legacy fallback for plain text request (like direct browser loads)
app.get("/prompt", (req, res) => {
  try {
    const prompt = fs.readFileSync("/app/prompt.txt", "utf-8");
    res.type("text/plain").send(prompt);
  } catch (err) {
    console.error("❌ Failed to serve raw prompt:", err.message);
    res.status(500).send("Error loading prompt.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Assistant running at http://localhost:${PORT}`);
});
