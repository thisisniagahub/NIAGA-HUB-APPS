
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { generateIdeaValidation, generateFounderArchetype, generateMarketingImage, generateStartupEcosystem } from '../services/geminiService';
import { applySynapseData } from '../services/synapseService';
import { FounderArchetype } from '../types';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/localStorageDb';
import { exportToCSV } from '../services/csvService';
import { EntityLinker } from '../components/ui/EntityLinker';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const MotionDiv = motion.div as any;

export const IdeationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VISION' | 'VALIDATION' | 'MANAGE' | 'ANALYTICS'>('VISION');
  const [idea, setIdea] = useState('');
  
  // Validation State
  const [analysis, setAnalysis] = useState('');
  const [validating, setValidating] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Vision State
  const [archetype, setArchetype] = useState<FounderArchetype | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Synapse State
  const [synapseLoading, setSynapseLoading] = useState(false);
  const [synapseResult, setSynapseResult] = useState<null | { featuresCount: number, campaignsCount: number, investorsCount: number }>(null);

  // Management / CRUD State
  const [savedIdeas, setSavedIdeas] = useState<FounderArchetype[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- Init ---
  useEffect(() => {
      // Load saved ideas from local DB (mocking "Ideas" table)
      const data = db.get<FounderArchetype[]>('saved_ideas', []);
      setSavedIdeas(data);
  }, [activeTab]);

  // --- Handlers ---

  const handleValidate = async () => {
    if (!idea.trim()) return;
    setValidating(true);
    setAnalysis('');
    try {
      const result = await generateIdeaValidation(idea);
      setAnalysis(result);
      setHistory(prev => [idea, ...prev]);
    } catch (e) {
      setAnalysis("Error connecting to intelligence engine.");
    } finally {
      setValidating(false);
    }
  };

  const handleVision = async () => {
      if (!idea.trim()) return;
      setVisionLoading(true);
      setArchetype(null);
      setSynapseResult(null);
      
      try {
          // 1. Generate Text Archetype
          const arch = await generateFounderArchetype(idea);
          if (arch) {
              const enrichedArch = { ...arch, id: Date.now().toString(), status: 'DRAFT', createdAt: new Date().toISOString() } as FounderArchetype;
              setArchetype(enrichedArch);
              
              // Save to DB immediately
              db.addItem('saved_ideas', enrichedArch, []);

              // Check API Key for Image Gen (Required for gemini-3-pro-image-preview)
              const aiStudio = (window as any).aistudio;
              if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
                  const hasKey = await aiStudio.hasSelectedApiKey();
                  if (!hasKey) {
                      await aiStudio.openSelectKey();
                  }
              }

              // 2. Generate Image immediately after
              setImageLoading(true);
              const imgUrl = await generateMarketingImage(arch.visualPrompt + " . Cinematic lighting, dreamy, futuristic, high definition, 8k.");
              if (imgUrl) {
                  setArchetype(prev => {
                      const updated = prev ? ({ ...prev, imageUrl: imgUrl }) : null;
                      // Update DB with image
                      if (updated && updated.id) {
                          db.updateItem('saved_ideas', updated.id, { imageUrl: imgUrl }, []);
                      }
                      return updated;
                  });
              }
              setImageLoading(false);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setVisionLoading(false);
      }
  };

  const handleManifest = async () => {
      if (!idea || !archetype) return;
      setSynapseLoading(true);
      try {
          const ecosystem = await generateStartupEcosystem(idea, archetype.title);
          if (ecosystem) {
              const stats = applySynapseData(ecosystem);
              setSynapseResult(stats);
              if (archetype.id) {
                  db.updateItem('saved_ideas', archetype.id, { status: 'VALIDATED' }, []);
              }
          }
      } catch (e) {
          console.error("Synapse failed", e);
      } finally {
          setSynapseLoading(false);
      }
  };

  const transferToValidation = (model: string) => {
      const refinedIdea = `${idea}. Business Model: ${model}. Core Values: ${archetype?.coreValues.join(', ')}.`;
      setIdea(refinedIdea);
      setActiveTab('VALIDATION');
  };

  // --- CRUD & Bulk Actions ---

  const toggleSelect = (id: string) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(i => i !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === savedIdeas.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(savedIdeas.map(i => i.id!));
      }
  };

  const handleBulkDelete = () => {
      if (!confirm(`Delete ${selectedIds.length} ideas?`)) return;
      
      const remaining = savedIdeas.filter(i => !selectedIds.includes(i.id!));
      setSavedIdeas(remaining);
      db.set('saved_ideas', remaining);
      setSelectedIds([]);
  };

  const handleExport = () => {
      const dataToExport = selectedIds.length > 0 
        ? savedIdeas.filter(i => selectedIds.includes(i.id!)) 
        : savedIdeas;
      
      const csvData = dataToExport.map(i => ({
          ID: i.id,
          Title: i.title,
          Description: i.description,
          Status: i.status,
          Created: i.createdAt,
          LinkedFeature: i.linkedFeatureId || 'None'
      }));

      exportToCSV(csvData, 'startupos_ideas');
  };

  const handleUpdateLink = (ideaId: string, featureId: string | number) => {
      const updatedList = db.updateItem('saved_ideas', ideaId, { linkedFeatureId: featureId }, []);
      setSavedIdeas(updatedList);
  };

  const handleUnlink = (ideaId: string) => {
      const updatedList = db.updateItem('saved_ideas', ideaId, { linkedFeatureId: undefined }, []);
      setSavedIdeas(updatedList);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Ideation & Vision</h1>
          <p className="text-neutral-400">Dream it, visualize it, then validate it.</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                <button onClick={() => setActiveTab('VISION')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'VISION' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.Sparkles size={14}/></button>
                <button onClick={() => setActiveTab('VALIDATION')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'VALIDATION' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.ClipboardCheck size={14}/></button>
                <button onClick={() => setActiveTab('MANAGE')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'MANAGE' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.List size={14}/></button>
                <button onClick={() => setActiveTab('ANALYTICS')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'ANALYTICS' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.BarChart2 size={14}/></button>
            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- VISIONARY MODE (Dreamer Style) --- */}
        {activeTab === 'VISION' && (
             <MotionDiv 
                key="vision"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]"
             >
                {/* Left: Input */}
                <div className="flex flex-col justify-center space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">
                            What do you dream of building?
                        </h2>
                        <p className="text-neutral-400 text-lg">
                            Don't worry about business models yet. Just describe the future you want to see.
                        </p>
                    </div>

                    <div className="relative">
                        <textarea
                            className="w-full h-40 bg-black/50 border border-neutral-800 rounded-2xl p-6 text-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none placeholder-neutral-700 backdrop-blur-sm transition-all shadow-xl"
                            placeholder="e.g., I dream of a world where cities are silent and transportation is invisible..."
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4">
                             <Button 
                                onClick={handleVision} 
                                isLoading={visionLoading}
                                disabled={!idea}
                                className="rounded-xl px-6 py-3 bg-white text-black hover:bg-neutral-200 font-bold"
                            >
                                <Icons.Wand2 className="mr-2" size={18} />
                                Reveal Archetype
                            </Button>
                        </div>
                    </div>

                    {archetype && (
                        <div className="space-y-4 animate-slide-in">
                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Recommended Business Models</h3>
                            <div className="flex flex-wrap gap-3">
                                {archetype.suggestedBusinessModels.map((model, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => transferToValidation(model)}
                                        className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 hover:border-primary-500 hover:text-white transition-all flex items-center gap-2 group"
                                    >
                                        <span>{model}</span>
                                        <Icons.ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Output (Archetype Card) */}
                <div className="relative">
                    {visionLoading ? (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/20 rounded-3xl border border-neutral-800/50 animate-pulse">
                            <Icons.Loader2 size={64} className="text-primary-600 animate-spin mb-4" />
                            <p className="text-neutral-400 font-mono">Consulting the Oracle...</p>
                         </div>
                    ) : archetype ? (
                        <Card className="h-full overflow-hidden border-0 bg-neutral-900/80 backdrop-blur-xl relative group">
                            {/* Image Background Layer */}
                            <div className="absolute inset-0 z-0">
                                {imageLoading ? (
                                    <div className="w-full h-full bg-neutral-900 animate-pulse" />
                                ) : archetype.imageUrl ? (
                                    <>
                                        <img src={archetype.imageUrl} alt="Vision" className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                                    </>
                                ) : null}
                            </div>

                            <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                                <div className="mb-auto pt-8">
                                    <div className="inline-block px-3 py-1 bg-primary-600/20 border border-primary-500/50 text-primary-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                        Founder Archetype
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-xl">
                                        {archetype.title}
                                    </h2>
                                    <p className="text-lg text-neutral-200 leading-relaxed drop-shadow-md">
                                        {archetype.description}
                                    </p>
                                </div>
                                
                                <div className="mt-8 border-t border-white/10 pt-6">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase mb-3">Core Values</h4>
                                    <div className="flex gap-4 mb-6">
                                        {archetype.coreValues.map((val, i) => (
                                            <div key={i} className="flex items-center gap-2 text-white">
                                                <Icons.Diamond size={12} className="text-primary-400" />
                                                <span className="text-sm font-medium">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* THE SYNAPSE ACTION */}
                                    {synapseResult ? (
                                        <div className="bg-green-900/20 border border-green-900/50 rounded-xl p-4 animate-fade-in">
                                            <div className="flex items-center gap-2 mb-2 text-green-400 font-bold">
                                                <Icons.CheckCircle2 size={18} />
                                                <span>Synapse Ecosystem Generated</span>
                                            </div>
                                            <p className="text-xs text-green-200 mb-2">
                                                {synapseResult.featuresCount} Features • {synapseResult.campaignsCount} Campaigns • {synapseResult.investorsCount} Investors
                                            </p>
                                            <Button size="sm" variant="outline" onClick={() => setActiveTab('MANAGE')}>
                                                View Saved Ideas
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button 
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                                            onClick={handleManifest}
                                            isLoading={synapseLoading}
                                        >
                                            <Icons.Zap size={18} className="mr-2 fill-white" />
                                            Manifest Ecosystem
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full border-2 border-dashed border-neutral-800 rounded-3xl flex flex-col items-center justify-center text-neutral-600">
                            <Icons.Eye size={48} className="mb-4 opacity-20" />
                            <p>Your vision awaits.</p>
                        </div>
                    )}
                </div>
             </MotionDiv>
        )}

        {/* --- VALIDATION MODE --- */}
        {activeTab === 'VALIDATION' && (
            <MotionDiv
                key="validation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                <div className="space-y-6">
                    <Card title="Validate Assumptions">
                        <textarea
                            className="w-full h-32 bg-black border border-neutral-800 rounded-lg p-4 text-white focus:ring-2 focus:ring-primary-600 outline-none resize-none mb-4"
                            placeholder="Describe your idea, target market, and core assumption..."
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                        />
                        <Button className="w-full" onClick={handleValidate} isLoading={validating}>
                            <Icons.Search size={16} className="mr-2" /> Run Deep Analysis
                        </Button>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">History</h3>
                        {history.map((h, i) => (
                            <div key={i} onClick={() => setIdea(h)} className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-600 truncate text-sm text-neutral-400">
                                {h}
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="min-h-[500px] overflow-y-auto" title="Analysis Report">
                    {analysis ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                            <Icons.Activity size={48} className="mb-4 opacity-20" />
                            <p>Analysis will appear here.</p>
                        </div>
                    )}
                </Card>
            </MotionDiv>
        )}

        {/* --- MANAGE MODE --- */}
        {activeTab === 'MANAGE' && (
            <MotionDiv
                key="manage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
            >
                <div className="flex justify-between items-center bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                className="rounded bg-neutral-800 border-neutral-700 text-primary-600 focus:ring-primary-600"
                                checked={savedIdeas.length > 0 && selectedIds.length === savedIdeas.length}
                                onChange={toggleSelectAll}
                            />
                            <span className="text-sm text-neutral-400">{selectedIds.length} Selected</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleBulkDelete} disabled={selectedIds.length === 0} className="text-red-400 hover:text-red-300 hover:border-red-900">
                            <Icons.Trash2 size={14} className="mr-2" /> Delete
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleExport}>
                            <Icons.Download size={14} className="mr-2" /> Export CSV
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {savedIdeas.map((ideaItem) => (
                        <div key={ideaItem.id} className="group relative bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex gap-6 hover:border-neutral-600 transition-all">
                            <div className="flex items-start pt-1">
                                <input 
                                    type="checkbox" 
                                    className="rounded bg-neutral-800 border-neutral-700 text-primary-600 focus:ring-primary-600"
                                    checked={selectedIds.includes(ideaItem.id!)}
                                    onChange={() => toggleSelect(ideaItem.id!)}
                                />
                            </div>
                            
                            {ideaItem.imageUrl && (
                                <img src={ideaItem.imageUrl} alt={ideaItem.title} className="w-24 h-24 object-cover rounded-lg bg-neutral-800 shrink-0" />
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-white mb-2">{ideaItem.title}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${ideaItem.status === 'VALIDATED' ? 'bg-green-900/20 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                        {ideaItem.status}
                                    </span>
                                </div>
                                <p className="text-neutral-400 text-sm line-clamp-2 mb-4">{ideaItem.description}</p>
                                
                                <div className="flex gap-4 border-t border-neutral-800 pt-4 mt-auto items-center">
                                    <span className="text-xs text-neutral-500">Connections:</span>
                                    <EntityLinker 
                                        linkedType="FEATURE" 
                                        linkedId={ideaItem.linkedFeatureId} 
                                        onLink={(id) => handleUpdateLink(ideaItem.id!, id)}
                                        onUnlink={() => handleUnlink(ideaItem.id!)}
                                        placeholder="Link to Roadmap Feature"
                                    />
                                    <span className="text-xs text-neutral-600 flex items-center gap-1 ml-auto">
                                        <Icons.Calendar size={12} /> {new Date(ideaItem.createdAt!).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {savedIdeas.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                            No ideas saved yet. Start dreaming in the Visionary tab.
                        </div>
                    )}
                </div>
            </MotionDiv>
        )}

        {/* --- ANALYTICS MODE --- */}
        {activeTab === 'ANALYTICS' && (
            <MotionDiv
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <Card title="Ideas Over Time">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'Jan', value: 2 },
                                { name: 'Feb', value: 5 },
                                { name: 'Mar', value: 3 },
                                { name: 'Apr', value: 8 },
                                { name: 'May', value: 12 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorIdeas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorIdeas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                <Card title="Status Distribution">
                     <div className="h-[300px] flex items-center justify-center gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-neutral-600"></div>
                                <span className="text-neutral-400 text-sm">Drafts ({savedIdeas.filter(i => i.status === 'DRAFT').length})</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-neutral-400 text-sm">Validated ({savedIdeas.filter(i => i.status === 'VALIDATED').length})</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-neutral-400 text-sm">Archived ({savedIdeas.filter(i => i.status === 'ARCHIVED').length})</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">{savedIdeas.length}</div>
                            <div className="text-xs text-neutral-500 uppercase tracking-widest">Total Ideas</div>
                        </div>
                     </div>
                </Card>
            </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};
