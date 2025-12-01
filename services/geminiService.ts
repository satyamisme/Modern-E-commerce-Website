
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Product } from "../types";
import { PRODUCTS } from "../data/products";
import { APP_CONFIG } from "../config";

// --- GOOGLE SDK SETUP ---
// Note: process.env.API_KEY is assumed to be available.
const googleAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- OPENAI COMPATIBLE FETCH (Grok, DeepSeek, Perplexity, OpenAI) ---
// This allows using any standard LLM API by changing the base URL in config.
async function fetchOpenAICompatible(
  endpoint: string, 
  apiKey: string, 
  modelName: string, 
  messages: any[], 
  temperature = 0.7
): Promise<string> {
  try {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        temperature: temperature,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("AI API Error:", error);
    return "";
  }
}

// --- SYSTEM PROMPT ---
const SYSTEM_INSTRUCTION = `
You are "Lumi", an expert AI sales assistant for LAKKI PHONES in Kuwait.
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

// --- MAIN SERVICE METHODS ---

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY || '';
    
    // 1. Google Gemini (Default)
    if (APP_CONFIG.aiProvider === 'google') {
        const chat = googleAI.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: SYSTEM_INSTRUCTION },
        });
        const response: GenerateContentResponse = await chat.sendMessage({ message });
        return response.text || "I'm having trouble connecting right now.";
    }

    // 2. Grok (xAI)
    if (APP_CONFIG.aiProvider === 'grok') {
        return await fetchOpenAICompatible(
            APP_CONFIG.aiEndpoints.grok,
            apiKey,
            'grok-beta',
            [{ role: 'system', content: SYSTEM_INSTRUCTION }, { role: 'user', content: message }]
        );
    }

    // 3. DeepSeek
    if (APP_CONFIG.aiProvider === 'deepseek') {
        return await fetchOpenAICompatible(
            APP_CONFIG.aiEndpoints.deepseek,
            apiKey,
            'deepseek-chat',
            [{ role: 'system', content: SYSTEM_INSTRUCTION }, { role: 'user', content: message }]
        );
    }

    // 4. Perplexity
    if (APP_CONFIG.aiProvider === 'perplexity') {
        return await fetchOpenAICompatible(
            APP_CONFIG.aiEndpoints.perplexity,
            apiKey,
            'sonar-medium-online',
            [{ role: 'system', content: SYSTEM_INSTRUCTION }, { role: 'user', content: message }]
        );
    }
    
    // 5. OpenAI
    if (APP_CONFIG.aiProvider === 'openai') {
        return await fetchOpenAICompatible(
            APP_CONFIG.aiEndpoints.openai,
            apiKey,
            'gpt-4o',
            [{ role: 'system', content: SYSTEM_INSTRUCTION }, { role: 'user', content: message }]
        );
    }

    return "AI Provider not configured correctly.";

  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm sorry, I encountered an error while processing your request.";
  }
};

export const generateProductReview = async (product: Product): Promise<string> => {
  try {
    const prompt = `Write a short, engaging, 3-sentence expert summary review for the ${product.name}. 
      Highlight its key feature: ${product.specs['Main Camera'] || product.specs.camera || 'Performance'}. 
      End with a recommendation on who should buy it.`;

    if (APP_CONFIG.aiProvider === 'google') {
        const response = await googleAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Review unavailable.";
    }
    
    return await sendMessageToGemini(prompt);

  } catch (error) {
    console.error("Gemini Review Error:", error);
    return "Could not generate review at this time.";
  }
};

export const generateSEO = async (productName: string, description: string): Promise<{ metaTitle: string, metaDescription: string, keywords: string[] } | null> => {
    try {
        const prompt = `
            Act as an E-commerce SEO Expert.
            Generate JSON metadata for: "${productName}".
            Description: "${description.substring(0, 300)}..."

            Format:
            {
                "metaTitle": "Title under 60 chars",
                "metaDescription": "Description under 160 chars with USP",
                "keywords": ["5-8 keywords"]
            }
            Return ONLY raw JSON.
        `;

        let jsonStr = "";

        if (APP_CONFIG.aiProvider === 'google') {
            const response = await googleAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            jsonStr = response.text || "{}";
        } else {
            jsonStr = await sendMessageToGemini(prompt + " Do not use markdown formatting. Just JSON.");
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("SEO Gen Error", e);
        return null;
    }
};

// Search for real image URLs
export const findProductImage = async (modelName: string): Promise<string[]> => {
    if (APP_CONFIG.aiProvider !== 'google') {
        console.warn("Image fetching requires Google Provider for Search Grounding. Returning placeholders.");
        return [];
    }

    try {
        const response = await googleAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find 3 high-quality, official promotional image URLs for the smartphone: "${modelName}". 
            Prefer pure white backgrounds. Return ONLY a raw JSON array of strings.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        let urls: string[] = [];
        
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri && (chunk.web.uri.match(/\.(jpg|png|webp|jpeg)$/i))) {
                    urls.push(chunk.web.uri);
                }
            });
        }
        
        return Array.from(new Set(urls));
    } catch (error: any) {
        // Handle 403 or other permission errors gracefully
        if (error.message && (error.message.includes('403') || error.message.includes('PERMISSION_DENIED'))) {
             console.warn("Search Grounding permission denied. Ensure API key has access to Google Search tool.");
        } else {
             console.error("Error fetching images:", error);
        }
        return [];
    }
};

export const searchMobileModels = async (query: string): Promise<Array<{model: string, brand: string, variants: string[], year: string}>> => {
    const prompt = `
        User input: "${query}"
        Return a JSON array of 5 likely mobile phone models matching this.
        Format: [{ "model": "Name", "brand": "Brand", "variants": ["128GB"], "year": "2024" }]
        Return ONLY JSON.
    `;
    
    try {
        let text = "";
        if (APP_CONFIG.aiProvider === 'google') {
            const response = await googleAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            text = response.text || "[]";
        } else {
            text = await sendMessageToGemini(prompt);
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        return JSON.parse(text);
    } catch (e) {
        return [];
    }
};

export const fetchPhoneSpecs = async (modelName: string): Promise<Partial<Product> | null> => {
    const prompt = `
        Extract FULL technical specs for: "${modelName}".
        Return JSON object matching this structure EXACTLY:
        {
            "brand": "String",
            "price": Number (KWD estimate),
            "description": "Marketing text",
            "colors": ["Color1", "Color2"],
            "storageOptions": ["128GB", "256GB"],
            "specs": {
                "Screen": "...", "Processor": "...", "Ram": "...", "Storage": "...", 
                "Camera": "...", "Battery": "..."
            },
            "seo": { "metaTitle": "...", "metaDescription": "...", "keywords": [] }
        }
        Return ONLY JSON.
    `;

    try {
        let text = "";
        if (APP_CONFIG.aiProvider === 'google') {
            const response = await googleAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            text = response.text || "{}";
        } else {
             text = await sendMessageToGemini(prompt);
             text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating specs:", error);
        return null;
    }
};
