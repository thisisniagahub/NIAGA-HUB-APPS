
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getExperiments, addExperiment } from '../services/phase2Services';
import { Experiment } from '../types';

export const LabModule: React.FC = () => {
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newExp, setNewExp] = useState({ name: '', hypothesis: '' });

    useEffect(() => { getExperiments().then(setExperiments); }, []);

    const handleCreate = async () => {
        if (!newExp.name) return;
        const exp: Experiment = {
            id: Date.now().toString(),
            name: newExp.name,
            hypothesis: newExp.hypothesis,
            status: 'PLANNED',
            startDate: new Date().toLocaleDateString()
        };
        const updated = await addExperiment(exp);
        setExperiments(updated);
        setIsAddOpen(false);
        setNewExp({ name: '', hypothesis: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Innovation Lab</h1>
                    <p className="text-neutral-400">Track experiments and R&D bets.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)}><Icons.FlaskConical size={16} className="mr-2"/> New Experiment</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiments.map(exp => (
                    <Card key={exp.id} className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icons.FlaskConical size={64} />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                exp.status === 'RUNNING' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' : 
                                exp.status === 'PLANNED' ? 'bg-neutral-800 text-neutral-400' :
                                'bg-green-900/30 text-green-400'
                            }`}>
                                {exp.status}
                            </span>
                            {exp.result && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${exp.result === 'VALIDATED' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    {exp.result}
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{exp.name}</h3>
                        <p className="text-sm text-neutral-400 mb-4">{exp.hypothesis}</p>
                        <div className="pt-4 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-500">
                            <Icons.Calendar size={12} />
                            Started: {exp.startDate}
                        </div>
                    </Card>
                ))}
                
                <Card 
                    className="border-dashed border-neutral-800 bg-transparent flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-900/30 transition-colors min-h-[200px]"
                    onClick={() => setIsAddOpen(true)}
                >
                    <Icons.Plus size={32} className="text-neutral-600 mb-2" />
                    <span className="text-neutral-500 font-medium">Propose Hypothesis</span>
                </Card>
            </div>

            {/* Create Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">New Experiment</h3>
                            <button onClick={() => setIsAddOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Experiment Name</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newExp.name} onChange={e => setNewExp({...newExp, name: e.target.value})} placeholder="e.g. Freemium Model Test" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Hypothesis</label>
                                <textarea className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white h-24 resize-none" value={newExp.hypothesis} onChange={e => setNewExp({...newExp, hypothesis: e.target.value})} placeholder="We believe that..." />
                            </div>
                            <Button className="w-full" onClick={handleCreate}>Launch Experiment</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
