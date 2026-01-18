
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getMarketplaceApps, installApp, uninstallApp } from '../services/marketplaceService';
import { MarketplaceApp, AppCategory } from '../types';
import { MCPPage } from './MCPPage';

// Map icon strings to Lucide components
const IconMap: Record<string, any> = {
    'Layers': Icons.Layers,
    'Github': Icons.Github,
    'Triangle': Icons.Triangle,
    'CheckSquare': Icons.CheckSquare,
    'Database': Icons.Database,
    'Cloud': Icons.Cloud,
    'Mail': Icons.Mail,
    'MessageCircle': Icons.MessageCircle,
    'CreditCard': Icons.CreditCard,
    'FileSpreadsheet': Icons.FileSpreadsheet,
    'FileText': Icons.FileText,
    'Slack': Icons.Slack,
    'MessageSquare': Icons.MessageSquare,
    'Video': Icons.Video,
    'File': Icons.File,
    'Figma': Icons.Figma,
    'Zap': Icons.Zap,
    'BarChart2': Icons.BarChart2,
    'Calendar': Icons.Calendar,
    'Chrome': Icons.Chrome,
    'AlertOctagon': Icons.AlertOctagon,
    'Code': Icons.Code,
    'BrainCircuit': Icons.BrainCircuit,
    'Layout': Icons.Layout,
    'CheckCircle': Icons.CheckCircle,
    'Trello': Icons.Trello,
    'Check': Icons.Check,
    'List': Icons.List,
    'Users': Icons.Users,
    'Phone': Icons.Phone,
    'Search': Icons.Search,
    'Globe': Icons.Globe,
    'Mic': Icons.Mic,
    'DollarSign': Icons.DollarSign,
    'BarChart': Icons.BarChart,
    'Image': Icons.Image,
    'Film': Icons.Film,
    'Music': Icons.Music,
    'Activity': Icons.Activity,
    'Cpu': Icons.Cpu,
    // Fallback
    'Box': Icons.Box
};

