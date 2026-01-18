
# StartupOS - Masterplan & Architecture Reference

> **Version:** 1.1 (Voice Integration)
> **Status:** Production Ready
> **Tech Stack:** React 19, Tailwind, Gemini 3.0 AI, Node.js (Express), PostgreSQL

## 1. Product Vision
**StartupOS** is an Integrated Startup Operating System designed to replace the fragmented stack of 20–30 SaaS tools typically used by founders. It consolidates Strategy, Execution, Growth, and Operations into a single "Control Center" powered by Generative AI.

**Core Philosophy:**
1.  **Unified Data:** User data flows between modules (e.g., An idea in "Ideation" auto-creates a roadmap in "Product").
2.  **AI-Native:** AI is the engine, not a bolt-on. It handles reasoning via Gemini 3 Pro and media via Veo 3.1.
3.  **Founder-Centric:** Collapsible high-density UI for maximum focus.

---

## 2. System Architecture

### Frontend (The "Shell")
*   **Framework:** React 19 + Vite.
*   **State:** Context API for Auth, Tutorials, and UI State.
*   **UI System:** Framer Motion driven transitions.

### Data Layer (Hybrid)
*   **Mode A (Browser-First):** `localStorageDb.ts` for instant demos.
*   **Mode B (Cloud-Native):** Express API + Prisma + PostgreSQL.
*   **Migration:** `/api/v1/migrate` for lifting local browser data to cloud.

### Integration Layer
*   **Synapse:** Cross-module data injection logic.
*   **MCP Bridge:** Connects agents to local files, databases, and browser extensions.

---

## 3. UI/UX Standards
1.  **Collapsible Sidebar:** Optimized for "Zen Mode" (icons only) and "Focus Mode" (labels).
2.  **Magic HUD:** Command Palette (Cmd+K) for global navigation.
3.  **Live Presence:** Real-time user indicators and activity feed.
4.  **Live Voice Bridge:** Real-time low-latency audio interaction with Gemini 2.5 Flash.

---

## 4. AI Agent Framework (Manus-Compatible)
*   **Manus Browser Operator:** Native bridge for agentic browser control.
*   **Sales Copilot:** Context-aware email drafting.
*   **Investor Relations:** Autonomous pitch deck generator.

---

## 5. Development Status
- [x] Phase 1-8: Core Suite Delivery.
- [x] Phase 9: Real-world Backend Integration.
- [x] UI Refinement: Collapsible navigation & dynamic layout.
- [x] SDK Hardening: Fixed ContentUnion message validation.
- [x] **Omni-Channel:** Gemini Live API (Voice Agent) implemented.
