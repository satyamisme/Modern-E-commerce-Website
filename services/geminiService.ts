
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Product } from "../types";
import { PRODUCTS } from "../data/products";
import { APP_CONFIG } from "../config";

// --- GOOGLE SDK SETUP ---
// Note: process.env.API_KEY is assumed to be available.
const googleAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- OPENAI COMPATIBLE FETCH (Grok, DeepSeek, Perplexity, OpenAI) ---
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

export const generateSEO = async (
    productName: string, 
    description: string,
    price?: number,
    brand?: string,
    specs?: any,
    colors?: string[]
): Promise<{ metaTitle: string, metaDescription: string, keywords: string[] } | null> => {
    try {
        const specsStr = specs ? JSON.stringify(specs) : "";
        const priceStr = price ? `${price} KWD` : "";
        const colorStr = colors && colors.length > 0 ? `Available Colors: ${colors.join(', ')}` : "";
        
        const prompt = `
            Act as a Senior E-commerce SEO Specialist.
            Generate high-converting JSON metadata for: "${productName}" (${brand || ''}).
            
            Context:
            - Price: ${priceStr}
            - Colors: ${colorStr}
            - Specs: ${specsStr}
            - Base Description: "${description.substring(0, 200)}..."

            Requirements:
            1. Meta Title: Engaging, includes "${productName}", "Kuwait", and a hook (e.g. "Best Price", "Official"). Max 60 chars.
            2. Meta Description: Persuasive sales copy. MUST include the price (${priceStr}) if available. Mention available colors (${colorStr}). Mention USPs like "Free Delivery", "Official Warranty". Max 160 chars.
            3. Keywords: 8-10 high-traffic keywords (English & Arabic transliterated if relevant) for Kuwait electronics market.

            Output Format (Strict JSON):
            {
                "metaTitle": "Title",
                "metaDescription": "Description",
                "keywords": ["k1", "k2"]
            }
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
export const findProductImage = async (query: string): Promise<string[]> => {
    if (APP_CONFIG.aiProvider !== 'google') {
        console.warn("Image fetching requires Google Provider for Search Grounding.");
        return [];
    }

    try {
        // Query adjusted to get more variety for selection
        const response = await googleAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find 10 distinct, high-quality public image URLs for: "${query}".
            Include a mix of:
            1. Official marketing renders (white background).
            2. Lifestyle shots.
            3. Specific color variants if mentioned in query.
            4. Back and side views.
            
            Return ONLY a raw JSON array of strings: ["url1", "url2", "url3"].`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        let urls: string[] = [];
        
        // Strategy 1: Grounding Metadata
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    const uri = chunk.web.uri;
                    if (uri.match(/\.(jpg|png|webp|jpeg)(\?.*)?$/i) || uri.includes('images') || uri.includes('photo')) {
                        urls.push(uri);
                    }
                }
            });
        }
        
        // Strategy 2: Parse text
        if (response.text) {
             try {
                const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
                const match = cleaned.match(/\[.*\]/s);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    if (Array.isArray(parsed)) {
                        urls = [...urls, ...parsed.filter(u => typeof u === 'string' && u.startsWith('http'))];
                    }
                }
             } catch (e) {
                 const urlRegex = /(https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp))/gi;
                 const matches = response.text.match(urlRegex);
                 if (matches) {
                     urls = [...urls, ...matches];
                 }
             }
        }
        
        // Return more results for selection
        return Array.from(new Set(urls)).slice(0, 12);
    } catch (error: any) {
        console.error("Error fetching images:", error);
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
        Organize them EXACTLY like GSMArena standard categories.
        
        Required Categories:
        - Network (Technology, Bands)
        - Launch (Announced, Status)
        - Body (Dimensions, Weight, Build, SIM)
        - Display (Type, Size, Resolution, Protection)
        - Platform (OS, Chipset, CPU, GPU)
        - Memory (Card slot, Internal)
        - Main Camera (Modules, Features, Video)
        - Selfie Camera (Modules, Features, Video)
        - Sound (Loudspeaker, 3.5mm jack)
        - Comms (WLAN, Bluetooth, GPS, NFC, USB)
        - Features (Sensors)
        - Battery (Type, Charging)
        - Misc (Colors, Models)

        Output strictly valid JSON.
        Structure:
        {
            "brand": "String",
            "category": "Smartphones" | "Tablets" | "Wearables" | "Audio" | "Accessories",
            "price": Number (KWD estimate),
            "description": "Marketing text (150 chars)",
            "colors": ["Color1", "Color2"],
            "storageOptions": ["128GB", "256GB"],
            "specs": {
                "Network": { "Technology": "..." },
                "Display": { "Type": "...", "Size": "...", "Resolution": "..." },
                "Platform": { "OS": "...", "Chipset": "..." },
                "Memory": { "Internal": "..." },
                "Main Camera": { "Modules": "...", "Video": "..." },
                "Battery": { "Type": "...", "Charging": "..." }
                // ... include all other categories
            },
            "seo": { "metaTitle": "...", "metaDescription": "...", "keywords": [] }
        }
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
        }
        
        // Robust cleaning for JSON
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Validation check
        const parsed = JSON.parse(cleaned);
        if (!parsed.brand && !parsed.specs) return null;
        return parsed;
    } catch (error) {
        console.error("Error generating specs:", error);
        return null;
    }
};
