import { SalesDeal } from '../types';
import { db } from './localStorageDb';

const SEED_DEALS: SalesDeal[] = [
    { id: '1', leadName: 'Acme Corp', company: 'Acme Inc', value: 12000, stage: 'PROPOSAL', probability: 60, lastActivity: '2 days ago' },
    { id: '2', leadName: 'Stark Industries', company: 'Stark Ind', value: 50000, stage: 'DISCOVERY', probability: 20, lastActivity: '4 hours ago' },
    { id: '3', leadName: 'Wayne Enterprises', company: 'Wayne Ent', value: 8500, stage: 'NEGOTIATION', probability: 80, lastActivity: '1 day ago' },
    { id: '4', leadName: 'Cyberdyne', company: 'Cyberdyne Sys', value: 24000, stage: 'NEW', probability: 10, lastActivity: 'Just now' },
    { id: '5', leadName: 'Massive Dynamic', company: 'Massive Dyn', value: 15000, stage: 'CLOSED_WON', probability: 100, lastActivity: '1 week ago' },
];

export const getSalesDeals = async (): Promise<SalesDeal[]> => {
    return db.get<SalesDeal[]>('sales_deals', SEED_DEALS);
};

export const updateDealStage = async (id: string, stage: SalesDeal['stage']): Promise<void> => {
    db.updateItem('sales_deals', id, { stage }, SEED_DEALS);
};

export const addDeal = async (deal: SalesDeal): Promise<void> => {
    db.addItem('sales_deals', deal, SEED_DEALS);
};