
# LAKKI PHONES - Ultimate Developer Guide

**Version**: 2.0 (Multi-Provider AI Supported)

Welcome to the LAKKI PHONES platform! This guide covers everything from setting up multiple AI providers to managing inventory.

---

## 🚀 1. Quick Start

### Configuration
The file `config.ts` is the control center for the application.

- **Toggle Real/Mock Data**: 
  Change `useMockData: true` to `false` to start with an empty inventory for production.

- **Switch AI Provider**:
  Change `aiProvider` to `'google'`, `'grok'`, `'deepseek'`, etc.

### Prerequisites
- Node.js 18+
- An API Key for your chosen AI Provider.

---

## 🤖 2. Multi-Provider AI Setup

LAKKI PHONES supports **any OpenAI-compatible LLM** plus Google Gemini Native.

### Supported Providers & Setup

1.  **Google Gemini** (Default)
    *   **Best For**: Image Search, Fast Text, Multimodal.
    *   **Key**: [aistudio.google.com](https://aistudio.google.com/)
    *   **Config**: `aiProvider: 'google'`

2.  **Grok (xAI)**
    *   **Best For**: Real-time knowledge (if available via API), witty descriptions.
    *   **Key**: [console.x.ai](https://console.x.ai/)
    *   **Config**: `aiProvider: 'grok'`

3.  **DeepSeek**
    *   **Best For**: Coding logic, structured JSON generation, cost-efficiency.
    *   **Key**: [platform.deepseek.com](https://platform.deepseek.com/)
    *   **Config**: `aiProvider: 'deepseek'`

4.  **Perplexity (Sonar)**
    *   **Best For**: Live internet search for specs and pricing.
    *   **Key**: [perplexity.ai](https://www.perplexity.ai/)
    *   **Config**: `aiProvider: 'perplexity'`

### Environment Variables
Ensure your environment has the API key set. The app uses `process.env.API_KEY` for the selected provider.

```env
API_KEY=your_secret_key_here
```

---

## 🛠 3. Admin Dashboard Workflow

Access via `/admin`.

### Adding a New Product with AI
1.  Click **"+ Add Product"**.
2.  Enter the **Model Name** (e.g., "Samsung S24 Ultra").
3.  **Auto-Fill Specs**: Go to the *Specifications* tab and click "Auto-Fill Specs". The AI will fetch technical details.
4.  **Generate Variants**:
    *   Go to *Variants & Stock*.
    *   Add Colors (e.g., "Titanium Gray") and Storage options.
    *   Click **"Generate Matrix"**.
5.  **Smart Modifiers**: Use the bulk tool to set price rules (e.g., "Increase Price by 20 for 512GB").
6.  **SEO**: Go to *SEO* tab and click "Generate with AI" for meta tags.

### Managing Inventory
- Go to the **Inventory** tab to see stock levels across 8 warehouses/shops.
- Click "Transfer" to initiate stock movement (UI only).

---

## 🎨 4. Customization

### Theming
The app uses Tailwind CSS. Colors are defined in `index.html` under `tailwind.config`.
- `primary`: Navy Blue (Brand)
- `secondary`: Gold (Luxury/Heritage)
- `accent`: Coral Red (Action)

### Animations
Custom keyframes (`fade-in`, `slide-up`, `zoom-in`) are defined in `index.html`.

---

## 📱 5. Mobile & PWA
The app is fully responsive. The `BottomNav` component appears only on mobile screens.
