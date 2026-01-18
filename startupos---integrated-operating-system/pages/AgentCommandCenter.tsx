
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { realtime } from '../services/realtimeService';

interface AgentJob {
    id: string;
    name: string;
    type: 'MONITOR' | 'RESPONDER' | 'SCRAPER';
    status: 'ACTIVE' | 'PAUSED' | 'ERROR';
    lastRun: string;
    stats: string;
}

export const AgentCommandCenter: React.FC = () => {
    const [agents, setAgents] = useState<AgentJob[]>([
        { id: '1', name: 'Burn Rate Watchdog', type: 'MONITOR', status: 'ACTIVE', lastRun: '5 mins ago', stats: 'Checked 14 metrics' },
        { id: '2', name: 'Lead Auto-Responder', type: 'RESPONDER', status: 'ACTIVE', lastRun: '1 hour ago', stats: 'Replied to 3 emails' },
        { id: '3', name: 'Competitor News', type: 'SCRAPER', status: 'PAUSED', lastRun: '1 day ago', stats: 'Indexed 4 articles' },
    ]);

    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Listen for agent logs via mock realtime
        const handleAlert = (data: any) => {
            setLogs(prev => [`[ALERT] ${data.message}`, ...prev.slice(0, 10)]);
        };
        realtime.on('alert', handleAlert);
    }, []);

    const toggleAgent = (id: string) => {
        setAgents(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : a));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Agent Command Center</h1>
                    <p className="text-neutral-400">Manage autonomous background workers.</p>
                </div>
                <Button><Icons.Bot size={16} className="mr-2"/> Deploy New Agent</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4" id="agent-list"> {/* Targeted by Tutorial */}
                    {agents.map(agent => (
                        <Card key={agent.id} className="border-l-4 border-l-primary-600">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${
                                        agent.type === 'MONITOR' ? 'bg-blue-900/20 text-blue-400' :
                                        agent.type === 'RESPONDER' ? 'bg-green-900/20 text-green-400' :
                                        'bg-purple-900/20 text-purple-400'
                                    }`}>
                                        {agent.type === 'MONITOR' ? <Icons.Activity size={24}/> :
                                         agent.type === 'RESPONDER' ? <Icons.MessageSquare size={24}/> :
                                         <Icons.Globe size={24}/>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{agent.name}</h3>
                                        <div className="flex gap-3 text-xs text-neutral-500 mt-1">
                                            <span className="flex items-center gap-1"><Icons.Clock size={10}/> Last run: {agent.lastRun}</span>
                                            <span className="flex items-center gap-1"><Icons.BarChart size={10}/> {agent.stats}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        agent.status === 'ACTIVE' ? 'bg-green-900/20 text-green-400 animate-pulse' : 'bg-neutral-800 text-neutral-500'
                                    }`}>
                                        {agent.status}
                                    </span>
                                    <button 
                                        onClick={() => toggleAgent(agent.id)}
                                        className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white"
                                    >
                                        {agent.status === 'ACTIVE' ? <Icons.PauseCircle size={24}/> : <Icons.PlayCircle size={24}/>}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                     <Card title="Live Agent Logs">
                        <div className="space-y-2 h-[300px] overflow-y-auto bg-black p-2 rounded border border-neutral-900 font-mono text-xs">
                            {logs.map((log, i) => (
                                <div key={i} className="text-primary-400 border-b border-neutral-900 pb-1 mb-1 last:border-0">
                                    <span className="text-neutral-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    {log}
                                </div>
                            ))}
                            <div className="text-neutral-500">System listening for events...</div>
                        </div>
                     </Card>
                </div>
            </div>
        </div>
    );
};
