
# Startup Operating System (SOS)

**An integrated platform that replaces 20-30 SaaS tools with 17 fully integrated internal modules.**

Built for startup founders, solo entrepreneurs, content creators, and operators who need a unified system to manage their entire business from idea to scale.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

---

## 🎯 Product Vision

The Startup Operating System is a **startup-building machine packaged as a single web application**. It provides:

- **Idea → Validation → Product → Marketing → Sales → Scale → Fundraising**
- **Investor-ready reporting by default**
- **Beautiful, modern, high-impact dark mode UI with deep crimson accents**
- **17 integrated modules** covering every aspect of startup operations

---

## 🏗️ Architecture & Stack

**Frontend:**
- React 18+ with TypeScript (Vite)
- Tailwind CSS (Dark Mode with Crimson Accents)
- Recharts for BI/Analytics
- Framer Motion for premium interactions

**AI & Intelligence:**
- **Google Gemini Pro & Flash**: Reasoning, drafting, and analysis.
- **Google Veo**: Video generation.
- **Imagen 3**: High-fidelity asset generation.
- **Google Search Grounding**: Real-time market data.

**Backend (Hybrid):**
- **Persistence**: Dual-mode architecture.
  - **Local Mode**: Uses `localStorage` for instant, zero-setup demos.
  - **Cloud Mode**: Node.js/Express + Prisma + PostgreSQL scaffold included (`server/server.ts`) for production deployment.
- **Integration**: Model Context Protocol (MCP) for connecting external agents.

---

## 📦 17 Core Modules

### Strategy (The Brain)
1. **Ideation & Innovation Engine** - Capture, evaluate, and validate startup ideas.
2. **Market Research & Competitive Intelligence** - Analyze markets and track competitors.
3. **Strategic Planning & Business Modeling** - Business Model Canvas, SWOT, and OKRs.
4. **Legal & Compliance** - Incorporation partnerships and document vault.

### Execution (The Hands)
5. **Product Development & Roadmapping** - Plan features and manage product roadmap.
6. **Innovation & R&D Lab** - Run experiments and research.

### Growth (The Voice)
7. **Brand, Marketing & Growth Engine** - Run campaigns and create content using GenAI.
8. **Sales Enablement & CRM** - Manage leads and close deals with AI Copilot.
9. **Customer Support & Experience** - Handle customer tickets and support.
10. **Community & Feedback Platform** - Collect and manage user feedback.

### Operations (The Backbone)
11. **Finance, Accounting & Compliance** - Track finances, burn rate, and runway.
12. **Operations & SOPs** - Document processes and procedures.
13. **HR & Talent Management** - ATS and team management.
14. **Supply Chain & Fulfillment** - Manage inventory and supply chain.
15. **Security, Privacy & Risk** - Identify and mitigate risks (SOC2).

### Platform (The Nervous System)
16. **Analytics & Decision Intelligence** - BI Dashboard.
17. **Data Infrastructure & Governance** - Schema management.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud API Key (for AI features)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/startupos.git
   cd startupos
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```bash
   API_KEY=your_gemini_api_key_here
   # Optional: For Backend Mode
   DATABASE_URL="postgresql://user:pass@localhost:5432/startupos"
   ```

4. **Launch Development Server**
   ```bash
   npm run dev
   ```
   Access at `http://localhost:5173`

### Backend (Optional)
To run the Express API server for data migration and file uploads:
```bash
npm run start:api
```

### Demo Credentials
- **Email**: `admin@startupos.com`
- **Password**: `admin123`

---

## 📊 Dashboard

The unified founder dashboard provides:

- **KPI Cards** - Total ideas, active campaigns, open deals, monthly burn
- **Module Shortcuts** - Quick access to all 17 modules
- **Activity Feed** - Recent actions across all modules (Real-time simulation)

---

## 🔐 Authentication & Security

- **OAuth Flow**: Support for Email/Password (Admin seeded).
- **RBAC**: Role-based access control (Founder, Operator, Investor).
- **Audit Logs**: Full immutable record of system actions.

---

## 🤝 Contributing

This is a production-ready scaffold designed for long-term scaling. 

- **State Management**: React Context (`AuthContext`, `TutorialContext`).
- **Services**: All business logic resides in `services/`.
- **UI Components**: Reusable components in `components/ui`.

---

**Built with an architecture-first, modular, and extensible approach following enterprise-grade patterns.**
