
import { MarketplaceApp, AppCategory } from '../types';
import { db } from './localStorageDb';
import { addMCPServer, getMCPServers, deleteMCPServer } from './mcpService';

const SEED_APPS: MarketplaceApp[] = [
    // --- SPECIAL / BROWSER ---
    {
        id: 'my-browser',
        name: 'My Browser',
        description: 'Install the Manus extension to help your agent access sites that require logins or have heightened security. It works with Chrome and compatible browsers like Edge, Brave, and Arc.',
        category: 'PRODUCTIVITY',
        icon: 'Chrome', // UI maps this to the Chrome icon
        author: 'Manus',
        installed: false,
        rating: 5.0,
        installCount: 'Native',
        mcpConfig: {
            name: 'My Browser',
            description: 'Local browser context bridge.',
            transport: 'BROWSER',
            uri: 'chrome-extension://local-bridge',
            capabilities: { resources: true, prompts: false, tools: true }
        }
    },

    // --- GOOGLE ---
    { 
        id: 'gmail', 
        name: 'Gmail', 
        description: 'Draft replies, search your inbox, and summarize email threads instantly.', 
        category: 'COMMUNICATION', 
        icon: 'Mail', 
        author: 'Google', 
        installed: false, 
        rating: 4.8, 
        installCount: '2M+' 
    },
    { 
        id: 'gcal', 
        name: 'Google Calendar', 
        description: 'Understand your schedule, manage events, and optimize your time effectively.', 
        category: 'PRODUCTIVITY', 
        icon: 'Calendar', 
        author: 'Google', 
        installed: false, 
        rating: 4.9, 
        installCount: '1.5M+' 
    },
    { 
        id: 'gdrive', 
        name: 'Google Drive', 
        description: 'Access your files, search instantly, and manage documents intelligently.', 
        category: 'PRODUCTIVITY', 
        icon: 'Cloud', 
        author: 'Google', 
        installed: true, 
        rating: 4.7, 
        installCount: '1.8M+',
        mcpConfig: {
            name: 'Google Drive',
            description: 'Semantic search over company documents.',
            transport: 'SSE',
            uri: 'https://mcp.google.com/drive',
            capabilities: { resources: true, prompts: false, tools: true }
        }
    },

    // --- MICROSOFT ---
    { id: 'outlook-mail', name: 'Outlook Mail', description: 'Write, search, and manage your Outlook emails seamlessly.', category: 'COMMUNICATION', icon: 'Mail', author: 'Microsoft', installed: false, rating: 4.5, installCount: '1M+' },
    { id: 'outlook-cal', name: 'Outlook Calendar', description: 'Schedule, view, and manage your Outlook events just with a prompt.', category: 'PRODUCTIVITY', icon: 'Calendar', author: 'Microsoft', installed: false, rating: 4.5, installCount: '800k+' },

    // --- ENGINEERING ---
    { 
        id: 'github', 
        name: 'GitHub', 
        description: 'Manage repositories, track code changes, and collaborate on team projects.', 
        category: 'ENGINEERING', 
        icon: 'Github', 
        author: 'Microsoft', 
        installed: true, 
        rating: 4.9, 
        installCount: '5M+',
        mcpConfig: {
            name: 'GitHub Repository',
            description: 'Search code, read PRs, and manage issues.',
            transport: 'STDIO',
            uri: 'npx -y @modelcontextprotocol/server-github',
            capabilities: { resources: true, prompts: false, tools: true }
        }
    },
    { id: 'linear', name: 'Linear', description: 'Track issues, manage projects, and organize workflows across your team.', category: 'ENGINEERING', icon: 'Layers', author: 'Linear', installed: false, rating: 4.9, installCount: '200k+' },
    { id: 'vercel', name: 'Vercel', description: 'Manage Vercel projects, deployments, and domains.', category: 'ENGINEERING', icon: 'Triangle', author: 'Vercel', installed: false, rating: 4.8, installCount: '500k+' },
    { id: 'supabase', name: 'Supabase', description: 'Manage Supabase projects, query databases, and organize data efficiently.', category: 'ENGINEERING', icon: 'Database', author: 'Supabase', installed: false, rating: 4.7, installCount: '100k+' },
    { id: 'neon', name: 'Neon', description: 'Use natural language to query and manage Postgres.', category: 'ENGINEERING', icon: 'Database', author: 'Neon', installed: false, rating: 4.6, installCount: '50k+' },
    { id: 'prisma', name: 'Prisma Postgres', description: 'Connect to Postgres, manage databases, and query data securely.', category: 'ENGINEERING', icon: 'Database', author: 'Prisma', installed: false, rating: 4.8, installCount: '300k+' },
    { id: 'sentry', name: 'Sentry', description: 'Review errors, analyze root causes, and suggest fixes.', category: 'ENGINEERING', icon: 'AlertOctagon', author: 'Sentry', installed: false, rating: 4.5, installCount: '400k+' },
    { id: 'cloudflare', name: 'Cloudflare', description: 'Manage Cloudflare Workers, build applications, and deploy online resources.', category: 'ENGINEERING', icon: 'Cloud', author: 'Cloudflare', installed: false, rating: 4.7, installCount: '300k+' },
    { id: 'posthog', name: 'PostHog', description: 'Perform product analytics, manage feature flags, and run experiments.', category: 'DATA', icon: 'BarChart2', author: 'PostHog', installed: false, rating: 4.8, installCount: '80k+' },
    { id: 'playwright', name: 'Playwright', description: 'Automate browsers for testing, scraping, and more.', category: 'ENGINEERING', icon: 'Code', author: 'Microsoft', installed: false, rating: 4.9, installCount: '150k+' },
    { id: 'huggingface', name: 'Hugging Face', description: 'Explore AI models, access datasets, and discover research trends.', category: 'DATA', icon: 'BrainCircuit', author: 'Hugging Face', installed: false, rating: 4.8, installCount: '1M+' },

    // --- COMMUNICATION ---
    { 
        id: 'slack', 
        name: 'Slack', 
        description: 'Stay on top of conversations, track key messages, and follow team activity.', 
        category: 'COMMUNICATION', 
        icon: 'Slack', 
        author: 'Salesforce', 
        installed: true, 
        rating: 4.8, 
        installCount: '2M+',
        mcpConfig: {
            name: 'Slack Gateway',
            description: 'Send notifications and query channel history.',
            transport: 'WEBSOCKET',
            uri: 'wss://mcp-slack.startupos.com',
            capabilities: { resources: false, prompts: true, tools: true }
        }
    },
    { id: 'intercom', name: 'Intercom', description: 'Access customer conversations, analyze feedback, and generate insights.', category: 'COMMUNICATION', icon: 'MessageCircle', author: 'Intercom', installed: false, rating: 4.6, installCount: '100k+' },
    { id: 'line', name: 'LINE', description: 'Connect to LINE Official Accounts for automated messaging.', category: 'COMMUNICATION', icon: 'MessageSquare', author: 'LINE', installed: false, rating: 4.2, installCount: '500k+' },

    // --- PRODUCTIVITY & OPS ---
    { id: 'notion', name: 'Notion', description: 'Search workspace content, update notes, and automate workflows.', category: 'PRODUCTIVITY', icon: 'FileText', author: 'Notion', installed: false, rating: 4.9, installCount: '5M+' },
    { id: 'zapier', name: 'Zapier', description: 'Connect Manus and automate workflows across thousands of apps.', category: 'PRODUCTIVITY', icon: 'Zap', author: 'Zapier', installed: false, rating: 4.7, installCount: '2M+' },
    { id: 'make', name: 'Make', description: 'Turn Make workflows into AI tools for intelligent automation execution.', category: 'PRODUCTIVITY', icon: 'Zap', author: 'Make', installed: false, rating: 4.6, installCount: '300k+' },
    { id: 'asana', name: 'Asana', description: 'Streamline project and task management with Asana.', category: 'PRODUCTIVITY', icon: 'CheckSquare', author: 'Asana', installed: false, rating: 4.5, installCount: '1M+' },
    { id: 'monday', name: 'monday.com', description: 'Coordinate tasks, manage boards, and streamline your project workflows.', category: 'PRODUCTIVITY', icon: 'Layout', author: 'monday.com', installed: false, rating: 4.4, installCount: '800k+' },
    { id: 'clickup', name: 'ClickUp', description: 'Automate task management and project workflows with ClickUp.', category: 'PRODUCTIVITY', icon: 'CheckCircle', author: 'ClickUp', installed: false, rating: 4.3, installCount: '600k+' },
    { id: 'atlassian', name: 'Atlassian', description: 'Search, create, and manage Jira, Confluence, and Compass.', category: 'PRODUCTIVITY', icon: 'Trello', author: 'Atlassian', installed: false, rating: 4.2, installCount: '2M+' },
    { id: 'todoist', name: 'Todoist', description: 'Organize your to-dos, streamline projects, and boost productivity.', category: 'PRODUCTIVITY', icon: 'Check', author: 'Doist', installed: false, rating: 4.8, installCount: '1M+' },
    { id: 'wrike', name: 'Wrike', description: 'Manage projects, organize tasks, and collaborate seamlessly.', category: 'PRODUCTIVITY', icon: 'List', author: 'Wrike', installed: false, rating: 4.1, installCount: '100k+' },
    { id: 'airtable', name: 'Airtable', description: 'Organize structured data, manage records, and collaborate with your team.', category: 'PRODUCTIVITY', icon: 'Database', author: 'Airtable', installed: false, rating: 4.7, installCount: '500k+' },
    { id: 'jam', name: 'Jam', description: 'Analyze screen recordings, context, and issues automatically.', category: 'PRODUCTIVITY', icon: 'Video', author: 'Jam', installed: false, rating: 4.9, installCount: '50k+' },

    // --- GROWTH (Sales/Marketing) ---
    { id: 'hubspot', name: 'HubSpot', description: 'Search CRM data, track contacts, and analyze sales and marketing insights.', category: 'GROWTH', icon: 'Users', author: 'HubSpot', installed: false, rating: 4.6, installCount: '300k+' },
    { id: 'close', name: 'Close', description: 'Automate your sales leads pipeline with Close CRM.', category: 'GROWTH', icon: 'Phone', author: 'Close', installed: false, rating: 4.5, installCount: '20k+' },
    { id: 'zoominfo', name: 'ZoomInfo', description: 'Access comprehensive B2B contact and company intelligence data.', category: 'GROWTH', icon: 'Search', author: 'ZoomInfo', installed: false, rating: 4.4, installCount: '50k+' },
    { id: 'explorium', name: 'Explorium', description: 'Access comprehensive business and contact data for AI-powered insights.', category: 'GROWTH', icon: 'Globe', author: 'Explorium', installed: false, rating: 4.3, installCount: '10k+' },
    { id: 'fireflies', name: 'Fireflies', description: 'Automate meeting transcription and conversation insights.', category: 'GROWTH', icon: 'Mic', author: 'Fireflies.ai', installed: false, rating: 4.7, installCount: '100k+' },
    { id: 'tldv', name: 'tl;dv', description: 'Streamline meeting workflows with transcriptions and call highlights.', category: 'GROWTH', icon: 'Video', author: 'tl;dv', installed: false, rating: 4.6, installCount: '80k+' },

    // --- FINANCE ---
    { 
        id: 'stripe', 
        name: 'Stripe', 
        description: 'Streamline business billing, payments, and account management.', 
        category: 'FINANCE', 
        icon: 'CreditCard', 
        author: 'Stripe', 
        installed: true, 
        rating: 4.9, 
        installCount: '2M+',
        mcpConfig: {
            name: 'Stripe Analytics',
            description: 'Read-only access to revenue, customers, and subscription data.',
            transport: 'SSE',
            uri: 'https://mcp.stripe.com/v1/sse',
            capabilities: { resources: true, prompts: true, tools: false }
        }
    },
    { id: 'paypal', name: 'PayPal for Business', description: 'Manage transactions, invoices, and business operations efficiently.', category: 'FINANCE', icon: 'DollarSign', author: 'PayPal', installed: false, rating: 4.4, installCount: '5M+' },
    { id: 'revenuecat', name: 'RevenueCat', description: 'Manage subscription apps, control entitlements, and automate workflows.', category: 'FINANCE', icon: 'BarChart', author: 'RevenueCat', installed: false, rating: 4.8, installCount: '30k+' },
    { id: 'xero', name: 'Xero', description: 'View financial data, generate reports, and gain personalized business insights.', category: 'FINANCE', icon: 'FileSpreadsheet', author: 'Xero', installed: false, rating: 4.5, installCount: '500k+' },

    // --- DESIGN & MEDIA ---
    { id: 'canva', name: 'Canva', description: 'Discover, autofill, and export Canva designs in one place.', category: 'DESIGN', icon: 'Image', author: 'Canva', installed: false, rating: 4.9, installCount: '10M+' },
    { id: 'webflow', name: 'Webflow', description: 'Manage Webflow sites, edit pages, and organize your CMS content with ease.', category: 'DESIGN', icon: 'Layout', author: 'Webflow', installed: false, rating: 4.8, installCount: '200k+' },
    { id: 'wix', name: 'Wix', description: 'Search website data, access content, and automate workflows within Wix.', category: 'DESIGN', icon: 'Layout', author: 'Wix', installed: false, rating: 4.3, installCount: '5M+' },
    { id: 'heygen', name: 'HeyGen', description: 'Create lifelike AI avatars, generate voices, and produce realistic videos.', category: 'DESIGN', icon: 'Video', author: 'HeyGen', installed: false, rating: 4.7, installCount: '50k+' },
    { id: 'invideo', name: 'Invideo', description: 'Transform ideas into professional videos and create engaging visual stories.', category: 'DESIGN', icon: 'Film', author: 'Invideo', installed: false, rating: 4.6, installCount: '100k+' },
    { id: 'minimax', name: 'MiniMax', description: 'Generate speech, music, images, and videos with MiniMax.', category: 'DESIGN', icon: 'Music', author: 'MiniMax', installed: false, rating: 4.5, installCount: '10k+' },
    { id: 'hume', name: 'Hume', description: 'Create expressive text-to-speech audio with Hume AI.', category: 'DESIGN', icon: 'Mic', author: 'Hume', installed: false, rating: 4.6, installCount: '5k+' },

    // --- DATA & UTILS ---
    { id: 'lightcast', name: 'Lightcast', description: 'Global labor market analytics. Salary, skills, and posting trends.', category: 'DATA', icon: 'BarChart2', author: 'Lightcast', installed: false, rating: 4.9, installCount: '25k+' },
    { id: 'firecrawl', name: 'Firecrawl', description: 'Unlock powerful web scraping, crawling, and search capabilities.', category: 'DATA', icon: 'Search', author: 'Firecrawl', installed: false, rating: 4.7, installCount: '10k+' },
    { id: 'metabase', name: 'Metabase', description: 'Access Metabase data analytics with caching and response optimization.', category: 'DATA', icon: 'BarChart', author: 'Metabase', installed: false, rating: 4.6, installCount: '80k+' },
    { id: 'pophive', name: 'PopHIVE', description: 'Access public health data from PopHIVE dashboards.', category: 'DATA', icon: 'Activity', author: 'PopHIVE', installed: false, rating: 4.0, installCount: '1k+' },
    { id: 'jotform', name: 'Jotform', description: 'Create, manage, and collect data through powerful online forms.', category: 'DATA', icon: 'FileText', author: 'Jotform', installed: false, rating: 4.5, installCount: '1M+' },
    { id: 'dify', name: 'Dify', description: 'Connect Dify and orchestrate AI-powered workflows across your favorite tools.', category: 'ENGINEERING', icon: 'Cpu', author: 'Dify', installed: false, rating: 4.4, installCount: '50k+' },
    { id: 'serena', name: 'Serena', description: 'Unlock efficient code management with Serena’s semantic and editing tools.', category: 'ENGINEERING', icon: 'Code', author: 'Serena', installed: false, rating: 4.3, installCount: '5k+' },
];

