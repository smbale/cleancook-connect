import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// AI Endpoint for Health Assessment
app.post("/api/assessment", async (req, res) => {
  try {
    const { fuelType, hoursSpent, ageGroup } = req.body;
    
    if (!fuelType) {
      return res.status(400).json({ error: "Fuel type is required" });
    }

    const prompt = `Assess the health health risks and potential benefits of transitioning to clean cooking for the following profile:
    - Current Fuel: ${fuelType}
    - Hours spent in smoke per day: ${hoursSpent}
    - Age Group: ${ageGroup}
    
    Provide:
    1. Health Risk Score (1-10)
    2. Estimated disease risks (lung disease, heart issues, etc.)
    3. Health benefits of switching to Clean Cookstoves (Electric, Ethanol, or Gas).
    4. A encouraging concluding message.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a public health expert specializing in indoor air pollution and clean energy transition. Your goal is to educate and encourage people in low-income households to switch to clean cooking fuels. Use empathetic, clear, and non-judgmental language.",
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate assessment" });
  }
});

// AI Endpoint for General Q&A
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: "You are 'CleanCook Assistant', a friendly guide helping people understand the transition to clean cooking. You provide facts about indoor air pollution, types of clean stoves (ethanol, LPG, electric pressure cookers), and health tips.",
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Chat AI Error:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
