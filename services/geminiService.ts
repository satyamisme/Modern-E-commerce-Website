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

// Generates a URL for an AI generated image based on a prompt
export const generateProductImage = (visualDescription: string): string => {
    // Using Pollinations.ai for demo purposes - it generates images from text prompts without API key
    const encodedPrompt = encodeURIComponent(`professional product photography of ${visualDescription}, studio lighting, 8k, highly detailed, minimalist background`);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
};

// New function to auto-fetch/generate specs from model name
export const fetchPhoneSpecs = async (modelName: string): Promise<Partial<Product> | null> => {
    try {
        const prompt = `
            Act as a technical product specification API. 
            I need EXHAUSTIVE technical specs and SEO data for the mobile phone: "${modelName}".
            
            Return ONLY a valid JSON object. Do not include markdown formatting.
            
            The JSON structure must be:
            {
                "brand": "String",
                "category": "Smartphones",
                "price": Number (Estimate in KWD),
                "description": "A compelling 2-sentence sales description.",
                "visualDescription": "A precise visual description of the phone (color, material, camera layout) for an image generator.",
                "specs": {
                    "Screen": "e.g. 6.8 inch Dynamic AMOLED 2X, 120Hz, 2600 nits",
                    "Processor": "e.g. Snapdragon 8 Gen 3 for Galaxy",
                    "RAM": "e.g. 12GB LPDDR5X",
                    "Storage": "e.g. 256GB/512GB/1TB UFS 4.0",
                    "Main Camera": "e.g. 200MP Wide + 50MP Periscope + 10MP Tele + 12MP Ultra",
                    "Selfie Camera": "e.g. 12MP Dual Pixel AF",
                    "Battery": "e.g. 5000mAh",
                    "Charging": "e.g. 45W Wired, 15W Wireless",
                    "OS": "e.g. Android 14, One UI 6.1",
                    "Build": "e.g. Titanium Frame, Gorilla Glass Armor",
                    "Dimensions": "e.g. 162.3 x 79.0 x 8.6 mm",
                    "Weight": "e.g. 232g",
                    "SIM": "e.g. Dual SIM + eSIM",
                    "Connectivity": "e.g. 5G, Wi-Fi 7, Bluetooth 5.3, NFC, UWB",
                    "Sensors": "e.g. Ultrasonic Fingerprint, Face ID, Accelerometer, Gyro",
                    "Audio": "e.g. Stereo Speakers, 32-bit/384kHz audio",
                    "Durability": "e.g. IP68 Dust/Water Resistant"
                },
                "seo": {
                    "metaTitle": "SEO Title (60 chars max)",
                    "metaDescription": "SEO Description (160 chars max)",
                    "keywords": ["Array", "of", "20", "high", "volume", "keywords"]
                },
                "tags": ["Array", "of", "10", "relevant", "tags"]
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
        
        // Auto-generate an image URL if visual description exists
        let imageUrl;
        if (data.visualDescription) {
            imageUrl = generateProductImage(modelName + " " + data.visualDescription);
        }

        return {
            ...data,
            images: imageUrl ? [imageUrl] : []
        };
    } catch (error) {
        console.error("Error generating specs:", error);
        return null;
    }
};