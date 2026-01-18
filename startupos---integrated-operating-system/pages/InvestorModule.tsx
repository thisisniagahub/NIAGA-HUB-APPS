
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getInvestors, getCurrentRound, addInvestor, updateInvestorDetails, deleteInvestor, getPitchDecks, savePitchDeck, deletePitchDeck } from '../services/investorService';
import { getGoals, getSwot } from '../services/strategyService';
import { getRunwayData } from '../services/financeService';
import { generateInvestorPitch, analyzePitchDeckImage } from '../services/geminiService';
import { uploadFile } from '../services/fileService';
import { Investor, FundingRound, InvestorStatus, PitchAnalysis, PitchDeck, Slide } from '../types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusColumnProps {
    title: string;
    status: InvestorStatus;
    items: Investor[];
    onAdd: () => void;
    onEdit: (investor: Investor) => void;
    onDelete: (id: string) => void;
}

const StatusColumn: React.FC<StatusColumnProps> = ({ title, status, items, onAdd, onEdit, onDelete }) => {
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    return (
        <div className="flex-1 min-w-[280px] bg-neutral-900/30 rounded-xl border border-neutral-800 flex flex-col h-full">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-neutral-900/90 backdrop-blur-sm rounded-t-xl z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'COMMITTED' ? 'bg-green-500' : status === 'DUE_DILIGENCE' ? 'bg-yellow-500' : 'bg-neutral-500'}`} />
                    <h3 className="font-semibold text-neutral-300 text-sm">{title}</h3>
                </div>
                <span className="text-xs bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar" onClick={() => setMenuOpenId(null)}>
                {items.map(inv => (
                    <div key={inv.id} className="relative p-4 bg-black border border-neutral-800 rounded-lg shadow-sm hover:border-primary-600/50 cursor-pointer group transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-white text-sm">{inv.name}</span>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === inv.id ? null : inv.id); }}
                                className="text-neutral-600 hover:text-white transition-colors"
                            >
                                <Icons.MoreHorizontal size={14} />
                            </button>

                            {/* Dropdown */}
                            {menuOpenId === inv.id && (
                                <div className="absolute top-8 right-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20 w-32 overflow-hidden flex flex-col animate-fade-in">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEdit(inv); }}
                                        className="px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-700 flex items-center gap-2"
                                    >
                                        <Icons.Edit2 size={12} /> Edit
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }}
                                        className="px-3 py-2 text-left text-xs text-red-400 hover:bg-neutral-700 flex items-center gap-2"
                                    >
                                        <Icons.Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-neutral-400 mb-3">{inv.firm}</p>
                        {inv.checkSize && <div className="inline-block px-2 py-1 bg-green-900/20 text-green-400 text-xs rounded border border-green-900/30 mb-2">{inv.checkSize}</div>}
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-2 border-t border-neutral-800 pt-2">
                            <Icons.Clock size={10} /><span>{inv.lastContact}</span>
                        </div>
                    </div>
                ))}
                <button onClick={onAdd} className="w-full py-2 text-xs border border-dashed border-neutral-800 text-neutral-500 rounded hover:bg-neutral-800 hover:text-neutral-300 transition-colors">+ Add Investor</button>
            </div>
        </div>
    );
};

export const InvestorModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'PIPELINE' | 'UPDATES' | 'DOCS' | 'PITCH'>('PIPELINE');
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [round, setRound] = useState<FundingRound | null>(null);
    const [decks, setDecks] = useState<PitchDeck[]>([]);
    
    // Readiness State
    const [readiness, setReadiness] = useState<{ isReady: boolean; runway: number; cash: number } | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', firm: '', checkSize: '' });

    // Pitch Generator State
    const [pitchMode, setPitchMode] = useState<'LIST' | 'CREATE' | 'VIEW'>('LIST');
    const [pitchForm, setPitchForm] = useState({ companyName: '', problem: '', solution: '', traction: '', ask: '' });
    const [currentDeck, setCurrentDeck] = useState<PitchDeck | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [pitchLoading, setPitchLoading] = useState(false);

    // Deck Analyzer State
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<PitchAnalysis | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Data Room Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string}[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const [invData, roundData, deckData, runwayData] = await Promise.all([
                getInvestors(), 
                getCurrentRound(), 
                getPitchDecks(),
                getRunwayData()
            ]);
            setInvestors(invData);
            setRound(roundData);
            setDecks(deckData);
            
            // Fundraising Gate Logic
            setReadiness({
                isReady: runwayData.runwayMonths > 6,
                runway: runwayData.runwayMonths,
                cash: runwayData.cashOnHand
            });
        };
        loadData();
    }, []);

    const calculateProgress = () => {
        if (!round) return 0;
        return (round.raisedAmount / round.targetAmount) * 100;
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ name: '', firm: '', checkSize: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (investor: Investor) => {
        setEditingId(investor.id);
        setFormData({ name: investor.name, firm: investor.firm, checkSize: investor.checkSize || '' });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return;
        
        if (editingId) {
            const updated = await updateInvestorDetails(editingId, {
                name: formData.name,
                firm: formData.firm,
                checkSize: formData.checkSize
            });
            setInvestors(updated);
        } else {
            const investor: Investor = {
                id: Date.now().toString(),
                name: formData.name,
                firm: formData.firm,
                checkSize: formData.checkSize,
                status: 'PROSPECT',
                lastContact: 'Just now',
                notes: ''
            };
            const updated = await addInvestor(investor);
            setInvestors(updated);
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Remove this investor from pipeline?')) {
            const updated = await deleteInvestor(id);
            setInvestors(updated);
        }
    };

    const handleGeneratePitch = async () => {
        if (!pitchForm.companyName || !pitchForm.problem) return;
        setPitchLoading(true);
        
        try {
            // Fetch comprehensive context for the LLM
            const [goals, swot, finance] = await Promise.all([
                getGoals(),
                getSwot(),
                getRunwayData()
            ]);

            const slides = await generateInvestorPitch({
                ...pitchForm,
                strategy: { goals, swot },
                finance: finance
            });
            
            if (slides.length > 0) {
                const newDeck: PitchDeck = {
                    id: Date.now().toString(),
                    title: `${pitchForm.companyName} Pitch Deck`,
                    createdAt: new Date().toISOString(),
                    slides: slides.map((s, i) => ({...s, id: i.toString()})),
                    theme: 'MODERN_DARK'
                };
                
                const updatedDecks = await savePitchDeck(newDeck);
                setDecks(updatedDecks);
                setCurrentDeck(newDeck);
                setPitchMode('VIEW');
                setCurrentSlideIndex(0);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to generate pitch. Please check API limits.");
        } finally {
            setPitchLoading(false);
        }
    };

    const handleSaveDeck = async () => {
        if (currentDeck) {
            const updated = await savePitchDeck(currentDeck);
            setDecks(updated);
            alert('Deck Saved!');
        }
    };

    const handleDeleteDeck = async (id: string) => {
        if(confirm("Delete deck?")) {
            const updated = await deletePitchDeck(id);
            setDecks(updated);
            if (currentDeck?.id === id) {
                setCurrentDeck(null);
                setPitchMode('LIST');
            }
        }
    }

    // --- Pitch Viewer/Editor ---
    const renderSlideEditor = () => {
        if (!currentDeck) return null;
        const slide = currentDeck.slides[currentSlideIndex];

        return (
            <div className="flex flex-col h-full">
                {/* Editor Toolbar */}
                <div className="flex justify-between items-center mb-4 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                    <Button variant="ghost" onClick={() => setPitchMode('LIST')}><Icons.ArrowLeft size={16} className="mr-2"/> Back</Button>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-neutral-500">Slide {currentSlideIndex + 1} / {currentDeck.slides.length}</span>
                        <div className="flex gap-1">
                            <button disabled={currentSlideIndex === 0} onClick={() => setCurrentSlideIndex(i => i - 1)} className="p-1 hover:bg-neutral-800 rounded text-neutral-400 disabled:opacity-50"><Icons.ChevronLeft/></button>
                            <button disabled={currentSlideIndex === currentDeck.slides.length - 1} onClick={() => setCurrentSlideIndex(i => i + 1)} className="p-1 hover:bg-neutral-800 rounded text-neutral-400 disabled:opacity-50"><Icons.ChevronRight/></button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSaveDeck}><Icons.Save size={16} className="mr-2"/> Save</Button>
                        <Button onClick={() => window.print()}><Icons.Download size={16} className="mr-2"/> PDF</Button>
                    </div>
                </div>

                {/* Main Slide View */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    {/* Visual Slide Representation */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                        <div className="aspect-video bg-gradient-to-br from-neutral-900 to-black border-2 border-neutral-800 rounded-xl p-12 flex flex-col shadow-2xl relative overflow-hidden group">
                            {/* Slide Content */}
                            <div className="relative z-10">
                                <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">{slide.title}</h2>
                                <ul className="space-y-4">
                                    {slide.content.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3 text-xl text-neutral-300">
                                            <span className="mt-2 w-2 h-2 rounded-full bg-primary-500 shrink-0"/>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Decorative Background */}
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px]" />
                            <div className="absolute top-0 right-0 p-4 opacity-50">
                                <div className="text-xs font-bold text-neutral-600 tracking-widest uppercase">{currentDeck.title}</div>
                            </div>
                        </div>
                    </div>

                    {/* Editor Panel */}
                    <Card className="flex flex-col gap-4 overflow-y-auto">
                        <h3 className="font-bold text-white border-b border-neutral-800 pb-2">Slide Content</h3>
                        <div>
                            <label className="text-xs text-neutral-500 uppercase font-bold">Title</label>
                            <input 
                                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white mt-1" 
                                value={slide.title} 
                                onChange={(e) => {
                                    const newSlides = [...currentDeck.slides];
                                    newSlides[currentSlideIndex].title = e.target.value;
                                    setCurrentDeck({...currentDeck, slides: newSlides});
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 uppercase font-bold">Bullet Points</label>
                            <textarea 
                                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white mt-1 h-32 text-sm" 
                                value={slide.content.join('\n')} 
                                onChange={(e) => {
                                    const newSlides = [...currentDeck.slides];
                                    newSlides[currentSlideIndex].content = e.target.value.split('\n');
                                    setCurrentDeck({...currentDeck, slides: newSlides});
                                }}
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                                <Icons.Mic size={12} /> Speaker Notes
                            </label>
                            <textarea 
                                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-neutral-400 mt-1 flex-1 resize-none text-sm italic" 
                                value={slide.speakerNotes}
                                onChange={(e) => {
                                    const newSlides = [...currentDeck.slides];
                                    newSlides[currentSlideIndex].speakerNotes = e.target.value;
                                    setCurrentDeck({...currentDeck, slides: newSlides});
                                }}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    const handleDeckImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDataRoomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        try {
            const result = await uploadFile(file);
            setUploadedFiles(prev => [...prev, { name: result.name, url: result.url }]);
        } catch (error) {
            console.error(error);
            alert("Upload failed. Is the backend running?");
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyzeDeck = async () => {
        if (!uploadedImage) return;
        setAnalyzing(true);
        const base64Data = uploadedImage.split(',')[1];
        const result = await analyzePitchDeckImage(base64Data);
        setAnalysisResult(result);
        setAnalyzing(false);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white">Investor Relations</h1>
                    <p className="text-neutral-400">Manage fundraising, pipeline, and communications.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Icons.Download size={16} className="mr-2"/> Report</Button>
                    <Button onClick={handleOpenAdd}><Icons.Plus size={16} className="mr-2"/> New Investor</Button>
                </div>
            </div>

            {round && (
                <Card className="shrink-0 bg-gradient-to-r from-neutral-900 to-neutral-950">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 w-full">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-white">{round.name}</span>
                                <span className="text-sm text-neutral-400">${round.raisedAmount.toLocaleString()} / ${round.targetAmount.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-600 rounded-full transition-all duration-1000" style={{ width: `${calculateProgress()}%` }} />
                            </div>
                        </div>
                        <div className="flex gap-8 text-center shrink-0">
                            <div><div className="text-2xl font-bold text-white">${(round.preMoneyValuation / 1000000).toFixed(1)}M</div><div className="text-xs text-neutral-500 uppercase tracking-wide">Pre-Money Val</div></div>
                            <div><div className="text-2xl font-bold text-white">{investors.filter(i => i.status === 'COMMITTED').length}</div><div className="text-xs text-neutral-500 uppercase tracking-wide">Commits</div></div>
                        </div>
                    </div>
                </Card>
            )}

            <div className="flex border-b border-neutral-800 shrink-0" id="investor-tabs">
                {['PIPELINE', 'UPDATES', 'DOCS', 'PITCH'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}>
                        {tab === 'DOCS' ? 'Data Room' : tab === 'PITCH' ? 'Pitch Generator' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {activeTab === 'PIPELINE' && (
                <div className="flex gap-4 overflow-x-auto h-full pb-2">
                    {['PROSPECT', 'CONTACTED', 'MEETING', 'DUE_DILIGENCE', 'COMMITTED'].map(status => (
                        <StatusColumn 
                            key={status} 
                            title={status.replace('_', ' ')} 
                            status={status as InvestorStatus} 
                            items={investors.filter(i => i.status === status)}
                            onAdd={handleOpenAdd}
                            onEdit={handleOpenEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'UPDATES' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 space-y-4">
                        <Card title="Draft New Update">
                            <textarea className="w-full h-64 bg-black border border-neutral-800 rounded-lg p-4 text-white focus:ring-2 focus:ring-primary-600 outline-none resize-none" placeholder="Hi everyone, quick update on our Q3 progress..." />
                            <div className="mt-4 flex justify-end gap-3"><Button variant="ghost">Save Draft</Button><Button>Preview & Send</Button></div>
                        </Card>
                    </div>
                    <div className="space-y-4">
                        <Card title="Past Updates">
                            <div className="space-y-4">
                                <div className="pb-4 border-b border-neutral-800 last:border-0">
                                    <div className="flex justify-between items-start"><h4 className="text-sm font-medium text-white">October Investor Update</h4><span className="text-xs text-neutral-500">Oct 1, 2024</span></div>
                                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">We hit $12k MRR and closed our first enterprise deal...</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'DOCS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-y-auto">
                    {/* File Upload Section */}
                    <div className="flex flex-col gap-6">
                        <Card title="Data Room Files" className="flex-1">
                            <div className="space-y-4 mb-4">
                                {uploadedFiles.length === 0 && <p className="text-sm text-neutral-500 italic">No files uploaded yet.</p>}
                                {uploadedFiles.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-neutral-900 rounded border border-neutral-800">
                                        <div className="flex items-center gap-3">
                                            <Icons.FileText size={16} className="text-primary-500"/>
                                            <span className="text-sm text-white truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                        <a href={file.url} target="_blank" className="text-xs text-neutral-400 hover:text-white flex items-center gap-1">
                                            <Icons.Download size={12} /> Open
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <div className="relative">
                                <input type="file" onChange={handleDataRoomUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <Button className="w-full" isLoading={uploading} variant="outline">
                                    <Icons.UploadCloud size={16} className="mr-2" /> Upload to Secure S3
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Image Analyzer */}
                    <div className="flex flex-col gap-6">
                         <Card title="Deck AI Grader" className="flex-1 flex flex-col">
                             {!uploadedImage ? (
                                 <div className="flex-1 border-2 border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-neutral-900/50 transition-colors relative">
                                    <input type="file" accept="image/*" onChange={handleDeckImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Icons.UploadCloud size={48} className="text-neutral-600 mb-4" />
                                    <h3 className="text-neutral-300 font-medium">Upload Slide Image</h3>
                                    <p className="text-xs text-neutral-500 mt-2 text-center">AI Analysis</p>
                                 </div>
                             ) : (
                                 <div className="flex-1 flex flex-col">
                                     <div className="relative h-48 rounded-xl overflow-hidden mb-4 border border-neutral-800">
                                         <img src={uploadedImage} alt="Uploaded Slide" className="w-full h-full object-cover" />
                                         <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500"><Icons.X size={16}/></button>
                                     </div>
                                     <Button onClick={handleAnalyzeDeck} isLoading={analyzing}><Icons.Eye size={16} className="mr-2" /> Analyze Slide</Button>
                                 </div>
                             )}
                             {analysisResult && (
                                 <div className="mt-6 animate-slide-in">
                                     <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-white">Score</h3><div className="text-2xl font-black text-white">{analysisResult.score}/100</div></div>
                                     <div className="bg-neutral-900 p-4 rounded-lg mb-4 text-sm text-neutral-300 italic border-l-2 border-primary-500">"{analysisResult.critique}"</div>
                                     <ul className="space-y-2">{analysisResult.improvements.map((imp, i) => <li key={i} className="flex items-start gap-2 text-sm text-neutral-400"><Icons.CheckCircle2 size={16} className="text-primary-500 shrink-0 mt-0.5" />{imp}</li>)}</ul>
                                 </div>
                             )}
                         </Card>
                    </div>
                </div>
            )}

            {activeTab === 'PITCH' && (
                <div className="h-full overflow-hidden flex flex-col">
                    {/* READINESS GATE CHECK */}
                    {readiness && !readiness.isReady && pitchMode === 'LIST' && (
                        <div className="mb-6 p-4 bg-red-900/10 border border-red-900/50 rounded-xl flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-red-900/20 rounded-full text-red-500"><Icons.AlertTriangle size={24}/></div>
                                <div>
                                    <h3 className="text-white font-bold">Fundraising Gate Locked</h3>
                                    <p className="text-sm text-neutral-400">
                                        Your runway is <span className="text-white font-bold">{readiness.runway} months</span>. Investors typically require >6 months runway to engage.
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="border-red-900 text-red-400 hover:bg-red-900/20" onClick={() => window.location.hash = '#/finance'}>
                                Improve Financials
                            </Button>
                        </div>
                    )}

                    {pitchMode === 'LIST' && (
                        <div className="space-y-6">
                            <Card className="bg-gradient-to-r from-primary-900/20 to-black border-primary-900/50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">AI Pitch Deck Generator</h2>
                                        <p className="text-neutral-400 text-sm mt-1">Generate a 10-slide deck based on your Strategy, Financials, and Metrics.</p>
                                    </div>
                                    <Button 
                                        onClick={() => setPitchMode('CREATE')} 
                                        disabled={readiness ? !readiness.isReady : false}
                                        className={readiness && !readiness.isReady ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                        <Icons.Plus size={16} className="mr-2" /> Create New Deck
                                    </Button>
                                </div>
                            </Card>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {decks.map(deck => (
                                    <div key={deck.id} onClick={() => { setCurrentDeck(deck); setPitchMode('VIEW'); }} className="group bg-neutral-900 border border-neutral-800 rounded-xl p-4 cursor-pointer hover:border-primary-600/50 transition-all relative overflow-hidden">
                                        <div className="aspect-video bg-neutral-800 rounded-lg mb-4 flex items-center justify-center text-neutral-600 group-hover:bg-neutral-800/50">
                                            <Icons.Presentation size={48} />
                                        </div>
                                        <h3 className="font-bold text-white mb-1">{deck.title}</h3>
                                        <p className="text-xs text-neutral-500">{new Date(deck.createdAt).toLocaleDateString()} • {deck.slides.length} Slides</p>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.id); }} className="absolute top-4 right-4 p-2 bg-black/50 rounded hover:bg-red-900/50 text-neutral-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Icons.Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {decks.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-neutral-500">
                                        No decks generated yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {pitchMode === 'CREATE' && (
                        <div className="max-w-2xl mx-auto w-full h-full flex flex-col justify-center">
                            <Card title="Configure Deck Generation">
                                <div className="space-y-4">
                                    <div className="bg-primary-900/10 border border-primary-900/50 p-4 rounded-lg flex gap-3 text-sm text-primary-200">
                                        <Icons.Sparkles size={20} className="shrink-0 text-primary-500" />
                                        <p>Our AI will read your live data (Strategic Goals, Runway, Market Research) to populate this deck automatically.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 mb-1">Company Name</label>
                                        <input className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white outline-none" placeholder="Acme Inc." value={pitchForm.companyName} onChange={e => setPitchForm({...pitchForm, companyName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 mb-1">Problem Statement</label>
                                        <textarea className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white outline-none h-24 resize-none" placeholder="What pain point are you solving?" value={pitchForm.problem} onChange={e => setPitchForm({...pitchForm, problem: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-500 mb-1">Key Traction (Optional)</label>
                                            <input className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white outline-none" placeholder="e.g. $10k MRR" value={pitchForm.traction} onChange={e => setPitchForm({...pitchForm, traction: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-500 mb-1">Funding Ask</label>
                                            <input className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white outline-none" placeholder="e.g. $2M Seed" value={pitchForm.ask} onChange={e => setPitchForm({...pitchForm, ask: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <Button variant="ghost" onClick={() => setPitchMode('LIST')}>Cancel</Button>
                                        <Button className="flex-1" onClick={handleGeneratePitch} isLoading={pitchLoading}>Generate Deck</Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {pitchMode === 'VIEW' && renderSlideEditor()}
                </div>
            )}

            {/* Create/Edit Investor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Investor' : 'Add Investor'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Contact Name</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sarah Smith" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Firm</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={formData.firm} onChange={e => setFormData({...formData, firm: e.target.value})} placeholder="e.g. Sequoia" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Estimated Check Size</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={formData.checkSize} onChange={e => setFormData({...formData, checkSize: e.target.value})} placeholder="e.g. $500k" />
                            </div>
                            <Button className="w-full" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add to Pipeline'}</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