export const getMarketplaceApps = async (): Promise<MarketplaceApp[]> => {
    return db.get<MarketplaceApp[]>('marketplace_apps', SEED_APPS);
};

export const installApp = async (id: string): Promise<MarketplaceApp[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Auto-provision MCP Server logic
    const app = (await getMarketplaceApps()).find(a => a.id === id);
    if (app && app.mcpConfig) {
        // Check if server already exists to avoid duplicates
        const currentServers = await getMCPServers();
        const exists = currentServers.find(s => s.name === app.mcpConfig?.name || s.uri === app.mcpConfig?.uri);
        
        if (!exists) {
            console.log(`[Marketplace] Auto-provisioning MCP Server for ${app.name}...`);
            await addMCPServer(app.mcpConfig);
        }
    }

    return db.updateItem('marketplace_apps', id, { installed: true }, SEED_APPS);
};

export const uninstallApp = async (id: string): Promise<MarketplaceApp[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Cleanup MCP Server logic
    const app = (await getMarketplaceApps()).find(a => a.id === id);
    if (app && app.mcpConfig) {
        const currentServers = await getMCPServers();
        const serverToRemove = currentServers.find(s => s.name === app.mcpConfig?.name);
        if (serverToRemove) {
            console.log(`[Marketplace] Removing MCP Server for ${app.name}...`);
            await deleteMCPServer(serverToRemove.id);
        }
    }

    return db.updateItem('marketplace_apps', id, { installed: false }, SEED_APPS);
};
