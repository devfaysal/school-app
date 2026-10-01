# School App (Lightweight Mobile & Web Portal)

A high-performance, responsive Single-Page Application (SPA) built for students, parents, and teachers.
Can be hosted for **free on static hosting** (Cloudflare Pages, Vercel, Netlify) or packaged as an **Android APK / Google Play Store App** using Capacitor or TWA.

---

## 🚀 Features

- **School Discovery**: Connect to any school tenant via subdomain or school code (e.g. `dhakamodel`).
- **Sanctum Authentication**: Secure login with JWT/Sanctum bearer token.
- **Attendance Record & QR Scanner**:
  - Live in-browser / in-app camera QR code scanner powered by `html5-qrcode`.
  - Point phone camera to scan attendance code and record attendance instantly.
- **Notices Board**: Real-time school and class announcements with full modal previews.
- **Fee Invoices**: View pending, paid, and overdue fee invoices.
- **PWA Ready**: Works offline/online, installable on iOS (Safari "Add to Home Screen") and Android without app store review.
- **Ultra-lightweight**: Total compressed build size is ~125 kB.

---

## 🛠️ Tech Stack

- **Framework**: Vanilla JS + [Alpine.js](https://alpinejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Camera QR Scanner**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- **Backend API**: Connects to the Central & Tenant Laravel SaaS API (`school.test` or production domain)

---

## 💻 Local Development

```bash
cd /var/www/school-app
npm install
npm run dev
```

Visit the local server (default: `http://localhost:3000`).

---

## 📦 Production Static Build

To build the static distribution for deployment:

```bash
npm run build
```

This compiles everything into the `/var/www/school-app/dist` folder:
- Upload the `dist/` folder directly to **Cloudflare Pages**, **Vercel**, **Netlify**, or AWS S3.
- Build command: `npm run build`
- Output directory: `dist`

---

## 📱 Publishing to Google Play Store (via Capacitor)

To convert this static web portal into an Android APK / Android App Bundle (`.aab`) for the Google Play Store:

```bash
cd /var/www/school-app

# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init "School Portal" com.campuscontrol.portal --web-dir dist

# 3. Add Android platform
npx cap add android

# 4. Sync web build
npm run build
npx cap sync

# 5. Open in Android Studio to build APK or signed AAB for Play Store
npx cap open android
```

---

## 🌐 API Configuration

By default in local development, the app connects to `http://school.test`.
To change the Central API endpoint in production:
- Tap the **Settings icon (gear)** on the initial school discovery screen.
- Or set `localStorage.setItem('cc_central_url', 'https://yourdomain.com')`.
