
# 📜 Changelog

All notable changes to the **LAKKI PHONES** project will be documented in this file.

## [1.0.0] - 2024-05-20 (Gold Master)
### 🚀 Released
- **Production Ready**: Full feature set verified and deployed.
- **Documentation**: Added comprehensive `GUIDE.md` and `PLAN.md`.

### ✨ Added
- **Hardware Integration**:
    - **Camera Scanner**: Native HTML5 barcode detection with audio beep feedback.
    - **USB Scanner**: Keyboard listener mode for rapid inventory entry.
    - **Label Printing**: Dedicated formatting for 38x25mm and 50x30mm thermal labels.
- **Supplier Management**: New module to track wholesalers, retailers, and contact details.
- **Printing Center**: Central hub for bulk label generation and invoice archiving.
- **Bulk Operations**:
    - **CSV Import**: Parse and upsert hundreds of products.
    - **Batch Stock Entry**: Paste list of 50+ IMEIs to instantly populate inventory.
- **Offline Resilience**:
    - **Smart Fallback**: Auto-detects network/db failure and switches to LocalStorage.
    - **Admin Access**: "Force Offline" mode ensures admins are never locked out of the dashboard.

### 🛠 Fixed
- **Admin Routing**: Fixed "Page Not Found" errors on refresh by normalizing URL parameters.
- **Login Loop**: Resolved issue where "Quick Login" would fail if the online password differed from local.
- **Infinite Loading**: Added safety timeouts to the initial data fetch to prevent white screens.
- **Mobile Layout**: Fixed sidebar overlap and z-index issues on small screens.

---

## [0.9.0] - 2024-05-19 (Enterprise Beta)
### ✨ Added
- **Inventory Tracking**:
    - **IMEI Serialization**: Track individual unit cost, condition, and status.
    - **Transfer Logs**: Audit trail for stock movement between warehouses.
    - **Purchase Orders**: Full procurement workflow (Draft -> Ordered -> Received).
- **Admin Dashboard v2**:
    - **Real-time Charts**: Replaced mock data with live Recharts analytics.
    - **AI Insights**: Dynamic text generation based on stock levels and sales trends.
    - **System Health**: Panel to monitor Supabase connection status.

### 🔄 Changed
- **Database Schema**: Hardened SQL definitions with quoted identifiers (`"camelCase"`) to match TypeScript interfaces perfectly.
- **Navigation**: Moved Admin Sidebar to a collapsible mobile-friendly drawer.

---

## [0.8.0] - 2024-05-18 (Backend Integration)
### ✨ Added
- **Supabase Integration**:
    - Connected `ShopContext` to PostgreSQL backend.
    - Implemented Real-time Subscriptions (WebSockets) for Orders and Inventory.
- **Authentication**:
    - Replaced mock login with Supabase Auth (Email/Password).
    - Added Role-Based Access Control (RBAC) middleware.
- **Database Seeding**: One-click "Seed Demo Data" button to populate empty databases.

---

## [0.5.0] - 2024-05-15 (Commerce Core)
### ✨ Added
- **Storefront UI**:
    - Hero Slider with admin controls.
    - Live Product Ticker (Marquee).
    - Advanced Filters (Brand, Price, Specs).
- **Checkout Flow**:
    - Cart Drawer with Free Shipping calculator.
    - Multi-step Checkout (Address -> Payment -> Confirmation).
    - **WhatsApp Checkout**: Direct integration to send orders via WhatsApp API.
- **Product Details**:
    - Variant Selection Logic (Color/Storage dependency).
    - AI-generated Specification Tables.

---

## [0.1.0] - 2024-05-01 (Prototype)
### ✨ Added
- Initial React + Vite setup.
- Tailwind CSS configuration.
- Basic mock data structure.
