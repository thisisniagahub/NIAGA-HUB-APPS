# 🌶️ ABANG COLEK - Master Repository Guide

> **Complete overview of all Abang Colek projects, repositories, and ecosystem**
>
> **Last Updated:** 2026-01-17 | **Maintained by:** Liurleleh House

---

## 🗂️ Repository Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          ABANG COLEK ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────────┐     ┌──────────────────┐     ┌────────────────┐ │
│   │   BRAND OS       │     │  WOCS EXTENSION  │     │  WOCS SERVER   │ │
│   │   (React PWA)    │     │  (Chrome Ext)    │     │  (Node.js)     │ │
│   │                  │     │                  │     │                │ │
│   │  • Dashboard     │     │  • Analytics     │     │  • Webhook     │ │
│   │  • Events        │     │  • AI Engine     │     │  • Parser      │ │
│   │  • TikTok        │     │  • Dev Console   │     │  • Queue       │ │
│   │  • Booth Ops     │     │  • MCP Bridge    │     │  • Executors   │ │
│   └────────┬─────────┘     └────────┬─────────┘     └───────┬────────┘ │
│            │                        │                       │          │
│            └────────────────────────┼───────────────────────┘          │
│                                     │                                  │
│                          ┌──────────▼──────────┐                       │
│                          │   WHATSAPP / META   │                       │
│                          │     CLOUD API       │                       │
│                          └─────────────────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Repository Matrix

