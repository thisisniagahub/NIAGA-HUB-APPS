
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getFinancialMetrics, getRunwayData, getTransactions, addTransaction } from '../services/financeService';
import { FinancialMetric, Transaction } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import * as Icons from 'lucide-react';
import { CRUDTable, Column } from '../components/ui/CRUDTable';
import { useToast } from '../context/ToastContext';
import { db } from '../services/localStorageDb';

export const FinanceModule: React.FC = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS'>('OVERVIEW');
    const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
    const [runway, setRunway] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    // Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTx, setNewTx] = useState({ description: '', category: 'Software', amount: '', type: 'EXPENSE' as 'EXPENSE' | 'INCOME' });

    useEffect(() => {
        getFinancialMetrics().then(setMetrics);
        getRunwayData().then(setRunway);
        getTransactions().then(setTransactions);
    }, []);

    const handleAddTransaction = async () => {
        if (!newTx.description || !newTx.amount) return;
        const tx: Transaction = {
            id: Date.now().toString(),
            description: newTx.description,
            category: newTx.category,
            amount: Number(newTx.amount),
            type: newTx.type,
            date: new Date().toISOString().split('T')[0]
        };
        const updated = await addTransaction(tx);
        setTransactions(updated);
        setIsAddOpen(false);
        setNewTx({ description: '', category: 'Software', amount: '', type: 'EXPENSE' });
        addToast('success', 'Transaction Added');
    };

    const handleDeleteTransaction = (tx: Transaction) => {
        if(confirm(`Delete ${tx.description}?`)) {
            const updated = db.deleteItem('finance_transactions', tx.id, []);
            setTransactions(updated);
            addToast('success', 'Transaction Deleted');
        }
    };

    const columns: Column<Transaction>[] = [
        { key: 'date', label: 'Date', sortable: true },
        { key: 'description', label: 'Description', sortable: true },
        { 
            key: 'category', 
            label: 'Category', 
            render: (tx) => <span className="px-2 py-1 rounded bg-neutral-800 text-xs">{tx.category}</span>
        },
        { 
            key: 'amount', 
            label: 'Amount', 
            sortable: true,
            render: (tx) => (
                <span className={`font-mono ${tx.type === 'INCOME' ? 'text-green-400' : 'text-neutral-300'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Finance & Operations</h1>
                <Button onClick={() => setIsAddOpen(true)}><Icons.Plus size={16} className="mr-2"/> Add Transaction</Button>
            </div>

            <div className="flex border-b border-neutral-800">
                <button onClick={() => setActiveTab('OVERVIEW')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'OVERVIEW' ? 'border-primary-600 text-white' : 'border-transparent text-neutral-400'}`}>Overview</button>
                <button onClick={() => setActiveTab('TRANSACTIONS')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'TRANSACTIONS' ? 'border-primary-600 text-white' : 'border-transparent text-neutral-400'}`}>Transactions</button>
            </div>

            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Top Cards */}
                    {runway && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card id="finance-runway-card">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-900/20 text-red-500 rounded-lg">
                                        <Icons.Flame size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-400">Monthly Burn</p>
                                        <h3 className="text-2xl font-bold text-white">${runway.burnRate.toLocaleString()}</h3>
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-900/20 text-green-500 rounded-lg">
                                        <Icons.Wallet size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-400">Cash on Hand</p>
                                        <h3 className="text-2xl font-bold text-white">${runway.cashOnHand.toLocaleString()}</h3>
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-900/20 text-blue-500 rounded-lg">
                                        <Icons.Hourglass size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-400">Runway</p>
                                        <h3 className="text-2xl font-bold text-white">{runway.runwayMonths} Months</h3>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Revenue vs Expenses">
                            <div className="h-[300px] w-full min-h-[300px]">
                                <ResponsiveContainer>
                                    <BarChart data={metrics}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="month" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} cursor={{fill: '#262626'}} />
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#dc2626" radius={[4, 4, 0, 0]} name="Revenue" />
                                        <Bar dataKey="expenses" fill="#404040" radius={[4, 4, 0, 0]} name="Expenses" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title="Cash Balance Trend">
                            <div className="h-[300px] w-full min-h-[300px]">
                                <ResponsiveContainer>
                                    <LineChart data={metrics}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="month" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                        <Line type="monotone" dataKey="cashBalance" stroke="#22c55e" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'TRANSACTIONS' && (
                <div className="animate-fade-in">
                    <CRUDTable 
                        data={transactions} 
                        columns={columns} 
                        onDelete={handleDeleteTransaction}
                        searchKey="description"
                        actionLabel="Add Transaction"
                        onAdd={() => setIsAddOpen(true)}
                    />
                </div>
            )}

            {/* Add Transaction Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Record Transaction</h3>
                            <button onClick={() => setIsAddOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} placeholder="e.g. Server Costs" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1">Amount</label>
                                    <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1">Type</label>
                                    <select className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as any})}>
                                        <option value="EXPENSE">Expense</option>
                                        <option value="INCOME">Income</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Category</label>
                                <select className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})}>
                                    <option>Software</option>
                                    <option>Office</option>
                                    <option>Revenue</option>
                                    <option>Marketing</option>
                                    <option>Contractors</option>
                                </select>
                            </div>
                            <Button className="w-full" onClick={handleAddTransaction}>Add Transaction</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};