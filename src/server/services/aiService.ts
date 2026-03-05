import { GoogleGenAI, Type } from "@google/genai";

// Use placeholder if key is missing as requested
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "PLACEHOLDER_SECRET_KEY";

export interface AIAnalysisResult {
  category: string;
  urgency: "NORMAL" | "URGENT" | "EMERGENCY";
  recommendedContractors: string[];
  draftEmail: {
    subject: string;
    body: string;
  };
  missingInfo: string[];
}

export async function analyzeMaintenanceRequest(description: string): Promise<AIAnalysisResult> {
  // Fallback for "Skip Secrets" or missing key
  if (GEMINI_API_KEY === "PLACEHOLDER_SECRET_KEY" || !process.env.GEMINI_API_KEY) {
    console.log("[AI Service] Using mock response (Secrets skipped/missing)");
    return getMockResponse(description);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this property maintenance request and provide a structured response: "${description}"`,
      config: {
        systemInstruction: "You are an expert property management assistant. Categorize the issue, determine urgency, suggest contractor types, draft a professional email to a contractor, and identify any missing information needed to fix the issue.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "e.g., Plumbing, Electrical, HVAC, General" },
            urgency: { type: Type.STRING, enum: ["NORMAL", "URGENT", "EMERGENCY"] },
            recommendedContractors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Types of contractors needed, e.g., ['Plumber', 'Electrician']"
            },
            draftEmail: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                body: { type: Type.STRING }
              },
              required: ["subject", "body"]
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

    const result = JSON.parse(response.text || "{}");
    return result as AIAnalysisResult;
  } catch (error) {
    console.error("[AI Service] Error calling Gemini:", error);
    return getMockResponse(description);
  }
}

function getMockResponse(description: string): AIAnalysisResult {
  const lowerDesc = description.toLowerCase();
  
  let category = "General Maintenance";
  let urgency: "NORMAL" | "URGENT" | "EMERGENCY" = "NORMAL";
  let contractors = ["General Handyman"];

  if (lowerDesc.includes("leak") || lowerDesc.includes("water") || lowerDesc.includes("pipe")) {
    category = "Plumbing";
    urgency = "URGENT";
    contractors = ["Plumber"];
  } else if (lowerDesc.includes("spark") || lowerDesc.includes("power") || lowerDesc.includes("electric")) {
    category = "Electrical";
    urgency = "EMERGENCY";
    contractors = ["Electrician"];
  } else if (lowerDesc.includes("heat") || lowerDesc.includes("cold") || lowerDesc.includes("ac") || lowerDesc.includes("air")) {
    category = "HVAC";
    urgency = "URGENT";
    contractors = ["HVAC Technician"];
  }

  return {
    category,
    urgency,
    recommendedContractors: contractors,
    draftEmail: {
      subject: `Maintenance Request: ${category} Issue`,
      body: `Hello,\n\nWe have received a maintenance request for: ${description}.\n\nPlease let us know your availability to inspect and repair this issue.\n\nBest regards,\nPropCare Management`
    },
    missingInfo: ["When did this issue start?", "Can you provide photos of the issue?"]
  };
}