| Project | Type | Stack | GitHub | Status |
|---------|------|-------|--------|--------|
| **Brand OS** | Web App | React 19 + TypeScript + Vite | [abang-colek-os](https://github.com/thisisniagahub/abang-colek-os) | ✅ Production |
| **WOCS Extension** | Chrome Extension | Vanilla JS + CSS | [abang-colek-wocs](https://github.com/thisisniagahub/abang-colek-wocs) | ✅ Production |
| **WOCS Server** | Backend API | Node.js + Express + TypeScript | Local (Ready to Deploy) | 🔧 Development |
| **Mobile App** | Mobile | React Native | TBD | 📋 Planned |

---

## 📁 Directory Structure

```text
H:\ANTIGRAVITY\ABANG-COLEK\
│
├── 📂 abang-colek-brand-os/          ← MAIN WEB APP
│   ├── 📂 src/
│   │   ├── 📂 components/features/   # Dashboard, Events, TikTok, etc.
│   │   ├── 📂 components/layout/     # Header, Sidebar, Navigation
│   │   ├── 📂 context/               # React Context providers
│   │   ├── 📂 lib/                   # Utilities
│   │   └── 📄 App.tsx                # Main entry
│   ├── 📂 docs/                      # Documentation
│   │   ├── 📄 BRANDKIT.md            # Complete brand guidelines
│   │   ├── 📄 WOCS_SPEC.md           # WhatsApp bot specification
│   │   └── 📄 ...
│   ├── 📄 package.json
│   └── 📄 README.md
│   └── 🔗 Git: https://github.com/thisisniagahub/abang-colek-os
│
├── 📂 abang-colek-wocs-extension/    ← CHROME EXTENSION
│   ├── 📂 content/
│   │   ├── 📄 content.js             # Main injection script
│   │   └── 📄 styles.css             # Panel styling
│   ├── 📂 popup/
│   │   └── 📄 popup.html             # Extension popup
│   ├── 📂 background/
│   │   └── 📄 service-worker.js      # Background script
│   ├── 📄 manifest.json              # Chrome Manifest V3
│   └── 📄 README.md
│   └── 🔗 Git: https://github.com/thisisniagahub/abang-colek-wocs
│
├── 📂 wocs-server/                   ← BACKEND SERVER
│   ├── 📂 src/
│   │   ├── 📂 routes/
│   │   │   ├── 📄 webhook.ts         # WhatsApp webhook handler
│   │   │   └── 📄 api.ts             # REST API endpoints
│   │   ├── 📂 services/
│   │   │   ├── 📄 commandParser.ts   # Command parsing
│   │   │   ├── 📄 taskQueue.ts       # Task management
│   │   │   └── 📄 executors.ts       # Task executors
│   │   ├── 📄 index.ts               # Server entry
│   │   └── 📄 types.ts               # TypeScript types
│   ├── 📄 package.json
│   └── 📄 README.md
│   └── 🔗 Git: Local (deploy to Railway/Render)
│
├── 📂 abang-colek-mobile/            ← MOBILE APP (Planned)
│
├── 📂 WAWCD/                         ← Legacy/Archive
│
└── 📄 REPOS.md                       ← THIS FILE
```

---

## 🚀 Quick Start Commands

### Brand OS (Web Dashboard)

```powershell
cd H:\ANTIGRAVITY\ABANG-COLEK\abang-colek-brand-os

# Install & Run
npm install
npm run dev

# Build for Production
npm run build

# Preview Build
npm run preview
```

**Access:** <http://localhost:5173>

---

### WOCS Extension (Chrome)

```powershell
cd H:\ANTIGRAVITY\ABANG-COLEK\abang-colek-wocs-extension

# No build needed - load directly in Chrome
```

**Installation:**

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `abang-colek-wocs-extension` folder
5. Open `web.whatsapp.com`

---

### WOCS Server (Backend)

```powershell
cd H:\ANTIGRAVITY\ABANG-COLEK\wocs-server

# Install & Run
npm install
npm run dev

# Build for Production
npm run build
npm start
```

**Access:** <http://localhost:3000>

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/webhook` | GET | Webhook verification |
| `/webhook` | POST | Receive WhatsApp messages |
| `/api/tasks` | GET | List tasks |
| `/api/status` | GET | System status |
| `/api/help` | GET | Command reference |

---

## 🔧 Git Operations

### Clone All Repositories

```powershell
# Create workspace
mkdir H:\ANTIGRAVITY\ABANG-COLEK
cd H:\ANTIGRAVITY\ABANG-COLEK

# Clone Brand OS
git clone https://github.com/thisisniagahub/abang-colek-os.git abang-colek-brand-os

# Clone WOCS Extension
git clone https://github.com/thisisniagahub/abang-colek-wocs.git abang-colek-wocs-extension
```

### Push Changes

```powershell
# Brand OS
cd abang-colek-brand-os
git add -A && git commit -m "your message" && git push

# WOCS Extension
cd abang-colek-wocs-extension
git add -A && git commit -m "your message" && git push
```

---

## 🎯 Feature Summary

### Brand OS Features

| Module | Description | Status |
|--------|-------------|--------|
| Dashboard | Bento-style metrics overview | ✅ |
| Brand Editor | Pitch deck, manifesto, SOP | ✅ |
| Event Pipeline | Booking, EO contacts, tracking | ✅ |
| Booth Ops | Checklists, inventory, POS | ✅ |
| TikTok Engine | Hook bank, content calendar | ✅ |
| Reviews | Post-event KPIs | ✅ |

### WOCS Extension Features

| Panel | Description | Status |
|-------|-------------|--------|
| Analytics | Real-time chat stats | ✅ |
| Templates | Quick reply templates | ✅ |
| Export | CSV contact export | ✅ |
| Broadcasts | Bulk messaging | ✅ |
| Audience | Contact management | ✅ |
| Tools | wa.me link generator | ✅ |
| Developer Console | DOM explorer, JS console | ✅ |
| AI Engine | OpenAI/Claude/Gemini | ✅ |
| MCP Bridge | Server connection | ✅ |

### WOCS Server Features

| Component | Description | Status |
|-----------|-------------|--------|
| Webhook Handler | Meta Cloud API receiver | ✅ |
| Command Parser | `/agent`, `/landing`, etc. | ✅ |
| Task Queue | Priority-based execution | ✅ |
| Executors | Agent, Landing, TikTok, Report | ✅ |

---

## 🔐 Environment Variables

### WOCS Server (.env)

```env
# WhatsApp Cloud API
WHATSAPP_TOKEN=your_meta_access_token
PHONE_NUMBER_ID=your_phone_number_id
WEBHOOK_VERIFY_TOKEN=wocs_verify_2026

# Admin Numbers (comma-separated with country code)
ADMIN_NUMBERS=60191234567,60181234567

# Server
PORT=3000
NODE_ENV=development
```

### WOCS Extension (chrome.storage)

```javascript
// AI Config
wocsAIConfig: { provider: 'openai', apiKey: '...' }

// MCP Server
wocsMCPServer: { url: '...', transport: 'sse' }
```

---

## 📞 Support & Contact

| Channel | Details |
|---------|---------|
| **TikTok** | [@styloairpool](https://tiktok.com/@styloairpool) |
| **Instagram** | @abangcolek |
| **GitHub** | [thisisniagahub](https://github.com/thisisniagahub) |

---

## ⚠️ Important Rules

1. **Each folder = separate Git repo** - Don't git from parent folder
2. **Always cd first** - Navigate to correct folder before git commands
3. **Keep secrets safe** - Never commit `.env` files
4. **Backup regularly** - Use export features in Brand OS

---

<p align="center">
  <strong>🌶️ Rasa Padu, Pedas Menggamit 🌶️</strong><br/>
  <sub>Built with ❤️ by Liurleleh House</sub>
</p>
