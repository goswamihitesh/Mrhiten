import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Helper to get GoogleGenAI instance safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Chat Endpoint (ChatGPT-like conversational AI)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, persona, searchGrounding, image } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages payload." });
    }

    const ai = getGeminiClient();

    let systemInstruction =
      "You are the user's personal AI Voice Assistant built for Android.\n\n" +
      "STRICT MANDATORY RULES & BEHAVIOR DIRECTIVES:\n" +
      "1. LANGUAGE: Always reply in Hindi (हिन्दी) unless the user explicitly asks for another language or writes in another language.\n" +
      "2. TONE & APPROACH: Be friendly, respectful, warm, helpful, and accurate.\n" +
      "3. ATTENTION TO DETAIL: Listen carefully to user instructions and answer accordingly.\n" +
      "4. HONESTY: If you don't know something or cannot find information, say so honestly in Hindi instead of making things up.\n" +
      "5. CONVERSATION CONTEXT: Maintain full awareness of previous messages in the conversation.\n" +
      "6. SEARCH & ACCURACY: Use Google Search when needed for up-to-date, real-time factual information.\n" +
      "7. STRUCTURE: Answer clearly and step-by-step. Since responses are often spoken aloud, use clean bullet points, bold key terms, and simple spoken Hindi phrasing.\n" +
      "8. CAPABILITIES: Assist with studies, coding, writing, daily tasks, creative ideas, and general questions.\n" +
      "9. CODE GENERATION: When asked to write code, explain the code step by step and provide complete, functional, copyable code snippets.\n" +
      "10. SAFETY: Never perform or encourage illegal or harmful actions.\n";

    if (persona) {
      if (persona === "concise") {
        systemInstruction += " Keep responses concise, brief, and to the point in 2-3 sentences.";
      } else if (persona === "coding") {
        systemInstruction += " Act as an expert software developer. Provide well-commented code snippets and clean technical explanations.";
      } else if (persona === "storyteller") {
        systemInstruction += " Speak in an expressive, imaginative, storytelling style with warm details.";
      } else if (persona === "funny") {
        systemInstruction += " Speak with a touch of lighthearted humor, witty observations, and playful warmth.";
      }
    }

    // Format history for Gemini
    const contents: any[] = [];

    messages.forEach((msg: { role: string; content: string; image?: string }) => {
      const parts: any[] = [];
      if (msg.image) {
        // Strip data:image/...;base64,
        const base64Data = msg.image.replace(/^data:image\/\w+;base64,/, "");
        const mimeMatch = msg.image.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }
      if (msg.content) {
        parts.push({ text: msg.content });
      }

      const role = msg.role === "user" ? "user" : "model";
      contents.push({ role, parts });
    });

    // If current user request has an image attached directly in body
    if (image && contents.length > 0) {
      const lastIndex = contents.length - 1;
      if (contents[lastIndex].role === "user") {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        contents[lastIndex].parts.unshift({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }
    }

    const config: any = {
      systemInstruction,
      temperature: 0.7,
    };

    if (searchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config,
    });

    const replyText = response.text || "I'm sorry, I couldn't generate a response. Please try again.";

    // Grounding links if any
    let sources: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
      sources = chunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          title: c.web?.title || c.web?.uri,
          url: c.web?.uri,
        }));
    }

    res.json({
      text: replyText,
      sources,
    });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({
      error: err.message || "An error occurred while processing your request.",
    });
  }
});

// Gemini TTS Voice Output Endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const ai = getGeminiClient();
    // Voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const selectedVoice = voiceName || "Puck";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text.slice(0, 800) }] }], // Truncate very long texts for speed
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "Failed to generate audio output." });
    }

    res.json({ audio: base64Audio, mimeType: "audio/pcm" });
  } catch (err: any) {
    console.error("Error in /api/tts:", err);
    res.status(500).json({ error: err.message || "TTS generation error" });
  }
});

// Start Express Server & Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Android AI Voice Assistant server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
