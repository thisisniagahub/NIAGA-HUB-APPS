
export interface TutorialStep {
    id: number;
    title: string;
    content: string;
    route: string;
    actionHint?: string;
    targetId?: string; // ID of the DOM element to highlight
}

export const TUTORIAL_STEPS: TutorialStep[] = [
    // --- INTRO ---
    {
        id: 1,
        title: "Welcome to StartupOS",
        content: "This platform is your command center. It replaces 20+ fragmented tools (Jira, Salesforce, HubSpot, etc.) with one integrated system. Let's take a tour of the entire lifecycle.",
        route: "/",
        actionHint: "Click Next to begin the journey."
    },
    // --- STRATEGY ---
    {
        id: 2,
        title: "Phase 1: Validate Your Idea",
        content: "Before writing code, validate your concept. This module uses Gemini Pro to analyze your value proposition and risks rigorously.",
        route: "/ideation",
        actionHint: "Try typing 'Uber for dog walking' in the box.",
        targetId: "ideation-input"
    },
    {
        id: 3,
        title: "Market Intelligence",
        content: "Stop guessing. This module uses Google Search Grounding to pull real-time competitor data and market trends.",
        route: "/market-research",
        actionHint: "You can search for live trends here.",
        targetId: "market-search-input"
    },
    {
        id: 4,
        title: "Product Roadmap",
        content: "Once validated, plan your build. This is a drag-and-drop Kanban board for your engineering tasks.",
        route: "/product",
        actionHint: "Move tasks from Backlog to Done.",
        targetId: "product-board"
    },
    {
        id: 5,
        title: "Investor Relations",
        content: "Raising capital? Track VCs in this pipeline, manage your Funding Round progress, and host your Data Room files here.",
        route: "/investor",
        actionHint: "Check the 'Data Room' tab.",
        targetId: "investor-tabs"
    },
    // --- GROWTH ---
    {
        id: 6,
        title: "Phase 2: Growth Engine",
        content: "This is your AI creative studio. Generate Social Copy, 4K Images, and even Video Teasers (via Google Veo) instantly.",
        route: "/marketing",
        actionHint: "Switch tabs to see Image and Video generation.",
        targetId: "marketing-controls"
    },
    {
        id: 7,
        title: "Sales & CRM",
        content: "Manage leads and deals. The unique feature here is the 'Sales Copilot' on the right—it drafts cold emails and handles objections for you.",
        route: "/sales",
        actionHint: "Click a deal to see the AI Copilot in action.",
        targetId: "sales-pipeline"
    },
    {
        id: 8,
        title: "Customer Support",
        content: "Keep users happy. A unified inbox for support tickets with priority tagging and status tracking.",
        route: "/support",
        actionHint: "View open tickets.",
        targetId: "support-inbox"
    },
    // --- OPERATIONS ---
    {
        id: 9,
        title: "Phase 3: Operations & HR",
        content: "Scale your team. This ATS (Applicant Tracking System) lets you drag candidates through interview stages.",
        route: "/hr",
        actionHint: "Switch to 'Pipeline' view.",
        targetId: "hr-pipeline"
    },
    {
        id: 10,
        title: "Finance & Runway",
        content: "Don't run out of cash. Monitor your Burn Rate, Runway, and P&L in real-time.",
        route: "/finance",
        actionHint: "Check the 'Runway' card.",
        targetId: "finance-runway-card"
    },
    {
        id: 11,
        title: "Supply Chain",
        content: "Selling physical goods? Track inventory levels, SKUs, and reorder points here.",
        route: "/supply",
        actionHint: "Click 'Receive Stock' to add items.",
        targetId: "supply-add-btn"
    },
    // --- PLATFORM ---
    {
        id: 12,
        title: "Phase 4: Admin & Governance",
        content: "For the CTO. Manage API keys, Webhooks, and developer settings.",
        route: "/developers",
        actionHint: "Generate API keys here.",
        targetId: "dev-api-keys"
    },
    {
        id: 13,
        title: "Agent Command Center",
        content: "The future of work. Manage autonomous AI agents that run in the background (e.g., Competitor Scrapers).",
        route: "/agents",
        actionHint: "Toggle agents on/off.",
        targetId: "agent-list"
    },
    {
        id: 14,
        title: "Audit Logs",
        content: "Enterprise-ready. Every action (login, export, delete) is immutably recorded here for compliance (SOC2).",
        route: "/audit",
        actionHint: "Review security events.",
        targetId: "audit-table"
    },
    {
        id: 15,
        title: "Ready to Build?",
        content: "You have explored the entire Startup Operating System. It is time to execute.",
        route: "/",
        actionHint: "End Tour"
    }
];
