// Import the OpenAI SDK to interact with the GPT API
import OpenAI from "openai";

// Import Express framework for handling HTTP server and routing
import express from "express";

// Enable Cross-Origin Resource Sharing (CORS) to allow frontend requests from different origins
import cors from "cors";

// Middleware for parsing JSON bodies in incoming requests
import bodyParser from "body-parser";

// Node.js built-in module for file system interactions (read/write files)
import fs from "fs";

// Node.js built-in module for handling file paths
import path from "path";

// Utility to resolve __dirname in ES modules
import { fileURLToPath } from "url";

// Create an Express application instance
const app = express();

// Define the port the server will listen on
const PORT = 3000;

// ------------------- MIDDLEWARE ------------------- //

// Enable CORS for all incoming requests
app.use(cors());

// Parse incoming JSON payloads
app.use(bodyParser.json());

// Serve static frontend files from the Synology Web Station folder (e.g., assistant-preview.html)
app.use(express.static("/folder/web"));

// ------------------- RESOLVE __dirname ------------------- //
// Required in ES module format to emulate CommonJS-style __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------- OPENAI CONFIG ------------------- //
// Instantiate OpenAI client with your API key (replace "APIKEY" with your real key)
const openai = new OpenAI({
  apiKey: "APIKEY"
});

// ------------------- MAIN GPT ENDPOINT ------------------- //
// Handles POST requests to /gpt with a user message in JSON body
app.post("/gpt", async (req, res) => {
  // Extract user message from request body
  const userMessage = req.body.message;

  // Initialize system prompt variable
  let systemPrompt = "";

  // Try to load the system prompt from disk (live-editable prompt file)
  try {
    systemPrompt = fs.readFileSync("/app/prompt.txt", "utf-8");
  } catch (err) {
    // Fallback to default prompt if loading fails
    console.error("❌ Failed to load prompt.txt:", err.message);
    systemPrompt = "You are a helpful assistant, but the prompt file failed to load.";
  }

  // Attempt to generate a response using OpenAI's GPT-4 model
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt }, // System prompt sets behavior
        { role: "user", content: userMessage }     // User input message
      ]
    });

    // Extract the assistant's reply from the response object
    const reply = chatCompletion.choices[0]?.message?.content || "Sorry, no reply generated.";

    // Send the reply as JSON
    res.json({ reply });

  } catch (err) {
    // Handle GPT-related errors
    console.error("❌ GPT error:", err.message);
    res.status(500).json({ reply: "Sorry, I couldn’t reach the assistant right now. Please try again later or visit the Info Booth at the event for help." });
  }
});

// ------------------- GET CURRENT PROMPT ------------------- //
// Allows frontend or admin to retrieve the current system prompt
app.get("/get-prompt", (req, res) => {
  try {
    const prompt = fs.readFileSync("/app/prompt.txt", "utf-8");
    res.json({ prompt });
  } catch (err) {
    console.error("❌ Failed to read prompt:", err.message);
    res.status(500).json({ error: "Unable to load prompt." });
  }
});

// ------------------- SAVE PROMPT ------------------- //
// Allows frontend editor UI to POST a new prompt and save it to disk
app.post("/save-prompt", (req, res) => {
  const newPrompt = req.body.prompt;

  // Ensure the prompt is not empty
  if (!newPrompt) {
    return res.status(400).json({ error: "Prompt text is required." });
  }

  try {
    // Overwrite prompt.txt with the new prompt
    fs.writeFileSync("/app/prompt.txt", newPrompt, "utf-8");
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to write prompt:", err.message);
    res.status(500).json({ error: "Failed to save prompt." });
  }
});

// ------------------- LEGACY RAW PROMPT ENDPOINT ------------------- //
// Serves the raw prompt as plain text for browser or CLI curl usage
app.get("/prompt", (req, res) => {
  try {
    const prompt = fs.readFileSync("/app/prompt.txt", "utf-8");
    res.type("text/plain").send(prompt);
  } catch (err) {
    console.error("❌ Failed to serve raw prompt:", err.message);
    res.status(500).send("Error loading prompt.");
  }
});

// ------------------- START SERVER ------------------- //
// Start listening for requests on defined port
app.listen(PORT, () => {
  console.log(`🚀 Assistant running at http://localhost:${PORT}`);
});
