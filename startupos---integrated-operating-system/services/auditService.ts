
import { db } from './localStorageDb';

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  resource: string;
  timestamp: string;
  ip: string;
  status: 'SUCCESS' | 'FAILURE';
}

const SEED_LOGS: AuditLog[] = [
    { id: '1', action: 'LOGIN', actor: 'admin@startupos.com', resource: 'Auth', timestamp: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.1', status: 'SUCCESS' },
    { id: '2', action: 'EXPORT_DATA', actor: 'admin@startupos.com', resource: 'CRM Contacts', timestamp: new Date(Date.now() - 43200000).toISOString(), ip: '192.168.1.1', status: 'SUCCESS' },
];

export const logAction = (action: string, resource: string, details?: string) => {
    const newLog: AuditLog = {
        id: Date.now().toString(),
        action,
        actor: 'Current User', // In real app, get from AuthContext
        resource,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1', // Mock IP
        status: 'SUCCESS'
    };
    db.addItem('audit_logs', newLog, SEED_LOGS);
    console.log(`[AUDIT] ${action} on ${resource}`);
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    return db.get('audit_logs', SEED_LOGS).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
