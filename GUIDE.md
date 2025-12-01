
# LAKKI PHONES - Application Guide

Welcome to the LAKKI PHONES e-commerce platform. This guide helps developers and admins understand the architecture, data management, and AI features.

## 🚀 Getting Started

### 1. Configuration
The application behavior is controlled by `config.ts`.
- **`useMockData`**: Set to `true` to load sample products (iPhones, Samsungs, etc.) on first load. Set to `false` to start with an empty inventory for real-world testing.
- **`storeName`**: Update your store branding here.

### 2. Admin Access
To access the Admin Dashboard:
- **URL**: `/admin` (or click "Log In" then "Quick Admin Login" for testing)
- **Super Admin**: `ahmed@lakkiphones.com` / `admin123`

### 3. Real Data Testing
To switch to real data:
1. Open `config.ts`.
2. Set `useMockData: false`.
3. Clear your browser's Local Storage (Application tab in DevTools) to remove any cached mock data.
4. Refresh the page. The store will be empty.
5. Go to Admin Dashboard -> Products -> Add Product.
6. Use the **AI Auto-Fill** features to quickly populate your real inventory.

---

## 🤖 AI Features (Gemini Powered)

### Product Manager (Admin)
- **Fetch Specs**: Enter a model name (e.g., "iPhone 15 Pro") and click "Auto-Fill". The AI acts as a GSMArena scraper to fill technical specs.
- **Fetch Images**: Click "Media" -> "Fetch from Web". The AI uses Google Search Grounding to find real image URLs.
- **AI SEO**: Click "SEO" -> "Generate with AI" to create high-converting meta titles and descriptions.
- **Variant Matrix**: Use the "Attribute Builder" to define colors/storage, then click "Generate Matrix" to create all SKU combinations instantly.

### Shopping Assistant (User)
- **Lumi Chat**: Click the sparkle icon bottom-right. Ask questions like "Compare iPhone 15 and S24" or "Best phone under 200 KWD".

---

## 📂 Project Structure

- **`components/admin/`**: Dashboard widgets (Product Manager, Order Kanban, etc.).
- **`services/geminiService.ts`**: All AI logic. Handles 403 errors by using `gemini-2.5-flash` for search grounding.
- **`context/ShopContext.tsx`**: Central state management (Cart, User, Products). Persistence via LocalStorage.
- **`data/products.ts`**: The mock data source (only used if `useMockData` is true).

## 🛠 Troubleshooting

**Error: Permission Denied (403) when fetching images**
- This occurs if the API key does not have access to `gemini-3-pro-image-preview` or the `googleSearch` tool.
- **Fix**: The code has been updated to use `gemini-2.5-flash` which generally has broader access to tools. Ensure your API Key is valid and has billing enabled if required for search tools.

**Data not saving?**
- The app uses `localStorage` for persistence. If you clear cache, data is lost. For production, connect `ShopContext` to a real backend (Supabase/Firebase).

