
import { FinancialMetric, Transaction } from '../types';
import { db } from './localStorageDb';

const MOCK_FINANCE_DATA: FinancialMetric[] = [
    { month: 'Jan', revenue: 4000, expenses: 8000, cashBalance: 50000 },
    { month: 'Feb', revenue: 6500, expenses: 8200, cashBalance: 48300 },
    { month: 'Mar', revenue: 9000, expenses: 8500, cashBalance: 48800 },
    { month: 'Apr', revenue: 12000, expenses: 9000, cashBalance: 51800 },
    { month: 'May', revenue: 15500, expenses: 9500, cashBalance: 57800 },
    { month: 'Jun', revenue: 21000, expenses: 10000, cashBalance: 68800 },
];

const SEED_TRANSACTIONS: Transaction[] = [
    { id: '1', description: 'AWS Infrastructure', category: 'Software', amount: 1240, date: '2024-05-24', type: 'EXPENSE' },
    { id: '2', description: 'Stripe Payout', category: 'Revenue', amount: 4500, date: '2024-05-23', type: 'INCOME' },
    { id: '3', description: 'WeWork Rent', category: 'Office', amount: 2000, date: '2024-05-01', type: 'EXPENSE' },
];

export const getFinancialMetrics = async (): Promise<FinancialMetric[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...MOCK_FINANCE_DATA];
};

export const getRunwayData = async () => {
    return {
        burnRate: 9500,
        runwayMonths: 18,
        cashOnHand: 175000
    };
};

export const getTransactions = async (): Promise<Transaction[]> => db.get('finance_transactions', SEED_TRANSACTIONS);

export const addTransaction = async (tx: Transaction): Promise<Transaction[]> => db.addItem('finance_transactions', tx, SEED_TRANSACTIONS);
