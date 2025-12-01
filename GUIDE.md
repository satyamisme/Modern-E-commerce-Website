
# LAKKI PHONES - Administrator & Developer Guide

**Version**: 2.1 (Multi-Provider AI & Config Support)

Welcome to the LAKKI PHONES platform! This guide covers everything from initial setup to managing your inventory with AI.

---

## 🚀 1. Configuration & Setup

### **Config.ts: The Control Center**
The file `config.ts` located in the root (or src) is the main control center.

#### **How to Switch to Real Data (Remove Mock Data)**
To start with a clean database for production:
1. Open `config.ts`.
2. Change `useMockData: true` to `useMockData: false`.
3. Refresh the app. The inventory will be empty, ready for you to import CSVs or add products manually.

#### **How to Switch AI Providers**
You can use Google, Grok, DeepSeek, or OpenAI.
1. Open `config.ts`.
2. Change `aiProvider` to one of: `'google'`, `'grok'`, `'deepseek'`, `'perplexity'`, `'openai'`.
3. **Important**: You must provide the corresponding API Key in your environment variables.

---

## 🤖 2. AI Setup & API Keys

The app reads the API Key from `process.env.API_KEY`.

### **Supported Providers**

| Provider | Config Value | Best For | Notes |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | `'google'` | **Images**, Speed, Free Tier | **Recommended**. Supports Image Search. |
| **Grok (xAI)** | `'grok'` | Witty Copy, Live Info | Good for text descriptions. |
| **DeepSeek** | `'deepseek'` | Logic, JSON | Very cost-effective. |
| **Perplexity** | `'perplexity'`| Live Search | Great for up-to-date specs. |

### **Fixing "Permission Denied" (403) Errors**
If you see a 403 error when fetching images:
1. Ensure you are using the **Google** provider (`aiProvider: 'google'`).
2. Ensure your API Key has access to **Google Search Grounding**.
3. If on a free tier that doesn't support Search, the app will gracefully fallback to manual upload or placeholder images.

---

## 🛠 3. Admin Dashboard Workflow

Access the dashboard at `/admin`.

### **Adding a New Product (The AI Way)**
1.  Click **"+ Add Product"**.
2.  **Basic Info**: Enter the **Model Name** (e.g., "Samsung S24 Ultra").
3.  **Specs**: Go to the *Specifications* tab and click **"Auto-Fill with AI"**. The system will fetch technical details automatically.
4.  **Media**: Go to the *Media* tab and click **"AI Search"**. It will attempt to find official product images.
5.  **Variants**: 
    *   Go to *Variants & Stock*.
    *   Add Colors (e.g., "Titanium Gray") and Storage options.
    *   Click **"Generate Matrix"** to create all SKUs.
    *   Use **Smart Modifiers** to bulk-update prices (e.g., "Add 50 KWD for 1TB models").
6.  **SEO**: Go to *SEO* tab and click **"Generate with AI"** for optimized meta tags.

### **Inventory Management**
- **Warehouses**: Go to *Inventory* tab -> *Manage Stores*. You can add real physical shop locations.
- **Transfers**: Click "Transfer" on any product row to move stock between shops.

---

## 🎨 4. Frontend & Customization

### **Theme Colors**
The app uses Tailwind CSS. You can change the brand colors in `index.html` inside the `tailwind.config` script:
- `primary`: Main brand color (currently Navy Blue).
- `secondary`: Accent color (currently Gold).

### **Homepage Management**
To feature products on the homepage:
1. Go to Admin -> Product Editor.
2. Go to **Storefront** tab.
3. Toggle **"Hero Slider"**, **"Featured Rail"**, or **"Scrolling Ticker"**.

---

## 📱 5. Troubleshooting

**Q: My changes aren't saving?**
A: This demo uses `localStorage`. If you clear your browser cache, data resets. For production, connect the `ShopContext` to a database like Supabase.

**Q: Images are broken?**
A: Ensure your internet connection allows access to Unsplash or the URLs returned by the AI.

**Q: AI is slow?**
A: Generative AI can take 2-5 seconds. We have added loading spinners to indicate progress.
