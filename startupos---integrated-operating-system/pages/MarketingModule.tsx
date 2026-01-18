
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { generateMarketingCopy, generateMarketingImage, generateMarketingVideo } from '../services/geminiService';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CRUDTable, Column } from '../components/ui/CRUDTable';
import { MarketingCampaign } from '../types';
import { db } from '../services/localStorageDb';
import { useToast } from '../context/ToastContext';
import { exportToCSV } from '../services/csvService';
import { EntityLinker } from '../components/ui/EntityLinker';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const MarketingModule: React.FC = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'GENERATOR' | 'CAMPAIGNS' | 'ANALYTICS'>('GENERATOR');
    const [subTab, setSubTab] = useState<'COPY' | 'IMAGE' | 'VIDEO'>('COPY');
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Campaigns State
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ name: '', channel: 'Social' });

    useEffect(() => {
        setCampaigns(db.get<MarketingCampaign[]>('marketing_campaigns', []));
    }, []);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setError('');
        setResult(null);

        try {
            if (subTab === 'VIDEO' || subTab === 'IMAGE') {
                 const aiStudio = (window as any).aistudio;
                 if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
                     const hasKey = await aiStudio.hasSelectedApiKey();
                     if (!hasKey) {
                        await aiStudio.openSelectKey();
                     }
                 }
            }

            if (subTab === 'COPY') {
                const text = await generateMarketingCopy(prompt, 'Social');
                setResult(text);
            } else if (subTab === 'IMAGE') {
                const imageUrl = await generateMarketingImage(prompt);
                setResult(imageUrl);
            } else if (subTab === 'VIDEO') {
                const videoUrl = await generateMarketingVideo(prompt);
                setResult(videoUrl);
            }
        } catch (err) {
            console.error(err);
            setError("Generation failed. For Video/Image, ensure you have a paid API key selected.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = () => {
        const campaign: MarketingCampaign = {
            id: Date.now().toString(),
            name: newCampaign.name,
            channel: newCampaign.channel as any,
            status: 'DRAFT',
            budget: '0',
            performance: Math.floor(Math.random() * 500) + '%', // Mock ROI
            startDate: new Date().toLocaleDateString()
        };
        const updated = db.addItem('marketing_campaigns', campaign, []);
        setCampaigns(updated);
        setIsCampaignModalOpen(false);
        addToast('success', 'Campaign Created');
    };

    const handleDeleteCampaign = (item: MarketingCampaign) => {
        if(confirm('Delete campaign?')) {
            const updated = db.deleteItem('marketing_campaigns', item.id, []);
            setCampaigns(updated);
            addToast('success', 'Campaign Deleted');
        }
    };

    const handleBulkDelete = (ids: string[]) => {
        if (confirm(`Delete ${ids.length} campaigns?`)) {
            let updated = campaigns;
            ids.forEach(id => {
                updated = db.deleteItem('marketing_campaigns', id, []);
            });
            setCampaigns(updated);
            addToast('success', `${ids.length} campaigns deleted`);
        }
    };

    const handleExport = (ids: string[]) => {
        const data = campaigns.filter(c => ids.includes(c.id));
        exportToCSV(data, 'marketing_campaigns');
        addToast('success', 'Export downloaded');
    };

    const handleLinkGoal = (campId: string, goalId: string | number) => {
        const updated = db.updateItem('marketing_campaigns', campId, { linkedGoalId: String(goalId) }, []);
        setCampaigns(updated);
    };

    const handleUnlinkGoal = (campId: string) => {
        const updated = db.updateItem('marketing_campaigns', campId, { linkedGoalId: undefined }, []);
        setCampaigns(updated);
    };

    const campaignColumns: Column<MarketingCampaign>[] = [
        { key: 'name', label: 'Campaign Name', sortable: true },
        { key: 'channel', label: 'Channel' },
        { 
            key: 'status', 
            label: 'Status',
            render: (c) => <span className={`px-2 py-1 rounded text-xs ${c.status === 'ACTIVE' ? 'bg-green-900/20 text-green-400' : 'bg-neutral-800 text-neutral-400'}`}>{c.status}</span>
        },
        { key: 'performance', label: 'ROI' },
        {
            key: 'linkedGoalId',
            label: 'Strategic Goal',
            render: (c) => (
                <EntityLinker 
                    linkedType="GOAL"
                    linkedId={c.linkedGoalId}
                    onLink={(id) => handleLinkGoal(c.id, id)}
                    onUnlink={() => handleUnlinkGoal(c.id)}
                    placeholder="Link Strategy"
                />
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Growth Engine</h1>
                    <p className="text-neutral-400">Create campaigns, assets, and copy with generative AI.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                        <button onClick={() => setActiveTab('GENERATOR')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'GENERATOR' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.Sparkles size={14}/></button>
                        <button onClick={() => setActiveTab('CAMPAIGNS')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'CAMPAIGNS' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.LayoutTemplate size={14}/></button>
                        <button onClick={() => setActiveTab('ANALYTICS')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'ANALYTICS' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.BarChart2 size={14}/></button>
                    </div>
                </div>
            </div>

            {activeTab === 'GENERATOR' && (
                <div className="flex gap-6 animate-fade-in">
                    {/* Controls */}
                    <div className="w-1/3 h-fit" id="marketing-controls">
                        <Card>
                            <div className="flex border-b border-neutral-800 mb-4">
                                {['COPY', 'IMAGE', 'VIDEO'].map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => { setSubTab(tab as any); setResult(null); }}
                                        className={`flex-1 pb-2 text-sm font-medium ${subTab === tab ? 'text-primary-500 border-b-2 border-primary-500' : 'text-neutral-400'}`}
                                    >
                                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        {subTab === 'COPY' ? 'Topic & Tone' : subTab === 'IMAGE' ? 'Image Description' : 'Video Prompt'}
                                    </label>
                                    <textarea
                                        className="w-full h-32 bg-black border border-neutral-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-600 outline-none resize-none"
                                        placeholder={
                                            subTab === 'COPY' ? "e.g., Launch post for new AI feature. Exciting tone." :
                                            subTab === 'IMAGE' ? "e.g., A futuristic dashboard glowing with red neon lights on a desk." :
                                            "e.g., A cinematic tracking shot of a robot typing on a laptop."
                                        }
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                    />
                                </div>
                                
                                {subTab === 'VIDEO' && (
                                    <div className="p-3 bg-neutral-900/50 rounded border border-neutral-800 text-xs text-neutral-400">
                                        <Icons.Info size={12} className="inline mr-1"/>
                                        Veo Video generation takes 1-2 minutes. Please be patient.
                                    </div>
                                )}

                                <Button className="w-full" onClick={handleGenerate} isLoading={loading} disabled={!prompt}>
                                    <Icons.Sparkles size={16} className="mr-2" />
                                    Generate {subTab === 'COPY' ? 'Copy' : subTab === 'IMAGE' ? 'Image' : 'Video'}
                                </Button>
                                
                                {error && (
                                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Output Display */}
                    <Card className="flex-1 min-h-[500px] flex items-center justify-center bg-neutral-900/20">
                        {loading ? (
                            <div className="text-center text-neutral-500">
                                <Icons.Loader2 className="animate-spin mb-2 mx-auto" size={32} />
                                <p>Generating {subTab.toLowerCase()}...</p>
                            </div>
                        ) : result ? (
                            subTab === 'COPY' ? (
                                <div className="w-full h-full p-4 overflow-y-auto prose prose-invert">
                                    <ReactMarkdown>{result}</ReactMarkdown>
                                </div>
                            ) : subTab === 'IMAGE' ? (
                                <img src={result} alt="Generated" className="max-w-full max-h-[500px] rounded-lg shadow-2xl" />
                            ) : (
                                <video controls src={result} className="max-w-full max-h-[500px] rounded-lg shadow-2xl" />
                            )
                        ) : (
                            <div className="text-center text-neutral-600">
                                <Icons.BoxSelect size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Generated assets will appear here.</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {activeTab === 'CAMPAIGNS' && (
                <div className="animate-fade-in">
                    <Card title="Marketing Campaigns">
                        <CRUDTable 
                            data={campaigns}
                            columns={campaignColumns}
                            onDelete={handleDeleteCampaign}
                            searchKey="name"
                            actionLabel="New Campaign"
                            onAdd={() => setIsCampaignModalOpen(true)}
                            enableSelection
                            onBulkDelete={handleBulkDelete}
                            onExport={handleExport}
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'ANALYTICS' && (
                <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="ROI per Channel">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Social', value: 120 },
                                    { name: 'Email', value: 350 },
                                    { name: 'Ads', value: 90 },
                                    { name: 'Content', value: 210 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                    <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }} cursor={{fill: '#262626'}} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card title="Campaign Performance">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={campaigns.map(c => ({ name: c.name, value: parseInt(c.performance) || 0 }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                    <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }} cursor={{fill: '#262626'}} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* Campaign Modal */}
            {isCampaignModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Create Campaign</h3>
                            <button onClick={() => setIsCampaignModalOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} placeholder="Campaign Name" />
                            <select className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newCampaign.channel} onChange={e => setNewCampaign({...newCampaign, channel: e.target.value})}>
                                <option>Social</option>
                                <option>Email</option>
                                <option>Ads</option>
                                <option>Content</option>
                            </select>
                            <Button className="w-full" onClick={handleCreateCampaign}>Launch Campaign</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
