import { GoogleGenAI, Type } from "@google/genai";
import { Contact } from "../types";

const processEnvApiKey = process.env.API_KEY;

export const analyzeBusinessCards = async (base64Image: string): Promise<Contact[]> => {
  if (!processEnvApiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

  // Schema for the expected output
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING, description: "Full name of the person" },
        title: { type: Type.STRING, description: "Job title or role" },
        company: { type: Type.STRING, description: "Company name" },
        email: { type: Type.STRING, description: "Email address" },
        phone: { type: Type.STRING, description: "Work or landline phone number" },
        mobile: { type: Type.STRING, description: "Mobile phone number" },
        website: { type: Type.STRING, description: "Company website URL" },
        address: { type: Type.STRING, description: "Physical address" },
      },
      required: ["fullName"],
    },
  };

  const modelId = "gemini-3-pro-preview"; // Using Pro for better complex layout reasoning

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Extract contact information from this image which may contain one or more business cards. 
            Return a JSON array where each object represents a detected card. 
            Ensure accuracy for phone numbers and emails. 
            If a field is not found, leave it as an empty string.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 1024 }, // Small budget to allow for some reasoning on layout
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from AI.");
    }

    try {
      const parsed = JSON.parse(text) as Contact[];
      return parsed;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse contact data from AI response.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};