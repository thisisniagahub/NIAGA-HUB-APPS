
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getCanvas, saveCanvas, getSwot, addSwotItem, deleteSwotItem, getGoals, addGoal } from '../services/strategyService';
import { getFeatures } from '../services/productService'; // Import for Relationship UI
import { BusinessCanvas, SwotItem, StrategicGoal, ProductFeature } from '../types';

export const StrategyModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'CANVAS' | 'SWOT' | 'OKRS'>('CANVAS');
    const [canvas, setCanvas] = useState<BusinessCanvas | null>(null);
    const [swot, setSwot] = useState<SwotItem[]>([]);
    const [goals, setGoals] = useState<StrategicGoal[]>([]);
    
    // Relationship UI Data
    const [features, setFeatures] = useState<ProductFeature[]>([]);
    
    // Canvas Edit State
    const [isEditingCanvas, setIsEditingCanvas] = useState(false);
    const [newItemText, setNewItemText] = useState('');

    // Goal Modal State
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', deadline: '', owner: '' });

    useEffect(() => {
        const load = async () => {
            setCanvas(await getCanvas());
            setSwot(await getSwot());
            setGoals(await getGoals());
            setFeatures(await getFeatures()); // Load features for linking
        };
        load();
    }, []);

    const handleCanvasSave = () => {
        if (canvas) {
            saveCanvas(canvas);
            setIsEditingCanvas(false);
        }
    };

    const handleAddSwot = (type: SwotItem['type']) => {
        if (!newItemText) return;
        const newItem: SwotItem = {
            id: Date.now().toString(),
            type,
            content: newItemText
        };
        addSwotItem(newItem).then(setSwot);
        setNewItemText('');
    };

    const handleAddGoal = async () => {
        if (!newGoal.title) return;
        const goal: StrategicGoal = {
            id: Date.now().toString(),
            title: newGoal.title,
            deadline: newGoal.deadline,
            owner: newGoal.owner,
            progress: 0,
            status: 'ON_TRACK'
        };
        const updated = await addGoal(goal);
        setGoals(updated);
        setIsGoalModalOpen(false);
        setNewGoal({ title: '', deadline: '', owner: '' });
    };

    const CanvasSection = ({ title, field, height = 'h-64' }: { title: string, field: keyof BusinessCanvas, height?: string }) => (
        <Card className={`${height} flex flex-col`} title={title}>
            <div className="flex-1 overflow-y-auto space-y-2">
                {canvas?.[field]?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-neutral-900 rounded border border-neutral-800 text-sm group">
                        {isEditingCanvas ? (
                            <input 
                                className="w-full bg-transparent outline-none text-white"
                                value={item}
                                onChange={(e) => {
                                    const newCanvas = { ...canvas };
                                    newCanvas[field][i] = e.target.value;
                                    setCanvas(newCanvas);
                                }}
                            />
                        ) : (
                            <span className="text-neutral-300">{item}</span>
                        )}
                    </div>
                ))}
                {isEditingCanvas && (
                    <button 
                        onClick={() => {
                            const newCanvas = { ...canvas! };
                            newCanvas[field].push("New Item");
                            setCanvas(newCanvas);
                        }}
                        className="w-full py-2 border border-dashed border-neutral-800 text-xs text-neutral-500 rounded hover:text-white"
                    >
                        + Add
                    </button>
                )}
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Strategic Planning</h1>
                    <p className="text-neutral-400">Business modeling and high-level objectives.</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'CANVAS' && (
                        <Button onClick={() => isEditingCanvas ? handleCanvasSave() : setIsEditingCanvas(true)}>
                            {isEditingCanvas ? <><Icons.Check size={16} className="mr-2"/> Save Model</> : <><Icons.Edit2 size={16} className="mr-2"/> Edit Canvas</>}
                        </Button>
                    )}
                    {activeTab === 'OKRS' && (
                        <Button onClick={() => setIsGoalModalOpen(true)}><Icons.Plus size={16} className="mr-2"/> New Goal</Button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-800">
                {['CANVAS', 'SWOT', 'OKRS'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                    >
                        {tab === 'OKRS' ? 'Goals (OKRs)' : tab === 'CANVAS' ? 'Business Model Canvas' : 'SWOT Analysis'}
                    </button>
                ))}
            </div>

            {/* CANVAS VIEW */}
            {activeTab === 'CANVAS' && canvas && (
                <div className="grid grid-cols-5 gap-4 h-[800px] animate-fade-in">
                    <div className="col-span-1 space-y-4">
                        <CanvasSection title="Key Partners" field="keyPartners" height="h-[400px]" />
                        <CanvasSection title="Cost Structure" field="costStructure" height="h-[384px]" />
                    </div>
                    <div className="col-span-1 space-y-4">
                        <CanvasSection title="Key Activities" field="keyActivities" height="h-[192px]" />
                        <CanvasSection title="Key Resources" field="keyResources" height="h-[192px]" />
                    </div>
                    <div className="col-span-1">
                        <CanvasSection title="Value Propositions" field="valuePropositions" height="h-[800px]" />
                    </div>
                    <div className="col-span-1 space-y-4">
                        <CanvasSection title="Customer Relationships" field="customerRelationships" height="h-[192px]" />
                        <CanvasSection title="Channels" field="channels" height="h-[192px]" />
                    </div>
                    <div className="col-span-1 space-y-4">
                        <CanvasSection title="Customer Segments" field="customerSegments" height="h-[400px]" />
                        <CanvasSection title="Revenue Streams" field="revenueStreams" height="h-[384px]" />
                    </div>
                </div>
            )}

            {/* SWOT VIEW */}
            {activeTab === 'SWOT' && (
                <div className="grid grid-cols-2 gap-6 h-[600px] animate-fade-in">
                    {[
                        { type: 'STRENGTH', title: 'Strengths', color: 'bg-green-900/20 border-green-900/50', icon: Icons.TrendingUp, text: 'text-green-400' },
                        { type: 'WEAKNESS', title: 'Weaknesses', color: 'bg-red-900/20 border-red-900/50', icon: Icons.AlertCircle, text: 'text-red-400' },
                        { type: 'OPPORTUNITY', title: 'Opportunities', color: 'bg-blue-900/20 border-blue-900/50', icon: Icons.Lightbulb, text: 'text-blue-400' },
                        { type: 'THREAT', title: 'Threats', color: 'bg-orange-900/20 border-orange-900/50', icon: Icons.ShieldAlert, text: 'text-orange-400' }
                    ].map(quadrant => (
                        <div key={quadrant.type} className={`rounded-xl border p-4 flex flex-col ${quadrant.color}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <quadrant.icon className={quadrant.text} size={20} />
                                <h3 className={`font-bold ${quadrant.text}`}>{quadrant.title}</h3>
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto">
                                {swot.filter(s => s.type === quadrant.type).map(item => (
                                    <div key={item.id} className="flex justify-between items-center group">
                                        <span className="text-white text-sm">• {item.content}</span>
                                        <button onClick={() => deleteSwotItem(item.id).then(setSwot)} className="text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100">
                                            <Icons.X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex gap-2">
                                <input 
                                    className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white w-full outline-none focus:border-white/30"
                                    placeholder="Add item..."
                                    value={newItemText}
                                    onChange={e => setNewItemText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddSwot(quadrant.type as any)}
                                />
                                <button onClick={() => handleAddSwot(quadrant.type as any)} className="text-white hover:bg-white/10 p-1 rounded"><Icons.Plus size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* OKRS VIEW */}
            {activeTab === 'OKRS' && (
                <div className="animate-fade-in space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.map(goal => {
                            // Find linked features
                            const linkedFeatures = features.filter(f => f.linkedGoalId === String(goal.id));
                            
                            return (
                                <Card key={goal.id} className="group hover:border-primary-600/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                                                <span className="flex items-center gap-1"><Icons.User size={10} /> {goal.owner}</span>
                                                <span className="flex items-center gap-1"><Icons.Calendar size={10} /> {goal.deadline}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase 
                                            ${goal.status === 'ON_TRACK' ? 'bg-green-900/20 text-green-400' : 
                                              goal.status === 'AT_RISK' ? 'bg-red-900/20 text-red-400' : 
                                              goal.status === 'COMPLETED' ? 'bg-blue-900/20 text-blue-400' : 
                                              'bg-yellow-900/20 text-yellow-400'}`}>
                                            {goal.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-neutral-500 mb-1">
                                            <span>Progress</span>
                                            <span>{goal.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${goal.status === 'AT_RISK' ? 'bg-red-500' : goal.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary-600'}`} 
                                                style={{ width: `${goal.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Relationship UI: Linked Features */}
                                    <div className="pt-4 border-t border-neutral-800">
                                        <div className="flex items-center gap-2 mb-2 text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                            <Icons.Link size={10} /> Linked Features
                                        </div>
                                        {linkedFeatures.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {linkedFeatures.map(f => (
                                                    <div key={f.id} className="flex items-center gap-2 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            f.status === 'Done' ? 'bg-green-500' : 
                                                            f.status === 'In Progress' ? 'bg-blue-500' : 'bg-neutral-500'
                                                        }`} />
                                                        {f.name}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-neutral-600 italic">No features linked yet.</p>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add Goal Modal */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Create Strategic Goal</h3>
                            <button onClick={() => setIsGoalModalOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Objective Title</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="e.g. Expand to Europe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Target Date</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} placeholder="e.g. Q4 2026" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Owner</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newGoal.owner} onChange={e => setNewGoal({...newGoal, owner: e.target.value})} placeholder="Name or Team" />
                            </div>
                            <Button className="w-full" onClick={handleAddGoal}>Set Goal</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
