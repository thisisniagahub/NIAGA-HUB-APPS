
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getDataSchemas, runDataSync } from '../services/phase2Services';
import { DataSchema } from '../types';

export const DataModule: React.FC = () => {
    const [schemas, setSchemas] = useState<DataSchema[]>([]);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => { getDataSchemas().then(setSchemas); }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const updated = await runDataSync();
            setSchemas(updated);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Data Infrastructure</h1>
                    <p className="text-neutral-400">Schema governance and pipeline health.</p>
                </div>
                <Button onClick={handleSync} isLoading={syncing}><Icons.RefreshCw size={16} className="mr-2"/> Sync Catalogs</Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card title="Data Catalog">
                    <table className="w-full text-left text-sm">
                        <thead className="text-neutral-500 border-b border-neutral-800">
                            <tr>
                                <th className="pb-3 font-medium">Table Name</th>
                                <th className="pb-3 font-medium">Description</th>
                                <th className="pb-3 font-medium">Rows</th>
                                <th className="pb-3 font-medium">Last Sync</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-300">
                            {schemas.map(schema => (
                                <tr key={schema.table} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/30 transition-colors">
                                    <td className="py-4 font-mono text-primary-400">{schema.table}</td>
                                    <td className="py-4 text-neutral-400">{schema.description}</td>
                                    <td className="py-4 font-mono">{schema.rowCount.toLocaleString()}</td>
                                    <td className="py-4 text-neutral-500">{schema.lastSync}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${schema.status === 'HEALTHY' ? 'bg-green-500' : schema.status === 'SYNCING' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className="text-xs">{schema.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-right">
                                        <Button variant="ghost" size="sm"><Icons.Database size={14}/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
};
