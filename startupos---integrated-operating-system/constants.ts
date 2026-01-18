
import { ModuleConfig } from './types';

export const APP_NAME = "StartupOS";

export const MODULES: ModuleConfig[] = [
  // MVP Modules
  { id: 'ideation', name: 'Ideation & Innovation', description: 'Validate and refine startup ideas.', icon: 'Lightbulb', path: '/ideation', phase: 'MVP', category: 'STRATEGY' },
  { id: 'market', name: 'Market Research', description: 'Competitive intelligence & market sizing.', icon: 'Search', path: '/market-research', phase: 'MVP', category: 'STRATEGY' },
  { id: 'strategy', name: 'Strategic Planning', description: 'Business modeling & canvas.', icon: 'Map', path: '/strategy', phase: 'MVP', category: 'STRATEGY' },
  { id: 'legal', name: 'Legal & Compliance', description: 'Incorporation & document vault.', icon: 'Scale', path: '/legal', phase: 'MVP', category: 'STRATEGY' },
  { id: 'product', name: 'Product Development', description: 'Roadmapping & PRDs.', icon: 'Box', path: '/product', phase: 'MVP', category: 'EXECUTION' },
  { id: 'marketing', name: 'Brand & Growth', description: 'Marketing campaigns & assets.', icon: 'Megaphone', path: '/marketing', phase: 'MVP', category: 'GROWTH' },
  { id: 'sales', name: 'Sales & CRM', description: 'Pipeline & lead management.', icon: 'DollarSign', path: '/sales', phase: 'MVP', category: 'GROWTH' },
  { id: 'finance', name: 'Finance & Accounting', description: 'Burn rate, runway, and P&L.', icon: 'PieChart', path: '/finance', phase: 'MVP', category: 'OPERATIONS' },
  
  // Phase 2 Modules
  { id: 'ops', name: 'Operations & SOPs', description: 'Standard operating procedures.', icon: 'Settings', path: '/ops', phase: 'PHASE_2', category: 'OPERATIONS' },
  { id: 'hr', name: 'HR & Talent', description: 'Hiring & team management.', icon: 'Users', path: '/hr', phase: 'PHASE_2', category: 'OPERATIONS' },
  { id: 'support', name: 'Customer Experience', description: 'Support tickets & feedback.', icon: 'HeartHandshake', path: '/support', phase: 'PHASE_2', category: 'GROWTH' },
  { id: 'analytics', name: 'Analytics & BI', description: 'Deep data insights.', icon: 'BarChart2', path: '/analytics', phase: 'PHASE_2', category: 'DATA' },
  { id: 'data', name: 'Data Infrastructure', description: 'Governance & compliance.', icon: 'Database', path: '/data', phase: 'PHASE_2', category: 'DATA' },
  { id: 'lab', name: 'R&D Lab', description: 'Experimental projects.', icon: 'FlaskConical', path: '/lab', phase: 'PHASE_2', category: 'STRATEGY' },
  { id: 'community', name: 'Community', description: 'Forum & engagement.', icon: 'MessageCircle', path: '/community', phase: 'PHASE_2', category: 'GROWTH' },
  { id: 'supply', name: 'Supply Chain', description: 'Inventory & logistics.', icon: 'Truck', path: '/supply', phase: 'PHASE_2', category: 'OPERATIONS' },
  { id: 'security', name: 'Security & Risk', description: 'Compliance & privacy.', icon: 'ShieldCheck', path: '/security', phase: 'PHASE_2', category: 'OPERATIONS' },
  { id: 'investor', name: 'Investor Relations', description: 'Fundraising & reporting.', icon: 'Briefcase', path: '/investor', phase: 'PHASE_2', category: 'STRATEGY' },
];

export const MOCK_KPIS = [
  { id: 'mrr', label: 'MRR', value: '$12,450', trend: 15, trendDirection: 'up' },
  { id: 'churn', label: 'Churn Rate', value: '1.2%', trend: -0.5, trendDirection: 'up' }, // down is good for churn, represented logically in UI
  { id: 'runway', label: 'Runway', value: '14 Mo', trend: 0, trendDirection: 'neutral' },
  { id: 'cac', label: 'CAC', value: '$145', trend: 5, trendDirection: 'down' },
];
