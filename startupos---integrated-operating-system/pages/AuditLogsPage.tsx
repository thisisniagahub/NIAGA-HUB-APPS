
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getAuditLogs, AuditLog } from '../services/auditService';

export const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        getAuditLogs().then(setLogs);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Security Audit Logs</h1>
                    <p className="text-neutral-400">Immutable record of all system activities for compliance.</p>
                </div>
                <Button variant="outline"><Icons.Download size={16} className="mr-2"/> Export CSV</Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm" id="audit-table"> {/* Targeted by Tutorial */}
                        <thead className="text-neutral-500 border-b border-neutral-800 bg-neutral-900/50">
                            <tr>
                                <th className="px-4 py-3 font-medium">Timestamp</th>
                                <th className="px-4 py-3 font-medium">Actor</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                                <th className="px-4 py-3 font-medium">Resource</th>
                                <th className="px-4 py-3 font-medium">IP Address</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-300">
                            {logs.map(log => (
                                <tr key={log.id} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/30 font-mono text-xs">
                                    <td className="px-4 py-3 text-neutral-500">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-white">{log.actor}</td>
                                    <td className="px-4 py-3 font-bold text-primary-400">{log.action}</td>
                                    <td className="px-4 py-3">{log.resource}</td>
                                    <td className="px-4 py-3 text-neutral-500">{log.ip}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 'SUCCESS' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
