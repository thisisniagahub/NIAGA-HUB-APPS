
import { Workspace } from '../types';
import { db } from './localStorageDb';

const SEED_WORKSPACES: Workspace[] = [
    { id: '1', name: 'My Startup', role: 'Owner', createdAt: '2023-01-01' },
    { id: '2', name: 'Side Project', role: 'Admin', createdAt: '2023-06-15' }
];

export const getWorkspaces = async (): Promise<Workspace[]> => {
    return db.get<Workspace[]>('workspaces', SEED_WORKSPACES);
};

export const createWorkspace = async (name: string): Promise<Workspace[]> => {
    const newWs: Workspace = {
        id: Date.now().toString(),
        name,
        role: 'Owner',
        createdAt: new Date().toISOString()
    };
    return db.addItem('workspaces', newWs, SEED_WORKSPACES);
};

export const switchWorkspace = async (id: string): Promise<void> => {
    // In a real app, this would trigger a context refresh or API token switch
    // For local demo, we just simulate the delay and persist current selection
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem('current_workspace', id);
};
