
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getSalesDeals, addDeal, updateDealStage } from '../services/salesService';
import { generateSalesEmail } from '../services/geminiService';
import { SalesDeal, SalesStage } from '../types';
import * as Icons from 'lucide-react';
import { CRUDTable, Column } from '../components/ui/CRUDTable';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { useToast } from '../context/ToastContext';
import { db } from '../services/localStorageDb';
import { exportToCSV } from '../services/csvService';
import { EntityLinker } from '../components/ui/EntityLinker';
import confetti from 'canvas-confetti';

export const SalesModule: React.FC = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'PIPELINE' | 'LIST' | 'ANALYTICS'>('PIPELINE');
    const [deals, setDeals] = useState<SalesDeal[]>([]);
    const [selectedDeal, setSelectedDeal] = useState<SalesDeal | null>(null);
    const [emailDraft, setEmailDraft] = useState('');
    const [drafting, setDrafting] = useState(false);
    const [objection, setObjection] = useState('');
    
    // Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newDeal, setNewDeal] = useState({ company: '', leadName: '', value: '' });

    useEffect(() => {
        getSalesDeals().then(setDeals);
    }, []);

    const handleAddDeal = async () => {
        if (!newDeal.company) return;
        const deal: SalesDeal = {
            id: Date.now().toString(),
            company: newDeal.company,
            leadName: newDeal.leadName,
            value: Number(newDeal.value) || 0,
            stage: 'NEW',
            probability: 20,
            lastActivity: 'Just now'
        };
        await addDeal(deal);
        const updated = await getSalesDeals(); // Refresh
        setDeals(updated);
        setIsAddOpen(false);
        setNewDeal({ company: '', leadName: '', value: '' });
        addToast('success', 'Deal Created');
    };

    const handleDraftEmail = async () => {
        if (!selectedDeal) return;
        setDrafting(true);
        const context = `Lead: ${selectedDeal.leadName} from ${selectedDeal.company}. Value: $${selectedDeal.value}. Stage: ${selectedDeal.stage}.`;
        const text = await generateSalesEmail(context, objection);
        setEmailDraft(text);
        setDrafting(false);
    };

    const handleBulkDelete = (ids: string[]) => {
        if (confirm(`Delete ${ids.length} deals?`)) {
            let updated = deals;
            ids.forEach(id => {
                updated = db.deleteItem('sales_deals', id, []);
            });
            setDeals(updated);
            addToast('success', `${ids.length} deals deleted`);
        }
    };

    const handleExport = (ids: string[]) => {
        const data = deals.filter(d => ids.includes(d.id));
        exportToCSV(data, 'sales_deals');
        addToast('success', 'Export downloaded');
    };

    const handleLinkFeature = (dealId: string, featureId: string | number) => {
        const updated = db.updateItem('sales_deals', dealId, { linkedFeatureId: featureId }, []);
        setDeals(updated);
    };

    const handleUnlinkFeature = (dealId: string) => {
        const updated = db.updateItem('sales_deals', dealId, { linkedFeatureId: undefined }, []);
        setDeals(updated);
    };

    // --- Drag & Drop or Click Logic for Stage Change ---
    const handleStageUpdate = async (dealId: string, newStage: SalesStage) => {
        await updateDealStage(dealId, newStage);
        const updated = await getSalesDeals();
        setDeals(updated);
        
        if (newStage === 'CLOSED_WON') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#ffffff', '#eab308']
            });
            addToast('success', 'Deal Closed!', 'Great work.');
        }
    };

    const listColumns: Column<SalesDeal>[] = [
        { key: 'company', label: 'Company', sortable: true },
        { key: 'leadName', label: 'Contact' },
        { 
            key: 'value', 
            label: 'Value', 
            sortable: true,
            render: (d) => `$${d.value.toLocaleString()}`
        },
        { 
            key: 'stage', 
            label: 'Stage',
            render: (d) => <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-300">{d.stage}</span>
        },
        { key: 'probability', label: 'Prob %' },
        {
            key: 'linkedFeatureId',
            label: 'Feature Request',
            render: (d) => (
                <EntityLinker 
                    linkedType="FEATURE"
                    linkedId={d.linkedFeatureId}
                    onLink={(fid) => handleLinkFeature(d.id, fid)}
                    onUnlink={() => handleUnlinkFeature(d.id)}
                    placeholder="Link Feature"
                />
            )
        }
    ];

    // Analytics Data Prep
    const pipelineData = [
        { name: 'New', value: deals.filter(d => d.stage === 'NEW').reduce((a,b) => a + b.value, 0) },
        { name: 'Discovery', value: deals.filter(d => d.stage === 'DISCOVERY').reduce((a,b) => a + b.value, 0) },
        { name: 'Proposal', value: deals.filter(d => d.stage === 'PROPOSAL').reduce((a,b) => a + b.value, 0) },
        { name: 'Negotiation', value: deals.filter(d => d.stage === 'NEGOTIATION').reduce((a,b) => a + b.value, 0) },
        { name: 'Won', value: deals.filter(d => d.stage === 'CLOSED_WON').reduce((a,b) => a + b.value, 0) },
    ];

    const StageColumn = ({ stage, title }: { stage: SalesStage, title: string }) => (
        <div className="flex-1 min-w-[250px] bg-neutral-900/30 rounded-xl border border-neutral-800 p-3 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-semibold text-neutral-300 text-sm">{title}</h3>
                <span className="text-xs text-neutral-500">{deals.filter(d => d.stage === stage).length}</span>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {deals.filter(d => d.stage === stage).map(deal => (
                    <div 
                        key={deal.id} 
                        onClick={() => setSelectedDeal(deal)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedDeal?.id === deal.id ? 'bg-primary-900/20 border-primary-600' : 'bg-black border-neutral-800 hover:border-neutral-600'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-white text-sm">{deal.company}</span>
                            <span className="text-xs text-green-400 font-mono">${deal.value.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mb-2">{deal.leadName}</p>
                        
                        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                             {/* Simplified Stage Transition Buttons for Demo */}
                             {stage !== 'CLOSED_WON' && (
                                 <button onClick={(e) => { e.stopPropagation(); handleStageUpdate(deal.id, 'CLOSED_WON'); }} className="text-[9px] px-1.5 py-0.5 bg-green-900/20 text-green-400 border border-green-900/50 rounded hover:bg-green-900/40">
                                     Won
                                 </button>
                             )}
                             {stage !== 'NEGOTIATION' && stage !== 'CLOSED_WON' && (
                                 <button onClick={(e) => { e.stopPropagation(); handleStageUpdate(deal.id, 'NEGOTIATION'); }} className="text-[9px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700">
                                     Next
                                 </button>
                             )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800/50 pt-2">
                            <span>{deal.probability}% Prob</span>
                            <span>{deal.lastActivity}</span>
                        </div>
                        {/* Linker in Card */}
                        <div className="mt-2 flex justify-end" onClick={e => e.stopPropagation()}>
                             <EntityLinker 
                                linkedType="FEATURE"
                                linkedId={deal.linkedFeatureId}
                                onLink={(fid) => handleLinkFeature(deal.id, fid)}
                                onUnlink={() => handleUnlinkFeature(deal.id)}
                                placeholder="Link Feature"
                                className="text-[10px]"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white">Sales Pipeline</h1>
                    <p className="text-neutral-400">Manage leads, deals, and revenue.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                        <button onClick={() => setActiveTab('PIPELINE')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'PIPELINE' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.Kanban size={14}/></button>
                        <button onClick={() => setActiveTab('LIST')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'LIST' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.List size={14}/></button>
                        <button onClick={() => setActiveTab('ANALYTICS')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'ANALYTICS' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.BarChart2 size={14}/></button>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)}><Icons.Plus size={16} className="mr-2"/> New Deal</Button>
                </div>
            </div>

            {activeTab === 'PIPELINE' && (
                <div className="flex gap-6 flex-1 min-h-0">
                    <div className="flex-1 flex flex-col min-w-0" id="sales-pipeline">
                        <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
                            <StageColumn stage="NEW" title="New Leads" />
                            <StageColumn stage="DISCOVERY" title="Discovery" />
                            <StageColumn stage="PROPOSAL" title="Proposal" />
                            <StageColumn stage="NEGOTIATION" title="Negotiation" />
                            <StageColumn stage="CLOSED_WON" title="Closed Won" />
                        </div>
                    </div>

                    {/* AI Assistant Sidebar - Only visible in Pipeline view */}
                    <div className="w-80 shrink-0 bg-neutral-900/50 border-l border-neutral-800 -my-6 p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-primary-500">
                            <Icons.Bot size={20} />
                            <h2 className="font-bold text-white">Sales Copilot</h2>
                        </div>

                        {selectedDeal ? (
                            <div className="flex-1 flex flex-col space-y-4">
                                <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                                    <h3 className="text-sm font-medium text-white">{selectedDeal.company}</h3>
                                    <p className="text-xs text-neutral-400 mt-1">Contact: {selectedDeal.leadName}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-neutral-400">Handle Objection (Optional)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-black border border-neutral-800 rounded p-2 text-xs text-white"
                                        placeholder="e.g. 'Too expensive'..."
                                        value={objection}
                                        onChange={(e) => setObjection(e.target.value)}
                                    />
                                </div>

                                <Button onClick={handleDraftEmail} isLoading={drafting} size="sm">
                                    <Icons.PenTool size={14} className="mr-2"/> Draft Email
                                </Button>

                                {emailDraft && (
                                    <div className="flex-1 bg-black border border-neutral-800 rounded p-3 overflow-y-auto">
                                        <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">{emailDraft}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-600">
                                <Icons.MousePointerClick size={32} className="mb-2" />
                                <p className="text-sm">Select a deal to get AI assistance.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'LIST' && (
                <Card className="flex-1 animate-fade-in">
                    <CRUDTable 
                        data={deals}
                        columns={listColumns}
                        onDelete={(item) => handleBulkDelete([item.id])}
                        searchKey="company"
                        enableSelection
                        onBulkDelete={handleBulkDelete}
                        onExport={handleExport}
                    />
                </Card>
            )}

            {activeTab === 'ANALYTICS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in flex-1 overflow-y-auto">
                    <Card title="Pipeline Value by Stage">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipelineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                    <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }} cursor={{fill: '#262626'}} />
                                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card title="Deal Count Distribution">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deals.reduce((acc, curr) => {
                                            const existing = acc.find(item => item.name === curr.stage);
                                            if (existing) existing.value++;
                                            else acc.push({ name: curr.stage, value: 1 });
                                            return acc;
                                        }, [] as any[])}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {[...Array(5)].map((_, i) => (
                                            <Cell key={`cell-${i}`} fill={['#3b82f6', '#8b5cf6', '#eab308', '#f97316', '#22c55e'][i % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* Add Deal Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">New Sales Deal</h3>
                            <button onClick={() => setIsAddOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Company</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newDeal.company} onChange={e => setNewDeal({...newDeal, company: e.target.value})} placeholder="Prospect Inc" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Lead Contact</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newDeal.leadName} onChange={e => setNewDeal({...newDeal, leadName: e.target.value})} placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Deal Value ($)</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" type="number" value={newDeal.value} onChange={e => setNewDeal({...newDeal, value: e.target.value})} placeholder="10000" />
                            </div>
                            <Button className="w-full" onClick={handleAddDeal}>Create Deal</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
