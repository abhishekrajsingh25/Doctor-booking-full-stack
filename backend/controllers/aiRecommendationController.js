import doctorModel from "../models/doctorModel.js";
import doctorRecommendationPrompt from "../prompts/doctorRecommendation.prompt.js";
import { askGroq } from "../services/groq.service.js";

export const recommendDoctor = async (req, res) => {
    try {
      const { symptoms } = req.body;
  
      if (!symptoms || symptoms.length === 0) {
        return res.json({ success: false, message: "Symptoms required" });
      }
  
      const doctors = await doctorModel.find({ available: true }).select(
        "name speciality experience fees"
      );
  
      const prompt = doctorRecommendationPrompt({ symptoms, doctors });
  
      const aiResponse = await askGroq(prompt);
  
      console.log("RAW AI RESPONSE 👉", aiResponse);
  
      const cleanResponse = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
  
      const result = JSON.parse(cleanResponse);
  
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("AI ERROR 👉", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
  
