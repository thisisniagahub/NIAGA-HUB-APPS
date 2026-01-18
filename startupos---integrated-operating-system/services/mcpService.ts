
import { MCPServer } from '../types';
import { db } from './localStorageDb';

const SEED_SERVERS: MCPServer[] = [
    {
        id: '1',
        name: 'Filesystem Access',
        description: 'Grants AI agents secure read/write access to specific project folders.',
        transport: 'STDIO',
        uri: 'npx -y @modelcontextprotocol/server-filesystem ./projects',
        status: 'CONNECTED',
        capabilities: { resources: true, prompts: false, tools: true },
        toolsCount: 5,
        latencyMs: 12
    },
    {
        id: '2',
        name: 'PostgreSQL Gateway',
        description: 'Direct SQL execution and schema inspection tool for the primary DB.',
        transport: 'SSE',
        uri: 'http://localhost:3001/sse',
        status: 'CONNECTED',
        capabilities: { resources: true, prompts: true, tools: true },
        toolsCount: 8,
        latencyMs: 45
    },
    {
        id: '3',
        name: 'Brave Search',
        description: 'Web search grounding with preserved context.',
        transport: 'SSE',
        uri: 'https://mcp.startupos.com/brave',
        status: 'DISCONNECTED',
        capabilities: { resources: false, prompts: false, tools: true },
        toolsCount: 2,
        latencyMs: 0
    },
    {
        id: '4',
        name: 'Linear MCP',
        description: 'Manage issues, cycles, and roadmaps directly via AI agents.',
        transport: 'STDIO',
        uri: 'npx -y @linear/mcp-server',
        status: 'CONNECTED',
        capabilities: { resources: true, prompts: false, tools: true },
        toolsCount: 14,
        latencyMs: 85
    },
    {
        id: '5',
        name: 'Stripe Analytics',
        description: 'Read-only access to revenue, customers, and subscription data.',
        transport: 'SSE',
        uri: 'https://mcp.stripe.com/v1/sse',
        status: 'CONNECTED',
        capabilities: { resources: true, prompts: true, tools: false },
        toolsCount: 6,
        latencyMs: 120
    },
    {
        id: '6',
        name: 'GitHub Repository',
        description: 'Search code, read PRs, and manage issues across orgs.',
        transport: 'STDIO',
        uri: 'npx -y @modelcontextprotocol/server-github',
        status: 'CONNECTED',
        capabilities: { resources: true, prompts: false, tools: true },
        toolsCount: 18,
        latencyMs: 34
    },
    {
        id: '7',
        name: 'Slack Gateway',
        description: 'Send notifications and query channel history.',
        transport: 'WEBSOCKET',
        uri: 'wss://mcp-slack.startupos.com',
        status: 'CONNECTED',
        capabilities: { resources: false, prompts: true, tools: true },
        toolsCount: 4,
        latencyMs: 45
    },
    {
        id: '8',
        name: 'Sentry Logs',
        description: 'Query error traces and performance metrics.',
        transport: 'SSE',
        uri: 'https://mcp.sentry.io/stream',
        status: 'ERROR',
        capabilities: { resources: true, prompts: false, tools: false },
        toolsCount: 2,
        latencyMs: 0
    },
    {
        id: '9',
        name: 'Google Drive',
        description: 'Semantic search over company documents and slides.',
        transport: 'SSE',
        uri: 'https://mcp.google.com/drive',
        status: 'CONNECTED',
        capabilities: { resources: true, prompts: false, tools: true },
        toolsCount: 3,
        latencyMs: 210
    }
];

export const getMCPServers = async (): Promise<MCPServer[]> => {
    return db.get<MCPServer[]>('mcp_servers', SEED_SERVERS);
};

export const addMCPServer = async (server: Omit<MCPServer, 'id' | 'status' | 'toolsCount' | 'latencyMs'>): Promise<MCPServer[]> => {
    const newServer: MCPServer = {
        ...server,
        id: Date.now().toString(),
        status: 'CONNECTED', // Mock successful connection
        toolsCount: Math.floor(Math.random() * 20) + 5,
        latencyMs: Math.floor(Math.random() * 100) + 10
    };
    return db.addItem('mcp_servers', newServer, SEED_SERVERS);
};

export const deleteMCPServer = async (id: string): Promise<MCPServer[]> => {
    return db.deleteItem('mcp_servers', id, SEED_SERVERS);
};

export const refreshServerStatus = async (id: string): Promise<void> => {
    // Simulate a ping check
    await new Promise(resolve => setTimeout(resolve, 600));
    const status = Math.random() > 0.1 ? 'CONNECTED' : 'ERROR';
    db.updateItem('mcp_servers', id, { status }, SEED_SERVERS);
};
