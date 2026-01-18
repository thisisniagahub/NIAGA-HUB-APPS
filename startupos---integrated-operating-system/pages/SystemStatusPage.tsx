
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { checkSystemHealth, runAiTest, factoryReset } from '../services/systemService';
import { motion } from 'framer-motion';

export const SystemStatusPage: React.FC = () => {
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [aiTestResult, setAiTestResult] = useState<any>(null);
    const [testingAi, setTestingAi] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const res = await checkSystemHealth();
        setHealth(res);
        setLoading(false);
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    const handleAiTest = async () => {
        setTestingAi(true);
        const res = await runAiTest();
        setAiTestResult(res);
        setTestingAi(false);
    };

    const handleReset = () => {
        if (confirm("⚠️ FACTORY RESET WARNING ⚠️\n\nThis will delete ALL local data (Investors, Deals, Settings). This action cannot be undone.\n\nAre you sure?")) {
            factoryReset();
        }
    };

    const StatusIndicator = ({ status, label }: { status: string; label: string }) => {
        const color = status === 'ONLINE' || status === 'SYNCED' ? 'text-green-500' : 
                      status === 'OFFLINE' ? 'text-red-500' : 'text-yellow-500';
        const bg = status === 'ONLINE' || status === 'SYNCED' ? 'bg-green-500/20' : 
                   status === 'OFFLINE' ? 'bg-red-500/20' : 'bg-yellow-500/20';
        
        return (
            <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bg} ${color}`}>
                        <Icons.Activity size={20} />
                    </div>
                    <span className="font-medium text-white">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded border border-white/5 ${bg} ${color}`}>
                        {status}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Icons.Cpu className="text-primary-500" />
                    System Status & Diagnostics
                </h1>
                <p className="text-neutral-400">
                    Real-time monitoring of StartupOS core services, AI connectivity, and data integrity.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <Icons.Loader2 size={48} className="animate-spin text-primary-500" />
                        <p className="text-neutral-500 text-sm font-mono">RUNNING_DIAGNOSTICS...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Infrastructure Column */}
                    <div className="space-y-6">
                        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Infrastructure</h2>
                        <StatusIndicator label="Gemini AI Gateway" status={health.ai} />
                        <StatusIndicator label="Backend API" status={health.backend} />
                        <StatusIndicator label="Database Sync" status={health.database} />
                        
                        <Card className="border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-white">Browser Persistence</h3>
                                <Icons.Database size={18} className="text-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <div className="text-2xl font-mono text-white">{health.localStorage.count}</div>
                                    <div className="text-xs text-neutral-500">Active Collections</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-mono text-white">{(health.localStorage.used / 1024).toFixed(2)} KB</div>
                                    <div className="text-xs text-neutral-500">Storage Used</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Actions Column */}
                    <div className="space-y-6">
                        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Active Tests</h2>
                        
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Icons.Sparkles size={16} className="text-purple-500" /> AI Response Test
                                </h3>
                                <Button size="sm" onClick={handleAiTest} isLoading={testingAi} variant="outline">
                                    Run Test
                                </Button>
                            </div>
                            <div className="bg-black rounded-lg p-3 border border-neutral-800 font-mono text-xs text-neutral-400 min-h-[80px]">
                                {testingAi ? (
                                    <span className="animate-pulse">Waiting for Gemini...</span>
                                ) : aiTestResult ? (
                                    aiTestResult.success ? (
                                        <span className="text-green-400">
                                            [SUCCESS] {aiTestResult.output}
                                        </span>
                                    ) : (
                                        <span className="text-red-400">
                                            [FAIL] {aiTestResult.error}
                                        </span>
                                    )
                                ) : (
                                    "Ready to test AI latency and response."
                                )}
                            </div>
                        </Card>

                        <Card className="border-red-900/30 bg-red-900/5">
                            <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                                <Icons.Trash2 size={16} className="text-red-500" /> Danger Zone
                            </h3>
                            <p className="text-sm text-neutral-400 mb-4">
                                Resetting the system will wipe all locally stored data and restore default seed data.
                            </p>
                            <Button variant="danger" className="w-full" onClick={handleReset}>
                                Factory Reset System
                            </Button>
                        </Card>

                        <div className="text-center pt-4">
                            <p className="text-xs text-neutral-600">
                                System Latency: <span className="font-mono text-neutral-400">{health.latency}ms</span> • Version: <span className="font-mono text-neutral-400">1.0.0-gold</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
