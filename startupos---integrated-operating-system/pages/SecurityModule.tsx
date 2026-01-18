
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getComplianceItems, runSecurityAudit } from '../services/phase2Services';
import { ComplianceItem } from '../types';

export const SecurityModule: React.FC = () => {
    const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
    const [auditing, setAuditing] = useState(false);

    useEffect(() => { getComplianceItems().then(setCompliance); }, []);

    const handleAudit = async () => {
        setAuditing(true);
        try {
            const updated = await runSecurityAudit();
            setCompliance(updated);
        } finally {
            setAuditing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Security & Risk</h1>
                    <p className="text-neutral-400">Compliance monitoring (SOC2, GDPR, ISO).</p>
                </div>
                <Button variant="outline" onClick={handleAudit} isLoading={auditing}>
                    <Icons.ShieldCheck size={16} className="mr-2"/> Run Audit
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-green-900/10 border-green-900/30">
                    <div className="text-green-500 mb-2"><Icons.CheckCircle size={24} /></div>
                    <div className="text-2xl font-bold text-white">94%</div>
                    <div className="text-sm text-neutral-400">Security Score</div>
                </Card>
                <Card>
                    <div className="text-red-500 mb-2"><Icons.AlertTriangle size={24} /></div>
                    <div className="text-2xl font-bold text-white">{compliance.filter(c => c.status === 'FAIL').length}</div>
                    <div className="text-sm text-neutral-400">Critical Risks</div>
                </Card>
                <Card>
                     <div className="text-blue-500 mb-2"><Icons.FileCheck size={24} /></div>
                    <div className="text-2xl font-bold text-white">SOC2</div>
                    <div className="text-sm text-neutral-400">Target Framework</div>
                </Card>
                 <Card>
                     <div className="text-purple-500 mb-2"><Icons.Users size={24} /></div>
                    <div className="text-2xl font-bold text-white">100%</div>
                    <div className="text-sm text-neutral-400">Employee Training</div>
                </Card>
            </div>

            <Card title="Compliance Controls">
                <div className="space-y-1">
                    {compliance.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 hover:bg-neutral-900/50 rounded-lg transition-colors border border-transparent hover:border-neutral-800">
                            <div className="flex items-center gap-4">
                                {item.status === 'PASS' ? <Icons.CheckCircle size={18} className="text-green-500" /> : 
                                 item.status === 'WARNING' ? <Icons.AlertCircle size={18} className="text-yellow-500" /> : 
                                 <Icons.XCircle size={18} className="text-red-500" />}
                                <div>
                                    <h4 className="text-white font-medium text-sm">{item.control}</h4>
                                    <p className="text-xs text-neutral-500">Framework: {item.framework}</p>
                                </div>
                            </div>
                            <div className="text-xs text-neutral-500">
                                Last Audit: {item.lastAudit}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
