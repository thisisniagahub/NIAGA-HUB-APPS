
export interface User {
  id: string;
  name: string;
  role: 'FOUNDER' | 'OPERATOR' | 'INVESTOR' | 'ADMIN';
  avatarUrl?: string;
}

export interface Workspace {
    id: string;
    name: string;
    role: string;
    createdAt: string;
}

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  phase: 'MVP' | 'PHASE_2';
  category: 'STRATEGY' | 'EXECUTION' | 'GROWTH' | 'OPERATIONS' | 'DATA';
}

export interface KpiData {
  id: string;
  label: string;
  value: string | number;
  trend: number; // percentage
  trendDirection: 'up' | 'down' | 'neutral';
}

export enum GeminiModel {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  IMAGE_GEN = 'gemini-3-pro-image-preview',
  VEO = 'veo-3.1-fast-generate-preview'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

// --- STRATEGY MODULE TYPES ---
export interface BusinessCanvas {
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface SwotItem {
  id: string;
  type: 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | 'THREAT';
  content: string;
}

export interface StrategicGoal {
  id: string;
  title: string;
  progress: number; // 0-100
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
  deadline: string;
  owner: string;
}

// Ideation Types
export interface FounderArchetype {
  id?: string; // Added for CRUD
  title: string;
  description: string;
  visualPrompt: string;
  suggestedBusinessModels: string[];
  coreValues: string[];
  imageUrl?: string; 
  status?: 'DRAFT' | 'VALIDATED' | 'ARCHIVED'; // Added for CRUD
  linkedFeatureId?: string | number; // RELATIONSHIP: Link to Product Feature
  createdAt?: string;
}

// Synapse Types
export interface SynapseGeneration {
  productFeatures: Array<{ name: string; priority: 'High' | 'Medium' | 'Low' }>;
  marketingHooks: Array<{ name: string; channel: 'Social' | 'Email' | 'Ads' | 'Content' }>;
  investorMatches: Array<{ name: string; firm: string; notes: string }>;
}

// Pitch Analysis Types
export interface PitchAnalysis {
  score: number; // 1-100
  critique: string;
  improvements: string[];
}

export interface Slide {
  id: string;
  type: 'TITLE' | 'PROBLEM' | 'SOLUTION' | 'MARKET' | 'TRACTION' | 'TEAM' | 'ASK';
  title: string;
  content: string[]; // Bullet points
  speakerNotes: string;
  visualPrompt?: string; // For generating slide background/image
}

export interface PitchDeck {
  id: string;
  title: string;
  createdAt: string;
  slides: Slide[];
  theme: 'MODERN_DARK' | 'MINIMAL_LIGHT' | 'BOLD_RED';
}

// Investor Module Types
export type InvestorStatus = 'PROSPECT' | 'CONTACTED' | 'MEETING' | 'DUE_DILIGENCE' | 'COMMITTED' | 'PASSED';

export interface Investor {
  id: string;
  name: string;
  firm: string;
  status: InvestorStatus;
  checkSize?: string;
  lastContact: string;
  notes: string;
}

export interface FundingRound {
  id: string;
  name: string; // e.g., Pre-Seed, Seed, Series A
  targetAmount: number;
  raisedAmount: number;
  preMoneyValuation: number;
  status: 'OPEN' | 'CLOSED';
}

// Onboarding Types
export interface OnboardingData {
  companyName: string;
  industry: string;
  stage: string;
  teamMembers: string[]; // emails
  focusModules: string[];
}

// Marketing Types
export interface MarketingCampaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  channel: 'Social' | 'Email' | 'Ads' | 'Content';
  budget: string;
  performance: string;
  startDate?: string;
  linkedGoalId?: string; // RELATIONSHIP: Link to Strategic Goal
}

// Product Types
export interface ProductFeature {
  id: string | number;
  name: string;
  status: 'Backlog' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  linkedIdeaId?: string; // RELATIONSHIP: Link back to Idea
  linkedGoalId?: string; // RELATIONSHIP: Link to Strategic Goal
}

// Sales Types
export type SalesStage = 'NEW' | 'DISCOVERY' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON';

export interface SalesDeal {
  id: string;
  leadName: string;
  company: string;
  value: number;
  stage: SalesStage;
  probability: number;
  lastActivity: string;
  linkedFeatureId?: string | number; // RELATIONSHIP: Link to Product Feature (Feature Request)
}

// Finance Types
export interface FinancialMetric {
  month: string;
  revenue: number;
  expenses: number;
  cashBalance: number;
}

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

// Legal Types
export interface LegalDoc {
  id: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'SIGNED' | 'FINAL';
  lastModified: string;
}

// --- PHASE 2 TYPES ---

// Operations & SOPs
export interface SOP {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  status: 'DRAFT' | 'PUBLISHED';
}

// HR & Talent
export interface JobRole {
  id: string;
  title: string;
  department: string;
  status: 'OPEN' | 'FILLED';
  candidatesCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  roleId: string;
  stage: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER';
  email: string;
}

// Customer Support
export interface Ticket {
  id: string;
  subject: string;
  customer: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created: string;
}

// Data Infrastructure
export interface DataSchema {
  table: string;
  description: string;
  rowCount: number;
  lastSync: string;
  status: 'HEALTHY' | 'SYNCING' | 'ERROR';
}

// R&D Lab
export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: 'RUNNING' | 'CONCLUDED' | 'PLANNED';
  result?: 'VALIDATED' | 'INVALIDATED';
  startDate: string;
}

// Supply Chain
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  stockLevel: number;
  reorderPoint: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
}

// Security
export interface ComplianceItem {
  id: string;
  control: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  lastAudit: string;
  framework: string;
}

// Community
export interface CommunityThread {
  id: string;
  title: string;
  author: string;
  replies: number;
  tags: string[];
  lastActive: string;
}

// --- MCP SERVERS ---
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  transport: 'SSE' | 'STDIO' | 'WEBSOCKET' | 'BROWSER';
  uri: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  capabilities: {
    resources: boolean;
    prompts: boolean;
    tools: boolean;
  };
  toolsCount: number;
  latencyMs: number;
}

// --- MARKETPLACE TYPES ---
export type AppCategory = 'ENGINEERING' | 'GROWTH' | 'FINANCE' | 'PRODUCTIVITY' | 'COMMUNICATION' | 'DESIGN' | 'DATA';

export interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  category: AppCategory;
  icon: string; // Lucide icon name mapped in UI
  author: string;
  installed: boolean;
  rating: number; // 1-5
  installCount: string; // e.g. "10k+"
  // New field: Automatically provisions this server when installed
  mcpConfig?: Omit<MCPServer, 'id' | 'status' | 'toolsCount' | 'latencyMs'>;
}

// --- LIGHTCAST TYPES ---
export interface LaborMarketData {
  role: string;
  location: string;
  medianSalary: number;
  postingVolume: number; // Monthly
  growthRate: number; // YoY
  topSkills: string[];
  salaryPercentiles: {
    p10: number;
    p50: number;
    p90: number;
  };
}