export const MarketplacePage: React.FC = () => {
    const [apps, setApps] = useState<MarketplaceApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | AppCategory | 'INSTALLED'>('ALL');
    const [search, setSearch] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [configAppId, setConfigAppId] = useState<string | null>(null); // For modal
    const [activeTab, setActiveTab] = useState<'APPS' | 'MCP'>('APPS');

    useEffect(() => {
        loadApps();
    }, []);

    const loadApps = async () => {
        const data = await getMarketplaceApps();
        setApps(data);
        setLoading(false);
    };

    const handleInstall = async (id: string) => {
        setProcessingId(id);
        try {
            await installApp(id);
            await loadApps();
            // Auto open config for newly installed apps
            setConfigAppId(id);
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleUninstall = async (id: string) => {
        setProcessingId(id);
        try {
            await uninstallApp(id);
            await loadApps();
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                              app.description.toLowerCase().includes(search.toLowerCase());
        
        if (!matchesSearch) return false;

        if (filter === 'ALL') return true;
        if (filter === 'INSTALLED') return app.installed;
        return app.category === filter;
    });

    const activeCount = apps.filter(a => a.installed).length;

    const categories: (AppCategory | 'ALL' | 'INSTALLED')[] = ['ALL', 'INSTALLED', 'ENGINEERING', 'GROWTH', 'FINANCE', 'PRODUCTIVITY', 'COMMUNICATION', 'DESIGN', 'DATA'];

    // Specific Content Renderers for the Modal
    const renderConfigContent = () => {
        if (configAppId === 'my-browser') {
            const browserApp = apps.find(a => a.id === 'my-browser');
            return (
                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Header Icon */}
                    <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center p-3 border border-neutral-700 shadow-xl">
                        <Icons.Chrome size={40} className="text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white">My Browser</h2>

                    {/* Description */}
                    <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
                        {browserApp?.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full max-w-xs">
                        {browserApp?.installed ? (
                            <>
                                <Button className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700" onClick={() => setConfigAppId(null)}>
                                    <Icons.Zap size={16} className="mr-2 text-primary-500" /> Try it out
                                </Button>
                                <Button className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700" onClick={() => handleUninstall('my-browser')}>
                                    Manage
                                </Button>
                            </>
                        ) : (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleInstall('my-browser')} isLoading={processingId === 'my-browser'}>
                                Add to Chrome
                            </Button>
                        )}
                    </div>

                    {/* Video/Media Placeholder */}
                    <div className="w-full h-48 bg-neutral-800 rounded-xl overflow-hidden relative group border border-neutral-800">
                        {/* Fake Browser UI */}
                        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex flex-col">
                             <div className="h-6 bg-neutral-900 border-b border-neutral-700 flex items-center px-2 gap-1.5">
                                 <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                 <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                 <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                 <div className="ml-4 h-3 w-32 bg-neutral-800 rounded-full"></div>
                             </div>
                             <div className="flex-1 p-4 relative">
                                 {/* Mock Content */}
                                 <div className="absolute top-4 right-4 w-32 h-20 bg-white/10 rounded-lg shadow-xl backdrop-blur-md border border-white/20 p-2 flex flex-col gap-2">
                                     <div className="flex items-center gap-2">
                                         <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                         <div className="h-2 w-16 bg-white/30 rounded"></div>
                                     </div>
                                     <div className="h-2 w-full bg-white/10 rounded"></div>
                                     <div className="h-2 w-20 bg-white/10 rounded"></div>
                                 </div>
                             </div>
                        </div>
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Icons.Play fill="white" className="text-white ml-1" size={20} />
                            </div>
                        </div>
                        
                        <div className="absolute top-4 left-4">
                            <h3 className="text-white font-bold text-lg drop-shadow-md">Introducing Manus Browser Operator</h3>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="w-full bg-neutral-900/50 rounded-xl border border-neutral-800 p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-500">Connector Type</span>
                            <span className="text-neutral-300">Browser Extension</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-neutral-800 pt-3">
                            <span className="text-neutral-500">Author</span>
                            <span className="text-white font-medium">Manus</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-neutral-800 pt-3">
                            <span className="text-neutral-500">UUID</span>
                            <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1" onClick={() => navigator.clipboard.writeText('ext-uuid-1234')}>
                                <Icons.Copy size={12} />
                            </button>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-neutral-800 pt-3">
                            <span className="text-neutral-500">Website</span>
                            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <Icons.ExternalLink size={12} />
                            </a>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-neutral-800 pt-3">
                            <span className="text-neutral-500">Privacy Policy</span>
                            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <Icons.ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                    
                    <button className="text-xs text-neutral-500 hover:text-neutral-300 underline">
                        Provide feedback
                    </button>
                </div>
            );
        }

        // Default Config for standard apps
        return (
            <div className="space-y-4">
                 <div className="mb-6">
                    <div className="w-12 h-12 bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-500 mb-4">
                        <Icons.Settings size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Configure {apps.find(a => a.id === configAppId)?.name}</h2>
                    <p className="text-neutral-400 text-sm mt-1">Connect your account to enable data sync.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">API Key / Personal Access Token</label>
                    <input 
                        type="password" 
                        className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-white focus:border-primary-600 outline-none"
                        placeholder="sk_live_..."
                    />
                </div>
                
                {apps.find(a => a.id === configAppId)?.mcpConfig && (
                    <div className="bg-purple-900/20 border border-purple-900/50 p-3 rounded-lg flex gap-3 items-start">
                        <Icons.BrainCircuit className="text-purple-400 shrink-0 mt-0.5" size={16} />
                        <div>
                            <h4 className="text-sm font-bold text-purple-200">Agent Connection Active</h4>
                            <p className="text-xs text-purple-300/80 mt-1">
                                The MCP Server "{apps.find(a => a.id === configAppId)?.mcpConfig?.name}" has been auto-provisioned. Your AI agents can now access this data.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-900 p-3 rounded">
                    <Icons.Lock size={12} />
                    Data is encrypted and stored locally in your browser.
                </div>
                <div className="flex gap-3 pt-2">
                    <Button className="flex-1" onClick={() => setConfigAppId(null)}>Save Configuration</Button>
                    <Button variant="ghost" onClick={() => setConfigAppId(null)}>Skip</Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-10 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Icons.Network className="text-primary-500" />
                        Connectors & Apps
                    </h1>
                    <p className="text-neutral-400 mt-1">Supercharge StartupOS with native integrations, Custom APIs, and MCP Servers.</p>
                </div>
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2">
                    <Icons.Zap size={16} className="text-primary-500" />
                    <span className="text-sm font-medium text-white">{activeCount} Active</span>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex border-b border-neutral-800">
                <button 
                    onClick={() => setActiveTab('APPS')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'APPS' ? 'border-primary-600 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                >
                    <Icons.ShoppingBag size={16} /> Marketplace
                </button>
                <button 
                    onClick={() => setActiveTab('MCP')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'MCP' ? 'border-primary-600 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                >
                    <Icons.Cpu size={16} /> My Connectors
                </button>
            </div>

            {activeTab === 'MCP' ? (
                <div className="animate-fade-in">
                    <MCPPage embedded={true} />
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Search & Filter */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Icons.Search className="absolute left-3 top-3 text-neutral-500" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search apps by name, category, or description..." 
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-800">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filter === cat 
                                            ? 'bg-primary-900/30 text-primary-400 border border-primary-800' 
                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                    }`}
                                >
                                    {cat === 'ALL' ? 'All Apps' : cat === 'INSTALLED' ? 'My Apps' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* App Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Icons.Loader2 size={40} className="animate-spin text-primary-600" />
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="text-center py-20 text-neutral-500">
                            <Icons.Ghost size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No apps found matching your criteria.</p>
                            <Button variant="ghost" onClick={() => { setFilter('ALL'); setSearch(''); }} className="mt-4">Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredApps.map(app => {
                                const IconComponent = IconMap[app.icon] || Icons.Box;
                                const isProcessing = processingId === app.id;

                                return (
                                    <Card key={app.id} className="flex flex-col h-full hover:border-neutral-700 transition-colors group relative overflow-hidden">
                                        {app.mcpConfig && (
                                            <div className="absolute top-3 right-3 z-10" title="Includes Agent Capabilities (MCP)">
                                                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-900 to-purple-800 border border-purple-700/50 rounded-full px-2 py-0.5 shadow-lg">
                                                    <Icons.BrainCircuit size={10} className="text-purple-300" />
                                                    <span className="text-[9px] font-bold text-purple-200 uppercase tracking-wide">Agent Ready</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between mb-4 mt-2">
                                            <div className={`p-3 rounded-xl ${app.installed ? 'bg-primary-900/20 text-primary-500' : 'bg-neutral-800 text-neutral-400 group-hover:text-white transition-colors'}`}>
                                                <IconComponent size={28} />
                                            </div>
                                            <div className="flex items-center gap-1 bg-neutral-900 rounded px-2 py-1">
                                                <Icons.Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                <span className="text-xs font-medium text-neutral-300">{app.rating}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4 flex-1">
                                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                                {app.name}
                                                {app.installed && <Icons.CheckCircle size={14} className="text-green-500" />}
                                            </h3>
                                            <p className="text-xs text-neutral-500 mb-2">by {app.author}</p>
                                            <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">{app.description}</p>
                                            
                                            {app.mcpConfig && (
                                                <p className="mt-3 text-[10px] text-purple-400 flex items-center gap-1">
                                                    <Icons.Plus size={10} /> Auto-installs Agent Tools
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-neutral-800 flex items-center gap-3">
                                            {app.installed ? (
                                                <>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="flex-1"
                                                        onClick={() => setConfigAppId(app.id)}
                                                    >
                                                        <Icons.Settings size={14} className="mr-2" /> Configure
                                                    </Button>
                                                    <button 
                                                        onClick={() => handleUninstall(app.id)}
                                                        disabled={isProcessing}
                                                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                                                    >
                                                        {isProcessing ? <Icons.Loader2 size={18} className="animate-spin" /> : <Icons.Trash2 size={18} />}
                                                    </button>
                                                </>
                                            ) : (
                                                <Button 
                                                    variant="primary" 
                                                    className="w-full"
                                                    onClick={() => handleInstall(app.id)}
                                                    isLoading={isProcessing}
                                                >
                                                    Install App
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Configuration Modal */}
            {configAppId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md relative animate-slide-in">
                        <button 
                            onClick={() => setConfigAppId(null)}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white z-20"
                        >
                            <Icons.X size={20} />
                        </button>
                        
                        {renderConfigContent()}
                    </Card>
                </div>
            )}
        </div>
    );
};
