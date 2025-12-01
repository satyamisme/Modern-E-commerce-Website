import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Product } from "../types";
import { PRODUCTS } from "../data/products";

// Initialize Gemini
// Note: process.env.API_KEY is assumed to be available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "Lakki", an expert AI sales assistant for LAKKI PHONES in Kuwait.
We sell premium mobile phones and electronics.
Our current Inventory is: ${JSON.stringify(PRODUCTS.map(p => ({ 
  name: p.name, 
  price: p.price, 
  brand: p.brand, 
  specs: p.specs 
})))}.

Your goal is to help customers find the perfect phone, compare models, and answer technical questions.
- Be concise, friendly, and professional.
- Prices are in KWD (Kuwaiti Dinar).
- If a user asks about a specific phone we sell, highlight its key specs.
- If comparing, create a small markdown table or bullet points.
- If asked about phones we don't sell, politely mention we focus on our curated collection.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = getChatSession();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm having trouble connecting to the network right now.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
};

export const generateProductReview = async (product: Product): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, engaging, 3-sentence expert summary review for the ${product.name}. 
      Highlight its key feature: ${product.specs.camera} or ${product.specs.processor}. 
      End with a recommendation on who should buy it.`,
    });
    return response.text || "Review unavailable.";
  } catch (error) {
    console.error("Gemini Review Error:", error);
    return "Could not generate review at this time.";
  }
};