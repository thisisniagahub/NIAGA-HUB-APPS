
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getInvestors } from '../services/investorService';
import { getSalesDeals } from '../services/salesService';
import { getFinancialMetrics } from '../services/financeService';
import { generateBusinessReport } from '../services/geminiService';
import { Investor, SalesDeal, FinancialMetric } from '../types';
import ReactMarkdown from 'react-markdown';

export const AnalyticsModule: React.FC = () => {
    const [financeData, setFinanceData] = useState<FinancialMetric[]>([]);
    const [salesData, setSalesData] = useState<SalesDeal[]>([]);
    const [investorData, setInvestorData] = useState<Investor[]>([]);
    const [loading, setLoading] = useState(true);
    
    // AI Report State
    const [report, setReport] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const [fData, sData, iData] = await Promise.all([
                getFinancialMetrics(),
                getSalesDeals(),
                getInvestors()
            ]);
            setFinanceData(fData);
            setSalesData(sData);
            setInvestorData(iData);
            setLoading(false);
        };
        loadData();
    }, []);

    // Aggregations
    const totalPipelineValue = salesData.reduce((acc, deal) => acc + deal.value, 0);
    const wonDealsCount = salesData.filter(d => d.stage === 'CLOSED_WON').length;
    const conversionRate = salesData.length > 0 ? ((wonDealsCount / salesData.length) * 100).toFixed(1) : 0;
    
    // Investor Breakdown
    const investorStatusData = [
        { name: 'Prospect', value: investorData.filter(i => i.status === 'PROSPECT').length, color: '#525252' },
        { name: 'Meeting', value: investorData.filter(i => i.status === 'MEETING' || i.status === 'DUE_DILIGENCE').length, color: '#eab308' },
        { name: 'Committed', value: investorData.filter(i => i.status === 'COMMITTED').length, color: '#22c55e' },
    ].filter(d => d.value > 0);

    const handleGenerateReport = async () => {
        setGenerating(true);
        const context = JSON.stringify({
            finance: financeData.slice(-3), // Last 3 months
            pipelineValue: totalPipelineValue,
            conversionRate: conversionRate,
            activeInvestors: investorData.length
        }, null, 2);
        
        const text = await generateBusinessReport(context);
        setReport(text);
        setGenerating(false);
    };

    if (loading) return <div className="p-10 text-center"><Icons.Loader2 className="animate-spin inline"/> Loading Intelligence...</div>;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Analytics & BI</h1>
                    <p className="text-neutral-400">Deep dive into platform usage and financial health.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Icons.Calendar size={16} className="mr-2"/> Year to Date</Button>
                    <Button onClick={handleGenerateReport} isLoading={generating}>
                        <Icons.Sparkles size={16} className="mr-2"/> Generate AI Report
                    </Button>
                </div>
            </div>

            {report && (
                <Card className="bg-gradient-to-br from-neutral-900 to-black border-primary-900/30 animate-fade-in">
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="flex items-center gap-2 text-primary-400 mb-4 pb-4 border-b border-neutral-800">
                            <Icons.Bot size={20} />
                            <span className="font-bold">Executive Summary (Gemini Pro)</span>
                        </div>
                        <ReactMarkdown>{report}</ReactMarkdown>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="text-neutral-400 text-sm mb-1">Total Pipeline Value</div>
                    <div className="text-3xl font-bold text-white">${totalPipelineValue.toLocaleString()}</div>
                    <div className="text-green-400 text-xs mt-2 flex items-center"><Icons.TrendingUp size={12} className="mr-1"/> Live Data</div>
                </Card>
                <Card>
                    <div className="text-neutral-400 text-sm mb-1">Win Rate</div>
                    <div className="text-3xl font-bold text-white">{conversionRate}%</div>
                    <div className="text-neutral-500 text-xs mt-2 flex items-center"><Icons.Target size={12} className="mr-1"/> {wonDealsCount} Closed Deals</div>
                </Card>
                <Card>
                    <div className="text-neutral-400 text-sm mb-1">Active Investors</div>
                    <div className="text-3xl font-bold text-white">{investorData.length}</div>
                    <div className="text-blue-400 text-xs mt-2 flex items-center"><Icons.Users size={12} className="mr-1"/> In Pipeline</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Financial Growth (Revenue vs Expenses)">
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financeData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis dataKey="month" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                                <Area type="monotone" dataKey="expenses" stroke="#dc2626" fillOpacity={0} strokeDasharray="5 5" name="Expenses" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                <Card title="Investor Pipeline Status">
                    <div className="h-[300px] flex items-center justify-center min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={investorStatusData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {investorStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Custom Legend */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                            {investorStatusData.map(d => (
                                <div key={d.name} className="flex items-center gap-2 text-xs text-neutral-300">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                    {d.name}: {d.value}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};