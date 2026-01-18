
import { FunctionDeclaration, Type } from "@google/genai";
import * as investorService from './investorService';
import * as salesService from './salesService';
import * as financeService from './financeService';
import * as marketplaceService from './marketplaceService';
import * as lightcastService from './lightcastService';
import { getMCPServers } from './mcpService';
import { browserBridge } from './browserBridge';
import { Investor, SalesDeal } from '../types';

// --- Base Tool Definitions ---

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_investors',
    description: 'Retrieve the current list of investors, their status, and check sizes.',
  },
  {
    name: 'add_investor',
    description: 'Add a new investor to the CRM pipeline.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Name of the investor contact' },
        firm: { type: Type.STRING, description: 'Name of the VC firm or Angel group' },
        status: { type: Type.STRING, description: 'Status: PROSPECT, CONTACTED, MEETING, DUE_DILIGENCE, COMMITTED' },
        checkSize: { type: Type.STRING, description: 'Estimated check size (e.g. $500k)' },
      },
      required: ['name', 'firm']
    }
  },
  {
    name: 'get_sales_pipeline',
    description: 'Get all active sales deals, their value, and stage.',
  },
  {
    name: 'add_sales_deal',
    description: 'Create a new sales opportunity/deal.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        company: { type: Type.STRING, description: 'Company name of the prospect' },
        leadName: { type: Type.STRING, description: 'Contact person name' },
        value: { type: Type.NUMBER, description: 'Deal value in USD' },
      },
      required: ['company', 'value']
    }
  },
  {
    name: 'get_financial_runway',
    description: 'Get current burn rate, cash on hand, and runway months.',
  },
  {
    name: 'search_marketplace',
    description: 'Search for available third-party apps and integrations.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search term (e.g. "crm", "finance")' }
      },
      required: ['query']
    }
  },
  {
    name: 'install_app',
    description: 'Install a marketplace application by its ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        appId: { type: Type.STRING, description: 'The exact ID of the app (e.g. "linear", "stripe")' }
      },
      required: ['appId']
    }
  },
  {
    name: 'get_labor_market_data',
    description: 'Get salary and demand data for a specific job role and location using Lightcast.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING, description: 'Job title (e.g. "Software Engineer")' },
        location: { type: Type.STRING, description: 'City or Region (e.g. "Austin, TX")' }
      },
      required: ['role', 'location']
    }
  }
];

// --- Browser Extension Tools ---

const browserToolDeclarations: FunctionDeclaration[] = [
    {
        name: 'browser_read_page',
        description: 'Read the text content and metadata of the current active browser tab using the Extension Bridge.',
    },
    {
        name: 'browser_get_url',
        description: 'Get the URL of the current active browser tab.',
    },
    {
        name: 'browser_navigate',
        description: 'Navigate the current browser tab to a specific URL.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                url: { type: Type.STRING, description: 'The URL to navigate to' }
            },
            required: ['url']
        }
    },
    {
        name: 'browser_notify',
        description: 'Send a browser notification to the user.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                message: { type: Type.STRING, description: 'The notification message' }
            },
            required: ['message']
        }
    }
];

// --- Dynamic Tool Loader ---

export const getAgentTools = async (): Promise<FunctionDeclaration[]> => {
    const servers = await getMCPServers();
    // Check if the Browser server is connected (which means the extension is "installed")
    const browserConnected = servers.some(s => s.transport === 'BROWSER' && s.status === 'CONNECTED');
    
    if (browserConnected) {
        // console.log('[Agent] Browser Bridge Active: Loading Browser Tools');
        return [...toolDeclarations, ...browserToolDeclarations];
    }
    return toolDeclarations;
};

// --- Tool Execution Logic ---

export const executeTool = async (name: string, args: any): Promise<any> => {
  console.log(`[Agent] Executing tool: ${name}`, args);
  
  try {
    switch (name) {
      // --- CORE TOOLS ---
      case 'get_investors':
        return await investorService.getInvestors();
      
      case 'add_investor':
        const newInvestor: Investor = {
          id: Date.now().toString(),
          name: args.name,
          firm: args.firm,
          status: args.status || 'PROSPECT',
          checkSize: args.checkSize || 'Unknown',
          lastContact: 'Just now',
          notes: 'Added via AI Agent'
        };
        await investorService.addInvestor(newInvestor);
        return { success: true, message: `Added ${args.name} from ${args.firm} to pipeline.` };

      case 'get_sales_pipeline':
        return await salesService.getSalesDeals();

      case 'add_sales_deal':
        const newDeal: SalesDeal = {
          id: Date.now().toString(),
          company: args.company,
          leadName: args.leadName || 'Unknown',
          value: args.value,
          stage: 'NEW',
          probability: 20,
          lastActivity: 'Just now'
        };
        await salesService.addDeal(newDeal);
        return { success: true, message: `Created deal for ${args.company} ($${args.value}).` };

      case 'get_financial_runway':
        return await financeService.getRunwayData();

      case 'search_marketplace':
        const apps = await marketplaceService.getMarketplaceApps();
        if (!args.query) return apps;
        return apps.filter(a => 
          a.name.toLowerCase().includes(args.query.toLowerCase()) || 
          a.description.toLowerCase().includes(args.query.toLowerCase())
        );

      case 'install_app':
        await marketplaceService.installApp(args.appId);
        return { success: true, message: `Successfully installed ${args.appId}.` };

      case 'get_labor_market_data':
        const apps2 = await marketplaceService.getMarketplaceApps();
        const lightcast = apps2.find(a => a.id === 'lightcast');
        if (!lightcast?.installed) {
          return { error: 'Lightcast plugin is not installed. Please install it from the Marketplace first.' };
        }
        return await lightcastService.getLaborMarketData(args.role, args.location);

      // --- BROWSER TOOLS (via Bridge) ---
      case 'browser_read_page':
        // Delegate to the bridge (which talks to the extension)
        const readResult = await browserBridge.sendCommand('READ_PAGE', {});
        return readResult.data || { error: 'Failed to read page via extension.' };

      case 'browser_get_url':
        const urlResult = await browserBridge.sendCommand('GET_URL', {});
        return urlResult.data || { error: 'Failed to get URL.' };

      case 'browser_navigate':
        const navResult = await browserBridge.sendCommand('NAVIGATE', { url: args.url });
        return navResult.data || { error: 'Failed to navigate.' };

      case 'browser_notify':
        const notifyResult = await browserBridge.sendCommand('NOTIFY', { message: args.message });
        return notifyResult.data || { error: 'Failed to notify.' };

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (error: any) {
    console.error(`[Agent] Tool error:`, error);
    return { error: error.message || 'Tool execution failed' };
  }
};
