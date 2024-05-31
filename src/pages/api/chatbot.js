import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { input } = req.body;

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
      const result = await model.generateContentStream([input]);
      let output = "";
      for await (const chunk of result.stream) {
        output += chunk.text();
      }

      // Remove any leading or trailing whitespace from the output
      output = output.trim();

      res.status(200).json({ output });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
