
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

// New function to auto-fetch/generate specs from model name
export const fetchPhoneSpecs = async (modelName: string): Promise<Partial<Product> | null> => {
    try {
        const prompt = `
            Act as a technical product specification API. 
            I need detailed technical specs for the mobile phone: "${modelName}".
            Return ONLY a valid JSON object. Do not include markdown formatting.
            
            The JSON structure must be:
            {
                "brand": "String (e.g. Apple, Samsung)",
                "category": "Smartphones",
                "price": Number (Estimate in Kuwaiti Dinar KWD, strictly number),
                "description": "A 2-sentence marketing description.",
                "specs": {
                    "screen": "String (e.g. 6.1 inch OLED)",
                    "processor": "String (e.g. A17 Pro)",
                    "ram": "String (e.g. 8GB)",
                    "storage": "String (e.g. 128GB)",
                    "camera": "String (e.g. 48MP Main)",
                    "battery": "String (e.g. 3274mAh)",
                    "os": "String",
                    "weight": "String",
                    "dimensions": "String"
                },
                "tags": ["Array", "of", "strings"]
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let text = response.text || "{}";
        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const data = JSON.parse(text);
        return data;
    } catch (error) {
        console.error("Error generating specs:", error);
        return null;
    }
};
