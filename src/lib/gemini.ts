import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export const classifyTicket = async (description: string) => {
  if (!API_KEY) {
    console.warn("Gemini API key missing, skipping classification");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Classify this property damage report: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Category of damage (e.g. Plumbing, Electrical, Heating)" },
            urgency: { type: Type.STRING, description: "EMERGENCY, URGENT, NORMAL" },
            recommendedContractors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Types of contractors needed"
            },
            draftEmail: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                body: { type: Type.STRING }
              }
            },
            missingInfo: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Questions to ask the tenant for more detail"
            }
          },
          required: ["category", "urgency", "recommendedContractors", "draftEmail", "missingInfo"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Classification failed:", error);
    return null;
  }
};
