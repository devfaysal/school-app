# AI Agent Guidelines — School App

This repository contains **School App**, a lightweight, high-performance Single-Page Application (SPA) and Progressive Web App (PWA) designed for students, parents, and teachers. It connects to the Central & Tenant Laravel SaaS backend (`CampusControl`).

---

## 🏗️ Tech Stack & Architecture

- **Runtime & Build Tool**: Node.js, [Vite 6](https://vitejs.dev/) (`@tailwindcss/vite`, ES Modules)
- **Frontend Framework**: [Alpine.js v3](https://alpinejs.dev/) + Vanilla JavaScript (lightweight, zero virtual DOM overhead)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@import "tailwindcss";` in `src/style.css`
- **Hardware Integration**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) for camera QR-code attendance scanning
- **PWA & Mobile Ready**: Installable PWA with web app manifest and icons, compatible with Capacitor/TWA for Android APK/AAB packaging
- **Backend API**: Multi-tenant Laravel API using Sanctum token authentication

---

## 📁 Project Structure

```
/var/www/school-app/
├── public/
│   ├── .htaccess          # SPA rewrite rules for Apache/cPanel deployment
│   ├── icon.svg           # Application brand icon
│   └── manifest.json      # PWA Web App Manifest
├── src/
│   ├── api.js             # Central & Tenant API client, localStorage auth persistence
│   ├── main.js            # Alpine.js root application component, view routing & logic
│   ├── scanner.js         # Camera QR code scanner lifecycle controller
│   └── style.css          # Tailwind CSS v4 entrypoint
├── index.html             # Single-page UI templates and Alpine.js layout
├── package.json           # Dependencies and build scripts
├── vite.config.js         # Vite configuration with Tailwind CSS v4 plugin
├── .gitignore             # Ignored directories (dist/, node_modules/, env, etc.)
└── README.md              # Project documentation and build instructions
```

---

## ⚙️ Development Workflow & Commands

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start local development server (Vite) |
| `npm run build` | Build static production bundle into `dist/` |
| `npm run preview` | Locally preview production build |

### Verification Rule
- Whenever you modify code (JS, HTML, CSS, configs), **always verify that the build passes** by running:
  ```bash
  npm run build
  ```
- Do not check in or commit files inside `dist/` or `node_modules/`.

---

## 🧩 Architectural Conventions & Guidelines

### 1. State Management & Alpine.js
- The primary application controller is in `src/main.js` registered as an Alpine component: `Alpine.data('app', () => ({ ... }))`.
- Markup templates and UI bindings reside in `index.html` using declarative Alpine directives (`x-data`, `x-show`, `x-if`, `x-for`, `x-model`, `@click`).
- Keep state reactive and cleanly structured. Do not introduce heavyweight state libraries (e.g. Redux, Vuex).
- Always clean up event listeners and timers when components or views transition.

### 2. Multi-Tenant API Communication (`src/api.js`)
- **Central API**: Used for tenant discovery via `/api/tenant/discover`. Default is `http://school.test` locally, configurable via localStorage (`cc_central_url`).
- **Tenant API**: Once discovered, each school has its own endpoint (`tenantApiUrl(...)`).
- **Authentication**: Uses Sanctum Bearer tokens stored in `localStorage` under `cc_token`. User profile and active school tenant are stored under `cc_user` and `cc_school`.
- **Local Dev vs Production**: `src/api.js` automatically normalizes `.localhost` subdomains to `.school.test` during local testing. Preserve this behavior when editing network logic.
- Always handle API exceptions with clear, user-friendly error banners or messages.

### 3. QR Attendance Scanner (`src/scanner.js`)
- `scanner.js` wraps `html5-qrcode` to safely acquire camera permissions and stream video.
- Always ensure `stopScanner()` is invoked when closing modals, navigating away from the attendance screen, or unmounting to release camera resources.
- Handle permission denial gracefully with informative UI prompts.

### 4. Tailwind CSS v4 Styling
- Tailwind CSS v4 is utilized via the `@tailwindcss/vite` plugin.
- Note that v4 uses `@import "tailwindcss";` in `src/style.css` without requiring a legacy `tailwind.config.js`.
- Design mobile-first using modern Tailwind responsive utilities (`sm:`, `md:`, `lg:`).
- Keep animations light and touch-friendly (tap target sizes >= 44x44px).

### 5. PWA & Static Hosting
- All routing is handled client-side within `index.html`.
- Any new public assets must be placed in `public/` to be served statically.
- Keep the bundled output lightweight (~150 kB compressed target).

---

## 🤖 Instructions for AI Agents

1. **Inspect before editing**: Read existing files before making modifications to respect variable naming and design conventions.
2. **Minimal changes**: Keep edits surgical and relevant to the user's prompt. Do not reformat unrelated files.
3. **Build verification**: Always run `npm run build` to confirm there are no syntax, import, or build regressions.
4. **No secrets in git**: Never commit `.env` files, credentials, private API keys, or build artifacts (`dist/`).
5. **Git commit convention**: Use clear, concise commit messages adhering to standard format (e.g., `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`).
