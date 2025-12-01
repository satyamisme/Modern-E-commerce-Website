
export type AIProvider = 'google' | 'openai' | 'grok' | 'perplexity' | 'deepseek';

export const APP_CONFIG = {
  // --- DATA SOURCE CONFIGURATION ---
  // Set to 'false' to load an empty store for production/real data entry.
  // Set to 'true' to load sample iPhones/Samsungs/etc. for testing.
  useMockData: true, 
  
  storeName: "LAKKI PHONES",
  currency: "KWD",
  
  // Contact Info
  supportEmail: "support@lakkiphones.com",
  supportPhone: "1800-LAKKI",
  
  // AI Configuration
  // Options: 'google', 'grok', 'deepseek', 'perplexity', 'openai'
  // Note: 'google' is recommended for Image Search capabilities.
  aiProvider: 'google' as AIProvider, 
  
  // API Keys should ideally be in process.env, but we map endpoints here
  aiEndpoints: {
    google: 'https://generativelanguage.googleapis.com', 
    openai: 'https://api.openai.com/v1',
    grok: 'https://api.x.ai/v1',
    perplexity: 'https://api.perplexity.ai',
    deepseek: 'https://api.deepseek.com'
  },

  // Default SEO
  defaultMetaTitle: "LAKKI PHONES | Premium Mobile Store Kuwait",
  defaultMetaDescription: "Kuwait's premium mobile e-commerce experience featuring exclusive deals and fast delivery.",
  
  // Store Settings
  taxRate: 0,
  deliveryFee: 5,
  freeShippingThreshold: 50
};
