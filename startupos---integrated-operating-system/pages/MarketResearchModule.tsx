
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { performMarketResearch } from '../services/geminiService';
import { getMarketplaceApps } from '../services/marketplaceService';
import { getLaborMarketData } from '../services/lightcastService';
import { LaborMarketData } from '../types';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const MarketResearchModule: React.FC = () => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'MARKET' | 'LABOR'>('MARKET');
    
    // Core Market Research State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ text: string; links: any[] } | null>(null);
    const [loading, setLoading] = useState(false);

    // Lightcast State
    const [isLightcastInstalled, setIsLightcastInstalled] = useState(false);
    const [role, setRole] = useState('');
    const [location, setLocation] = useState('');
    const [laborData, setLaborData] = useState<LaborMarketData | null>(null);
    const [laborLoading, setLaborLoading] = useState(false);

    // Check for plugin on mount
    useEffect(() => {
        getMarketplaceApps().then(apps => {
            const app = apps.find(a => a.id === 'lightcast');
            if (app && app.installed) setIsLightcastInstalled(true);
        });
    }, []);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const data = await performMarketResearch(query);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLaborSearch = async () => {
        if (!role || !location) return;
        setLaborLoading(true);
        try {
            const data = await getLaborMarketData(role, location);
            setLaborData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLaborLoading(false);
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Market Intelligence</h1>
                    <p className="text-neutral-400">Deep dive into competitors and trends with real-time data.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-900/30 border border-blue-800 text-blue-400 text-xs rounded-full uppercase font-bold tracking-wider">
                        Google Search
                    </div>
                    {isLightcastInstalled && (
                        <div className="px-3 py-1 bg-purple-900/30 border border-purple-800 text-purple-400 text-xs rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                            <Icons.Zap size={10} fill="currentColor" /> Lightcast
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-800">
                <button 
                    onClick={() => setActiveTab('MARKET')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'MARKET' ? 'border-primary-600 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                >
                    Market Analysis
                </button>
                {isLightcastInstalled ? (
                     <button 
                        onClick={() => setActiveTab('LABOR')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'LABOR' ? 'border-purple-500 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
                    >
                        Labor Intelligence
                    </button>
                ) : (
                    <div className="group relative flex items-center">
                        <button disabled className="px-4 py-3 text-sm font-medium text-neutral-600 cursor-not-allowed">
                            Labor Intelligence <Icons.Lock size={10} className="inline ml-1 mb-0.5" />
                        </button>
                        <div className="absolute top-full left-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 p-2 rounded text-xs text-neutral-400 hidden group-hover:block z-10 shadow-xl">
                            Install <strong>Lightcast</strong> from Marketplace to unlock salary & skills data.
                        </div>
                    </div>
                )}
            </div>

            {/* --- MARKET ANALYSIS TAB --- */}
            {activeTab === 'MARKET' && (
                <div className="space-y-6 animate-fade-in">
                    <Card>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Icons.Search className="absolute left-3 top-3 text-neutral-500" size={20} />
                                <input 
                                    id="market-search-input" // Targeted by Tutorial
                                    type="text" 
                                    className="w-full bg-black border border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none"
                                    placeholder="e.g. Trends in vertical SaaS for construction 2024..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} isLoading={loading}>Analyze Market</Button>
                        </div>
                    </Card>

                    {results && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2" title="Analysis">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{results.text}</ReactMarkdown>
                                </div>
                            </Card>
                            <Card title="Sources">
                                <div className="space-y-3">
                                    {results.links && results.links.length > 0 ? (
                                        results.links.map((link: any, idx: number) => (
                                            <a 
                                                key={idx} 
                                                href={link.web?.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block p-3 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-primary-600 transition-colors group"
                                            >
                                                <div className="font-medium text-white text-sm truncate group-hover:text-primary-400">
                                                    {link.web?.title || 'Source'}
                                                </div>
                                                <div className="text-xs text-neutral-500 truncate mt-1">
                                                    {link.web?.uri}
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <p className="text-neutral-500 text-sm">No direct sources linked.</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* --- LABOR INTELLIGENCE TAB (Lightcast) --- */}
            {activeTab === 'LABOR' && (
                <div className="space-y-6 animate-fade-in">
                    <Card className="bg-gradient-to-r from-purple-900/10 to-transparent border-purple-900/30">
                         <div className="flex gap-4">
                            <div className="relative flex-1">
                                <label className="block text-xs font-bold text-purple-400 mb-1 uppercase">Job Role</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                                    placeholder="e.g. Senior React Developer"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                            </div>
                            <div className="relative flex-1">
                                <label className="block text-xs font-bold text-purple-400 mb-1 uppercase">Location</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                                    placeholder="e.g. Austin, TX"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleLaborSearch} isLoading={laborLoading} className="bg-purple-600 hover:bg-purple-700 h-[42px]">
                                    <Icons.Search size={16} className="mr-2" />
                                    Get Data
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {laborData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="flex flex-col justify-between">
                                <div>
                                    <div className="text-sm text-neutral-400 mb-1">Median Salary</div>
                                    <div className="text-3xl font-bold text-white">${laborData.medianSalary.toLocaleString()}</div>
                                </div>
                                <div className="mt-4 text-xs text-neutral-500">Based on recent postings</div>
                            </Card>
                            <Card className="flex flex-col justify-between">
                                <div>
                                    <div className="text-sm text-neutral-400 mb-1">Monthly Postings</div>
                                    <div className="text-3xl font-bold text-white">{laborData.postingVolume.toLocaleString()}</div>
                                </div>
                                <div className="mt-4 text-xs text-neutral-500">Volume in {laborData.location}</div>
                            </Card>
                            <Card className="flex flex-col justify-between">
                                <div>
                                    <div className="text-sm text-neutral-400 mb-1">Growth (YoY)</div>
                                    <div className={`text-3xl font-bold ${laborData.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {laborData.growthRate > 0 ? '+' : ''}{laborData.growthRate}%
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-neutral-500">Demand trend</div>
                            </Card>
                            
                            <Card className="lg:col-span-1 row-span-2" title="Top Skills">
                                <div className="flex flex-wrap gap-2">
                                    {laborData.topSkills.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300 border border-neutral-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </Card>

                            <Card className="lg:col-span-3" title="Salary Distribution">
                                {/* FIX: Explicit height wrapper to resolve Recharts warning */}
                                <div className="h-[300px] w-full min-h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart 
                                            data={[
                                                { name: '10th %', value: laborData.salaryPercentiles.p10 },
                                                { name: 'Median', value: laborData.salaryPercentiles.p50 },
                                                { name: '90th %', value: laborData.salaryPercentiles.p90 },
                                            ]}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                                            <XAxis type="number" stroke="#525252" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                            <YAxis dataKey="name" type="category" stroke="#525252" fontSize={12} width={60} />
                                            <Tooltip 
                                                cursor={{fill: '#1a1a1a'}}
                                                contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Salary']}
                                            />
                                            <Bar dataKey="value" fill="#9333ea" radius={[0, 4, 4, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    ) : !laborLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-600">
                            <Icons.BarChart2 size={48} className="mb-4 opacity-20" />
                            <p>Enter a role and location to analyze labor market data.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
