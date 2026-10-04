# 📱 Campus Control Android App

Official Android wrapper for **Campus Control Portal** (`https://campuscontrol.net/portal`).

Powered by **Capacitor 8** and native Android components to provide seamless webview integration, session persistence across multi-tenant school subdomains, hardware back button navigation, and native file download handling for student report cards, ID cards, and fee receipts.

---

## 🏗️ Architecture

- **Host URL**: `https://campuscontrol.net/portal`
- **Subdomain Navigation**: Configured in `capacitor.config.json` to allow all `*.campuscontrol.net` tenant subdomains to stay inside the native app shell.
- **Cross-Domain Cookies**: `CookieManager` is configured in `MainActivity.java` with `setAcceptThirdPartyCookies(true)` so Laravel sessions persist across school redirects.
- **File Downloads**: Uses Android's native `DownloadManager` for PDF downloads (Report cards, vouchers, receipts, ID cards).
- **Target SDK**: Android 16 (API 36 / Android 15 ready), fully compliant with Google Play Store 2026+ requirements.

---

## 🚀 Development & Building

### 1. Install Dependencies
```bash
npm install
```

### 2. Sync Web & Capacitor Config
```bash
npm run sync
```

### 3. Open in Android Studio
```bash
npm run open
```
Or open the `android/` directory directly in Android Studio.

### 4. Automated Cloud Builds (GitHub Actions)
Pushing to the `main` branch automatically triggers `.github/workflows/build-android.yml`:
- Compiles `app-debug.apk` (ready to test on any Android phone).
- Compiles `app-release.aab` (ready to upload to Google Play Console).
- Artifacts can be downloaded directly from GitHub Actions summary page.

---

## 📦 Google Play Store Release Checklist

1. **Google Play Console Account**:
   - Register at [play.google.com/console](https://play.google.com/console).
2. **Signing Keystore**:
   - Generate signing key:
     ```bash
     keytool -genkey -v -keystore campuscontrol-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias campuscontrol
     ```
   - Store securely.
3. **Build Release AAB**:
   ```bash
   npm run build:bundle
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`.
4. **App Content Declarations**:
   - **Privacy Policy**: Provide URL (e.g. `https://campuscontrol.net/privacy`).
   - **App Access Credentials**: Provide reviewer test account (School code, Login, and Password).
   - **Data Safety**: Declare account authentication & student records (encrypted in transit).
