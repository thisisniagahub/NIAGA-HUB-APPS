
import { BusinessCanvas, SwotItem, StrategicGoal } from '../types';
import { db } from './localStorageDb';

const DEFAULT_CANVAS: BusinessCanvas = {
    keyPartners: ['Cloud Providers', 'Payment Processor'],
    keyActivities: ['Product Development', 'Marketing'],
    keyResources: ['Engineering Team', 'IP'],
    valuePropositions: ['Integrated OS for Founders', 'AI-driven insights'],
    customerRelationships: ['Self-service', 'Community'],
    channels: ['Direct Sales', 'App Store'],
    customerSegments: ['Early-stage Founders', 'Solopreneurs'],
    costStructure: ['Server Costs', 'Salaries'],
    revenueStreams: ['SaaS Subscription']
};

const DEFAULT_SWOT: SwotItem[] = [
    { id: '1', type: 'STRENGTH', content: 'Integrated ecosystem' },
    { id: '2', type: 'WEAKNESS', content: 'Limited brand awareness' },
    { id: '3', type: 'OPPORTUNITY', content: 'Market consolidation' },
    { id: '4', type: 'THREAT', content: 'Big tech copying features' }
];

const DEFAULT_GOALS: StrategicGoal[] = [
    { id: '1', title: 'Reach $1M ARR', progress: 45, status: 'ON_TRACK', deadline: 'Q4 2025', owner: 'Founder' },
    { id: '2', title: 'Launch Mobile App', progress: 10, status: 'BEHIND', deadline: 'Q3 2025', owner: 'Product' }
];

export const getCanvas = async (): Promise<BusinessCanvas> => db.get('strategy_canvas', DEFAULT_CANVAS);
export const saveCanvas = async (canvas: BusinessCanvas): Promise<void> => db.set('strategy_canvas', canvas);

export const getSwot = async (): Promise<SwotItem[]> => db.get('strategy_swot', DEFAULT_SWOT);
export const addSwotItem = async (item: SwotItem): Promise<SwotItem[]> => db.addItem('strategy_swot', item, DEFAULT_SWOT);
export const deleteSwotItem = async (id: string): Promise<SwotItem[]> => db.deleteItem('strategy_swot', id, DEFAULT_SWOT);

export const getGoals = async (): Promise<StrategicGoal[]> => db.get('strategy_goals', DEFAULT_GOALS);
export const addGoal = async (goal: StrategicGoal): Promise<StrategicGoal[]> => db.addItem('strategy_goals', goal, DEFAULT_GOALS);
export const updateGoal = async (id: string, updates: Partial<StrategicGoal>): Promise<StrategicGoal[]> => db.updateItem('strategy_goals', id, updates, DEFAULT_GOALS);
