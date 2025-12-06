import { GoogleGenAI, Type } from "@google/genai";
import { EnhancementResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert English editor and communication coach. Your task is to process user input text.
1. First, assume the text is English. If it is clearly another language, flag it as invalid.
2. Correct all spelling, grammar, punctuation, and syntax errors. This is the "Corrected Version".
3. Generate 5 distinct variations of the corrected text: Professional, Formal, Informal, Social, and Persuasive.
4. For each variation, provide a concise explanation (max 1 sentence) of why it fits that style.
5. Return the result in a strict JSON format.
`;

export const enhanceText = async (inputText: string): Promise<EnhancementResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: inputText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidEnglish: { type: Type.BOOLEAN },
            correctedText: { type: Type.STRING },
            detectedIssues: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Brief list of major grammar/spelling errors found (e.g., 'Subject-verb agreement error', 'Typos')"
            },
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING },
                  text: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            }
          },
          required: ["isValidEnglish", "correctedText", "variations"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as EnhancementResult;
      return result;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
