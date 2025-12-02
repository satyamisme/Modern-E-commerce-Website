
# 📘 LAKKI PHONES - The Complete Manual

**Version**: 1.0.0 (Production Release)
**Tech Stack**: React 19, TypeScript, Tailwind CSS, Supabase, Google Gemini AI.

---

## 📑 Table of Contents
1.  [Introduction](#1-introduction)
2.  [Prerequisites](#2-prerequisites)
3.  [Local Development Setup](#3-local-development-setup)
4.  [Database Setup (Supabase)](#4-database-setup-supabase)
    *   [Online Cloud Setup](#online-cloud-setup)
    *   [Offline Mode](#offline-mode)
5.  [Deployment Guide](#5-deployment-guide)
    *   [Option A: Vercel / Netlify (Recommended)](#option-a-vercel--netlify)
    *   [Option B: Docker (Containerization)](#option-b-docker)
    *   [Option C: VPS (Ubuntu/Nginx)](#option-c-vps-ubuntu--nginx)
6.  [Admin & Hardware Setup](#6-admin--hardware-setup)
7.  [Troubleshooting](#7-troubleshooting)

---

## 1. Introduction
LAKKI PHONES is a full-stack e-commerce platform designed for electronics retailers. It features a **Hybrid Architecture** allowing it to work with a cloud database (Supabase) or entirely offline (LocalStorage). It includes advanced features like IMEI tracking, AI-powered product entry, and barcode scanning.

---

## 2. Prerequisites
Before starting, ensure you have:
*   **Node.js** (v18 or higher) installed.
*   **Git** installed.
*   A **Supabase** account (Free tier is fine).
*   **Google Gemini API Key** (for AI features).

---

## 3. Local Development Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-repo/lakki-phones.git
    cd lakki-phones
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root:
    ```env
    API_KEY=your_google_gemini_api_key
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

---

## 4. Database Setup (Supabase)

### **Online Cloud Setup**
To enable real-time features and persistent cloud storage:

1.  **Create Project**: Go to [Supabase.com](https://supabase.com), create a new project.
2.  **Get Credentials**:
    *   Go to **Settings** -> **API**.
    *   Copy `Project URL` and `anon public` key.
    *   Add them to your `.env` file or configure them in the Admin Panel later.
3.  **Run SQL Schema**:
    *   Go to the app's **Admin Dashboard** -> **Configuration** -> **Database**.
    *   Copy the **SQL Script**.
    *   Go to Supabase -> **SQL Editor** -> Paste & Run.
    *   *Result*: This creates tables (`products`, `orders`, `users`, etc.) and sets up security policies.
4.  **Create Storage Bucket**:
    *   Go to Supabase -> **Storage**.
    *   Create a public bucket named `product-images`.
    *   (The SQL script usually handles the policy, but verify the bucket exists).
5.  **Seed Data**:
    *   In the Admin Dashboard -> Config -> Database, click **"Seed Demo Data"**.
    *   This populates the database with sample phones, customers, and shops.

### **Offline Mode**
If you have no internet or no Supabase account:
1.  The app automatically detects connection failure.
2.  It switches to **LocalStorage**.
3.  You can fully use the POS, Inventory, and Admin panel. Data is saved in the browser cache.
4.  *Note*: Data will not sync between different devices in Offline Mode.

---

## 5. Deployment Guide

### **Option A: Vercel / Netlify**
*Best for: Quickest setup, zero maintenance.*

1.  Push your code to **GitHub**.
2.  Log in to **Vercel** or **Netlify**.
3.  **Import Project** from GitHub.
4.  **Environment Variables**: Add `API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel dashboard settings.
5.  **Deploy**.

### **Option B: Docker**
*Best for: Self-hosting, portability.*

1.  **Create `Dockerfile`** in the root:
    ```dockerfile
    # Build Stage
    FROM node:18-alpine as build
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    # Build the app (Vite)
    RUN npm run build

    # Production Stage (Nginx)
    FROM nginx:alpine
    COPY --from=build /app/dist /usr/share/nginx/html
    # Copy custom nginx config if needed for SPA routing
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    ```

2.  **Create `nginx.conf`** (for SPA routing):
    ```nginx
    server {
        listen 80;
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
    }
    ```

3.  **Build & Run**:
    ```bash
    docker build -t lakki-phones .
    docker run -d -p 8080:80 lakki-phones
    ```
    Access at `http://localhost:8080`.

### **Option C: VPS (Ubuntu + Nginx)**
*Best for: Full control, enterprise deployment.*

**Prerequisites**: A VPS (DigitalOcean, Linode, AWS) with Ubuntu 20.04+.

1.  **SSH into Server**:
    ```bash
    ssh root@your_server_ip
    ```

2.  **Install Node & Nginx**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs nginx git
    ```

3.  **Clone & Build**:
    ```bash
    git clone https://github.com/your-repo/lakki-phones.git /var/www/lakki-phones
    cd /var/www/lakki-phones
    npm install
    # Create .env file with nano .env
    npm run build
    ```

4.  **Configure Nginx**:
    ```bash
    sudo nano /etc/nginx/sites-available/lakki
    ```
    Paste this config:
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com;

        root /var/www/lakki-phones/dist;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

5.  **Enable Site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/lakki /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

6.  **SSL (HTTPS) with Certbot**:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

---

## 6. Admin & Hardware Setup

### **Accessing Admin Panel**
*   URL: `/admin` (or click "Admin Dashboard" in footer if logged in).
*   **Super Admin Quick Login**:
    *   Email: `superadmin@lakkiphones.com`
    *   Password: `Aa100200`
    *   Use the "Quick Login" button on the login page for fail-safe access.

### **Barcode Scanner Setup**
1.  **USB Handheld Scanner**:
    *   Plug into USB.
    *   No drivers needed (Human Interface Device).
    *   Go to **Admin** -> **Config** -> **Hardware**.
    *   Test in the "USB Scanner Test" box.
    *   Ensure the scanner is configured to send an "Enter" key after scanning (standard setting).

2.  **Camera Scanner**:
    *   Go to **Admin** -> **Config** -> **Hardware**.
    *   Click "Detect Cameras".
    *   Select your preferred camera (Back Camera / Webcam) as Default.
    *   In **Inventory Manager**, click the Camera icon to start scanning.

### **Printer Setup**
*   **Label Printer (Barcode)**:
    *   Supported Sizes: 38x25mm (Standard Price Tag), 50x30mm (Large Inventory Label).
    *   Go to **Admin** -> **Printing Center**.
    *   Select products and quantities.
    *   Click "Print Now".
    *   **Browser Print Dialog Settings**:
        *   **Destination**: Select your Label Printer (e.g., Zebra, Brother, Xprinter).
        *   **Paper Size**: Match your label size (e.g., User Defined 38x25mm).
        *   **Margins**: None / Minimum.
        *   **Scale**: 100% (Do not fit to page).
        *   **Headers/Footers**: Uncheck.

*   **Invoice Printer (Thermal Receipt)**:
    *   Go to **Order Kanban** or **Printing Center**.
    *   Click the "Printer" icon on an order.
    *   **Browser Print Dialog Settings**:
        *   **Destination**: Select 80mm Thermal Printer.
        *   **Paper Size**: 80mm Roll.
        *   **Margins**: Minimum.

---

## 7. Troubleshooting

### **"Database Connected but Tables Missing"**
*   **Cause**: You connected to a new Supabase project but haven't run the setup script.
*   **Fix**:
    1.  Go to Admin -> Config -> Database.
    2.  Copy SQL Script.
    3.  Run it in Supabase SQL Editor.
    4.  Click "Re-check".

### **"Permission Denied" for Camera**
*   **Cause**: Browser security blocks camera on non-HTTPS sites (except localhost).
*   **Fix**:
    *   Ensure you are using `https://` if deployed.
    *   Check browser permission settings (Lock icon in address bar).

### **"Invalid Login Credentials"**
*   **Cause**: The online database has a user with the same email but a different password than the hardcoded Quick Login.
*   **Fix**:
    *   Click "Quick Super Admin Login" again. It now has a fallback mechanism to force "Offline Mode" access so you can enter the dashboard and fix settings.

### **Images Not Loading**
*   **Cause**: 403 Forbidden from Unsplash or generic placeholders.
*   **Fix**:
    *   Go to Admin -> Products.
    *   Use the "Media" tab to search and select new images using the AI tool.
    *   Or upload your own images to Supabase Storage.
