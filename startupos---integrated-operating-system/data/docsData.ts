
export interface DocPage {
    slug: string;
    title: string;
    category: string;
    content: string;
}

export const DOCS_DATA: DocPage[] = [
    // --- INTRODUCTION ---
    {
        slug: 'introduction',
        title: 'Welcome to StartupOS',
        category: 'Getting Started',
        content: `
# Welcome to StartupOS

StartupOS is the integrated operating system designed to replace the fragmented stack of 20+ SaaS tools typically used by founders. 

From **Ideation** to **Exit**, we provide the core infrastructure to run your company.

## Why StartupOS?

Founders spend 30% of their time managing tools instead of building product. StartupOS unifies:

*   **Strategy**: Ideation, Market Research, Pitch Decks.
*   **Execution**: Product Roadmap, Engineering Tasks.
*   **Growth**: Marketing Assets, Sales CRM, Support.
*   **Operations**: Finance, HR, Legal, Compliance.

## Architecture

StartupOS is built on a modern, scalable stack:

\`\`\`typescript
// The Core Stack
const stack = {
  frontend: "React 18 + Tailwind + Framer Motion",
  backend: "Node.js + Prisma + PostgreSQL",
  ai: "Google Gemini Pro + Flash + Veo",
  integrations: "Model Context Protocol (MCP)"
};
\`\`\`

## Quick Links

*   [Installation Guide](/docs/installation)
*   [Core Concepts](/docs/concepts)
*   [API Reference](/docs/api)
`
    },
    {
        slug: 'installation',
        title: 'Installation & Setup',
        category: 'Getting Started',
        content: `
# Installation

Getting StartupOS running locally is simple. We support Docker for a one-click setup.

### Prerequisites

*   Node.js 18+
*   Docker & Docker Compose
*   Google Cloud API Key (for Gemini)

### Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/your-org/startupos.git
cd startupos
\`\`\`

### Step 2: Configure Environment

Create a \`.env\` file in the root directory:

\`\`\`bash
# .env
API_KEY=your_gemini_api_key
DATABASE_URL="postgresql://user:password@localhost:5432/startupos"
\`\`\`

### Step 3: Launch

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit \`http://localhost:5173\` to see your dashboard.
`
    },

    // --- CORE MODULES ---
    {
        slug: 'ideation-engine',
        title: 'Ideation Engine',
        category: 'Core Modules',
        content: `
# Ideation & Innovation Engine

The Ideation module uses **Gemini 1.5 Pro** to act as a rigorous co-founder. It doesn't just "chat"; it performs structured validation.

## Key Features

1.  **Feasibility Analysis**: We cross-reference your idea against current market constraints.
2.  **Founder Archetype**: We analyze your vision to determine if you are a "Builder", "Salesperson", or "Visionary".
3.  **Visual Manifestation**: Using \`gemini-pro-image\`, we generate concept art for your vision.

> **Tip:** Use the "Visionary Mode" toggle to switch between abstract brainstorming and concrete business modeling.

## Synapse Injection

When you validate an idea, the **Synapse** system automatically:
*   Creates a backlog in the **Product** module.
*   Drafts a landing page in the **Marketing** module.
*   Identifies potential VC matches in the **Investor** module.
`
    },
    {
        slug: 'market-intelligence',
        title: 'Market Intelligence',
        category: 'Core Modules',
        content: `
# Market Intelligence

This module utilizes **Google Search Grounding** to fetch live data from the web, bypassing the knowledge cutoff of standard LLMs.

## Capabilities

| Feature | Description |
| :--- | :--- |
| **Competitor Scan** | Identifies top 5 direct competitors and their pricing. |
| **Trend Analysis** | Looks for rising search terms in your niche. |
| **Labor Data** | (Via Lightcast) Real-time salary data for hiring. |

## Usage

Navigate to \`/market-research\`, enter your vertical (e.g., "Vertical SaaS for Dentists"), and click **Analyze**.
`
    },

    // --- DEVELOPERS ---
    {
        slug: 'mcp-integration',
        title: 'MCP Integrations',
        category: 'Developers',
        content: `
# Model Context Protocol (MCP)

StartupOS is fully compatible with the [Model Context Protocol](https://modelcontextprotocol.io). This allows you to connect local resources (databases, file systems) to the StartupOS Agents.

## Adding a Server

1.  Go to **Connectors > My Connectors**.
2.  Click **Connect Server**.
3.  Choose **STDIO** (for local shells) or **SSE** (for remote APIs).

## Supported Capabilities

*   \`resources\`: Reading files/data.
*   \`prompts\`: Custom agent templates.
*   \`tools\`: Executable functions (e.g., \`git commit\`, \`db_query\`).

\`\`\`json
// Example MCP Configuration
{
  "name": "Local Dev DB",
  "transport": "STDIO",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
}
\`\`\`
`
    },
    {
        slug: 'api-reference',
        title: 'API Reference',
        category: 'Developers',
        content: `
# API Reference

StartupOS exposes a REST API for programmatic access to your OS data.

## Authentication

All requests must include the \`Authorization\` header.

\`\`\`http
Authorization: Bearer pk_live_12345
\`\`\`

## Endpoints

### \`GET /api/v1/investors\`

Retrieve your investor pipeline.

**Response:**

\`\`\`json
[
  {
    "id": "inv_1",
    "name": "Sequoia",
    "status": "DUE_DILIGENCE",
    "checkSize": "$5M"
  }
]
\`\`\`

### \`POST /api/v1/agents/deploy\`

Spin up a new autonomous worker.

\`\`\`json
{
  "type": "COMPETITOR_MONITOR",
  "target": "competitor.com",
  "frequency": "hourly"
}
\`\`\`
`
    }
];

export const getDocBySlug = (slug: string) => DOCS_DATA.find(d => d.slug === slug);

export const getDocsStructure = () => {
    const categories: Record<string, DocPage[]> = {};
    DOCS_DATA.forEach(doc => {
        if (!categories[doc.category]) {
            categories[doc.category] = [];
        }
        categories[doc.category].push(doc);
    });
    return categories;
};
