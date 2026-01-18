
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { db } from '../services/localStorageDb';

export const DeveloperPage: React.FC = () => {
    const [keys, setKeys] = useState([
        { id: 'pk_live_1234', name: 'Production Key', created: '2 months ago', lastUsed: 'Just now' },
        { id: 'pk_test_5678', name: 'Staging Key', created: '1 week ago', lastUsed: '2 days ago' },
    ]);
    
    // Migration State
    const [migrating, setMigrating] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

    const createKey = () => {
        const newKey = { id: `pk_live_${Date.now()}`, name: 'New API Key', created: 'Just now', lastUsed: 'Never' };
        setKeys([...keys, newKey]);
    };

    const handleMigration = async () => {
        if (!confirm('This will upload all your local browser data to the production PostgreSQL server. Continue?')) return;
        
        setMigrating(true);
        setMigrationStatus('Preparing data package...');

        try {
            // 1. Gather all local data
            const payload = {
                companyName: 'My Local Startup',
                investors: db.get('investors', []),
                deals: db.get('sales_deals', []),
                features: db.get('product_features', [])
            };

            setMigrationStatus('Uploading to /api/v1/migrate...');

            // 2. Send to Backend
            const res = await fetch('http://localhost:3000/api/v1/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                setMigrationStatus(`Success! Migrated ${data.recordsCreated} records. Company ID: ${data.companyId}`);
            } else {
                setMigrationStatus('Migration failed: Server returned error.');
            }

        } catch (e: any) {
            console.error(e);
            setMigrationStatus(`Error: ${e.message}. Is the server running?`);
        } finally {
            setMigrating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Developer Settings</h1>
                    <p className="text-neutral-400">Manage API keys, Webhooks, and Infrastructure.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Migration Card (Phase 9) */}
                    <Card className="bg-gradient-to-r from-blue-900/10 to-transparent border-blue-900/30">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                                <Icons.DatabaseZap size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">Production Migration</h3>
                                <p className="text-sm text-neutral-400 mt-1 mb-4">
                                    You are currently running in <strong>LocalStorage Mode</strong>. 
                                    Sync your data to the production PostgreSQL database to enable team collaboration.
                                </p>
                                
                                {migrationStatus && (
                                    <div className={`mb-4 p-3 rounded text-sm font-mono ${migrationStatus.includes('Success') ? 'bg-green-900/20 text-green-400' : 'bg-neutral-900 text-neutral-300'}`}>
                                        {'>'} {migrationStatus}
                                    </div>
                                )}

                                <Button onClick={handleMigration} isLoading={migrating} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Icons.CloudUpload size={16} className="mr-2" />
                                    Migrate Data to Cloud
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card title="API Keys">
                        <div className="space-y-4" id="dev-api-keys">
                            {keys.map(key => (
                                <div key={key.id} className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                                    <div>
                                        <div className="font-medium text-white">{key.name}</div>
                                        <div className="font-mono text-xs text-neutral-500 mt-1">{key.id}</div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                        <span>Last used: {key.lastUsed}</span>
                                        <Button variant="outline" size="sm">Revoke</Button>
                                    </div>
                                </div>
                            ))}
                            <Button onClick={createKey} className="w-full border-dashed border-neutral-700 bg-transparent hover:bg-neutral-800">
                                <Icons.Plus size={14} className="mr-2"/> Generate New Secret Key
                            </Button>
                        </div>
                    </Card>

                    <Card title="Webhooks">
                        <div className="p-8 text-center text-neutral-500">
                            <Icons.Webhook size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No endpoints configured. <span className="text-primary-400 cursor-pointer">Add Endpoint</span></p>
                        </div>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    <Card title="Documentation">
                        <ul className="space-y-2">
                            {['Authentication', 'Rate Limits', 'Errors', 'Pagination'].map(item => (
                                <li key={item} className="flex items-center justify-between p-2 hover:bg-neutral-900 rounded cursor-pointer group">
                                    <span className="text-sm text-neutral-400 group-hover:text-white">{item}</span>
                                    <Icons.ChevronRight size={14} className="text-neutral-600 group-hover:text-white" />
                                </li>
                            ))}
                        </ul>
                    </Card>
                    
                    <Card title="Environment Info">
                         <div className="space-y-2 text-xs font-mono">
                             <div className="flex justify-between">
                                 <span className="text-neutral-500">Node Version</span>
                                 <span className="text-white">v18.17.0</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-neutral-500">React</span>
                                 <span className="text-white">v18.2.0</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-neutral-500">Database</span>
                                 <span className="text-green-500">PostgreSQL 15</span>
                             </div>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
