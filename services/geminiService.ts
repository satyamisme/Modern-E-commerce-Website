
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
      Highlight its key feature: ${product.specs['Main Camera'] || product.specs.camera || 'Performance'}. 
      End with a recommendation on who should buy it.`,
    });
    return response.text || "Review unavailable.";
  } catch (error) {
    console.error("Gemini Review Error:", error);
    return "Could not generate review at this time.";
  }
};

export const generateSEO = async (productName: string, description: string): Promise<{ metaTitle: string, metaDescription: string, keywords: string[] } | null> => {
    try {
        const prompt = `
            Act as an E-commerce SEO Expert & Copywriter.
            Generate high-converting, sales-driven SEO metadata for: "${productName}".
            Description context: "${description.substring(0, 500)}..."

            Requirements:
            1. Meta Title: Catchy, includes main keyword, under 60 chars.
            2. Meta Description: Persuasive, includes USPs (like 'Free Shipping', 'Official Warranty'), under 160 chars.
            3. Keywords: 5-8 relevant, high-traffic keywords for Kuwait/Middle East market if applicable.

            Return ONLY a valid JSON object:
            {
                "metaTitle": "Title",
                "metaDescription": "Description",
                "keywords": ["keyword1", "keyword2"]
            }
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (e) {
        console.error("SEO Gen Error", e);
        return null;
    }
};

// Search for real image URLs using Google Search Grounding
export const findProductImage = async (modelName: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: `Find 3 high-quality, official promotional image URLs for the smartphone: "${modelName}". 
            Prefer pure white backgrounds if possible.
            Return ONLY a raw JSON array of strings. Example: ["https://site.com/img1.jpg", "https://site.com/img2.jpg"]`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        let urls: string[] = [];
        
        // 1. Check grounding chunks (Best source for real URLs found by search)
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri && (chunk.web.uri.match(/\.(jpg|png|webp|jpeg)$/i))) {
                    urls.push(chunk.web.uri);
                }
            });
        }

        // 2. Fallback: Parse text if it returned a JSON array
        if (urls.length === 0 && response.text) {
            try {
                // Robust parsing: strip markdown and find JSON array
                let text = response.text;
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                
                const start = text.indexOf('[');
                const end = text.lastIndexOf(']');
                
                if (start !== -1 && end !== -1) {
                    const jsonStr = text.substring(start, end + 1);
                    const jsonUrls = JSON.parse(jsonStr);
                    if (Array.isArray(jsonUrls)) {
                        const validUrls = jsonUrls.filter((u: string) => typeof u === 'string' && u.startsWith('http'));
                        urls.push(...validUrls);
                    }
                }
            } catch (e) {
               console.warn("Failed to parse image JSON fallback", e);
            }
        }

        // De-duplicate URLs
        return Array.from(new Set(urls));
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }
};

// Autocomplete Model Suggestions
export const searchMobileModels = async (query: string): Promise<Array<{model: string, brand: string, variants: string[], year: string}>> => {
    try {
        const prompt = `
            User input: "${query}"
            Return a JSON array of 5 likely mobile phone models that match this input.
            Include specific variant details (storage/ram) if common.
            
            Format:
            [
                { "model": "Full Model Name", "brand": "Brand", "variants": ["128GB", "256GB"], "year": "2024" }
            ]
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        let text = response.text || "[]";
        return JSON.parse(text);
    } catch (e) {
        return [];
    }
};

// Exhaustive Specs Fetcher (GSM Arena Style)
export const fetchPhoneSpecs = async (modelName: string): Promise<Partial<Product> | null> => {
    try {
        const prompt = `
            Act as a GSMArena specification scraper. 
            I need the FULL technical specs for: "${modelName}".
            
            Return ONLY a valid JSON object. No markdown.
            
            Structure the "specs" object EXACTLY with these groups:
            {
                "brand": "String",
                "category": "Smartphones",
                "price": Number (Estimate KWD),
                "description": "Sales description",
                "colors": ["Array", "of", "Colors"],
                "specs": {
                    "Network": { "Technology": "...", "2G bands": "...", "3G bands": "...", "4G bands": "...", "5G bands": "...", "Speed": "..." },
                    "Launch": { "Announced": "...", "Status": "..." },
                    "Body": { "Dimensions": "...", "Weight": "...", "Build": "...", "SIM": "..." },
                    "Display": { "Type": "...", "Size": "...", "Resolution": "...", "Protection": "..." },
                    "Platform": { "OS": "...", "Chipset": "...", "CPU": "...", "GPU": "..." },
                    "Memory": { "Card slot": "...", "Internal": "..." },
                    "Main Camera": { "Modules": "...", "Features": "...", "Video": "..." },
                    "Selfie Camera": { "Modules": "...", "Features": "...", "Video": "..." },
                    "Sound": { "Loudspeaker": "...", "3.5mm jack": "..." },
                    "Comms": { "WLAN": "...", "Bluetooth": "...", "Positioning": "...", "NFC": "...", "Radio": "...", "USB": "..." },
                    "Features": { "Sensors": "..." },
                    "Battery": { "Type": "...", "Charging": "..." },
                    "Misc": { "Colors": "...", "Models": "...", "SAR": "..." }
                },
                "seo": {
                    "metaTitle": "SEO Title",
                    "metaDescription": "SEO Description",
                    "keywords": ["keyword1", "keyword2"]
                }
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const text = response.text || "{}";
        const data = JSON.parse(text);
        
        return data;
    } catch (error) {
        console.error("Error generating specs:", error);
        return null;
    }
};
