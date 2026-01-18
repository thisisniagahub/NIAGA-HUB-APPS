
import { 
    SOP, JobRole, Candidate, Ticket, DataSchema, 
    Experiment, InventoryItem, ComplianceItem, CommunityThread 
} from '../types';
import { db } from './localStorageDb';

// --- SEED DATA ---
const SEED_SOPS: SOP[] = [
    { id: '1', title: 'Employee Onboarding', category: 'HR', lastUpdated: '2 days ago', status: 'PUBLISHED' },
    { id: '2', title: 'Incident Response', category: 'Engineering', lastUpdated: '1 week ago', status: 'PUBLISHED' },
    { id: '3', title: 'Refund Policy', category: 'Support', lastUpdated: '1 month ago', status: 'DRAFT' },
];

const SEED_JOBS: JobRole[] = [
    { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', status: 'OPEN', candidatesCount: 12 },
    { id: '2', title: 'Product Manager', department: 'Product', status: 'OPEN', candidatesCount: 5 },
    { id: '3', title: 'Sales Rep', department: 'Sales', status: 'FILLED', candidatesCount: 0 },
];

const SEED_TICKETS: Ticket[] = [
    { id: '101', subject: 'Login failing on mobile', customer: 'Acme Corp', priority: 'HIGH', status: 'OPEN', created: '2 hours ago' },
    { id: '102', subject: 'Feature request: Dark mode export', customer: 'John Doe', priority: 'LOW', status: 'IN_PROGRESS', created: '1 day ago' },
    { id: '103', subject: 'Billing question', customer: 'Stark Ind', priority: 'MEDIUM', status: 'RESOLVED', created: '3 days ago' },
];

const SEED_SCHEMAS: DataSchema[] = [
    { table: 'users', description: 'Core user identity data', rowCount: 15420, lastSync: '5 mins ago', status: 'HEALTHY' },
    { table: 'events', description: 'Raw clickstream events', rowCount: 1250000, lastSync: '1 min ago', status: 'SYNCING' },
];

const SEED_EXPERIMENTS: Experiment[] = [
    { id: '1', name: 'New Pricing Tier', hypothesis: 'Adding a Pro tier increases ARPU by 10%', status: 'RUNNING', startDate: 'Oct 1' },
];

const SEED_INVENTORY: InventoryItem[] = [
    { id: '1', sku: 'HW-DEV-001', name: 'Developer Laptop (MacBook Pro)', stockLevel: 5, reorderPoint: 3, status: 'OK' },
];

const SEED_COMPLIANCE: ComplianceItem[] = [
    { id: '1', control: 'Data Encryption at Rest', framework: 'SOC2', status: 'PASS', lastAudit: 'Oct 20' },
    { id: '2', control: 'Access Control Policy', framework: 'SOC2', status: 'WARNING', lastAudit: 'Sep 15' },
    { id: '3', control: 'Incident Response Plan', framework: 'ISO 27001', status: 'PASS', lastAudit: 'Oct 01' },
];

const SEED_THREADS: CommunityThread[] = [
    { id: '1', title: 'Best practices for API rate limiting?', author: 'dev_guru', replies: 14, tags: ['api', 'dev'], lastActive: '10 mins ago' },
];

// --- OPERATIONS ---
export const getSOPs = async (): Promise<SOP[]> => db.get('sops', SEED_SOPS);
export const addSOP = async (sop: SOP): Promise<SOP[]> => db.addItem('sops', sop, SEED_SOPS);

// --- HR ---
export const getJobRoles = async (): Promise<JobRole[]> => db.get('jobs', SEED_JOBS);
export const addJobRole = async (job: JobRole): Promise<JobRole[]> => db.addItem('jobs', job, SEED_JOBS);

export const getCandidates = async (): Promise<Candidate[]> => db.get('candidates', [
    { id: '1', name: 'Alice Smith', roleId: '1', stage: 'INTERVIEW', email: 'alice@example.com' },
    { id: '2', name: 'Bob Jones', roleId: '1', stage: 'SCREENING', email: 'bob@example.com' },
]);
export const addCandidate = async (candidate: Candidate): Promise<Candidate[]> => db.addItem('candidates', candidate, []);

// --- SUPPORT ---
export const getTickets = async (): Promise<Ticket[]> => db.get('tickets', SEED_TICKETS);
export const addTicket = async (ticket: Ticket): Promise<Ticket[]> => db.addItem('tickets', ticket, SEED_TICKETS);

// --- DATA ---
export const getDataSchemas = async (): Promise<DataSchema[]> => db.get('schemas', SEED_SCHEMAS);
export const runDataSync = async (): Promise<DataSchema[]> => {
    await new Promise(r => setTimeout(r, 1500));
    const schemas = db.get<DataSchema[]>('schemas', SEED_SCHEMAS);
    // Simulate updates
    const updated = schemas.map(s => ({
        ...s,
        lastSync: 'Just now',
        status: 'HEALTHY' as const,
        rowCount: s.rowCount + Math.floor(Math.random() * 100)
    }));
    db.set('schemas', updated);
    return updated;
};

// --- LAB ---
export const getExperiments = async (): Promise<Experiment[]> => db.get('experiments', SEED_EXPERIMENTS);
export const addExperiment = async (exp: Experiment): Promise<Experiment[]> => db.addItem('experiments', exp, SEED_EXPERIMENTS);

// --- SUPPLY ---
export const getInventory = async (): Promise<InventoryItem[]> => db.get('inventory', SEED_INVENTORY);
export const addInventoryItem = async (item: InventoryItem): Promise<InventoryItem[]> => db.addItem('inventory', item, SEED_INVENTORY);

// --- SECURITY ---
export const getComplianceItems = async (): Promise<ComplianceItem[]> => db.get('compliance', SEED_COMPLIANCE);
export const runSecurityAudit = async (): Promise<ComplianceItem[]> => {
    await new Promise(r => setTimeout(r, 2000));
    const items = db.get<ComplianceItem[]>('compliance', SEED_COMPLIANCE);
    const updated = items.map(i => ({
        ...i,
        lastAudit: 'Just now',
        status: Math.random() > 0.8 ? 'WARNING' : 'PASS' as any
    }));
    db.set('compliance', updated);
    return updated;
};

// --- COMMUNITY ---
export const getThreads = async (): Promise<CommunityThread[]> => db.get('threads', SEED_THREADS);
export const addThread = async (thread: CommunityThread): Promise<CommunityThread[]> => db.addItem('threads', thread, SEED_THREADS);
