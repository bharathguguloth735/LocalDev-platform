import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // We can't directly list models easily with the basic SDK without a specific method, 
    // but we can try a few variations.
    console.log("Checking API Key: ", process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING");
    
    const variations = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const v of variations) {
      try {
        const model = genAI.getGenerativeModel({ model: v });
        await model.generateContent("test");
        console.log(`✅ SUCCESS: Model "${v}" is active.`);
        return v;
      } catch (e) {
        console.log(`❌ FAILED: Model "${v}" - ${e.message}`);
      }
    }
  } catch (err) {
    console.error("CRITICAL ERROR:", err);
  }
}

listModels();
