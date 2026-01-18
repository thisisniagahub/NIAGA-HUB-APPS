
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import * as Icons from 'lucide-react';
import { getFeatures, updateFeatureStatus, addFeature, updateFeatureDetails, deleteFeature } from '../services/productService';
import { getSalesDeals } from '../services/salesService'; // Import for Relationship UI
import { ProductFeature, SalesDeal } from '../types';
import { EntityLinker } from '../components/ui/EntityLinker';
import { db } from '../services/localStorageDb';
import { CRUDTable, Column } from '../components/ui/CRUDTable';
import { exportToCSV } from '../services/csvService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../context/ToastContext';

export const ProductModule: React.FC = () => {
    const { addToast } = useToast();
    const [features, setFeatures] = useState<ProductFeature[]>([]);
    const [deals, setDeals] = useState<SalesDeal[]>([]); // For Relationship UI
    const [draggedId, setDraggedId] = useState<string | number | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
    const [activeTab, setActiveTab] = useState<'BOARD' | 'LIST' | 'ANALYTICS'>('BOARD');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [formData, setFormData] = useState({ name: '', priority: 'Medium' });

    useEffect(() => {
        getFeatures().then(setFeatures);
        getSalesDeals().then(setDeals);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleUpdateStatus = async (id: string | number, newStatus: ProductFeature['status']) => {
        const updated = await updateFeatureStatus(id, newStatus);
        setFeatures(updated);
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ name: '', priority: 'Medium' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (e: React.MouseEvent, feature: ProductFeature) => {
        e.stopPropagation();
        setActiveMenuId(null);
        setEditingId(feature.id);
        setFormData({ name: feature.name, priority: feature.priority });
        setIsModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string | number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this feature?')) {
            const updated = await deleteFeature(id);
            setFeatures(updated);
            addToast('success', 'Feature Deleted');
        }
    };

    const handleBulkDelete = (ids: string[]) => {
        if (confirm(`Delete ${ids.length} features?`)) {
            let updated = features;
            ids.forEach(id => {
                updated = db.deleteItem('product_features', id, []);
            });
            setFeatures(updated);
            addToast('success', `${ids.length} features deleted`);
        }
    };

    const handleExport = (ids: string[]) => {
        const data = features.filter(f => ids.includes(String(f.id)));
        exportToCSV(data, 'product_roadmap');
        addToast('success', 'Export downloaded');
    };

    const handleSave = async () => {
        if (!formData.name) return;
        
        if (editingId) {
            // Update
            const updated = await updateFeatureDetails(editingId, { 
                name: formData.name, 
                priority: formData.priority as any 
            });
            setFeatures(updated);
        } else {
            // Create
            const feature: ProductFeature = {
                id: Date.now(),
                name: formData.name,
                status: 'Backlog',
                priority: formData.priority as any
            };
            const updated = await addFeature(feature);
            setFeatures(updated);
        }
        setIsModalOpen(false);
    };

    const handleLinkGoal = (featureId: string | number, goalId: string | number) => {
        const updatedFeatures = db.updateItem('product_features', String(featureId), { linkedGoalId: String(goalId) }, []);
        setFeatures(updatedFeatures);
    };

    const handleUnlinkGoal = (featureId: string | number) => {
        const updatedFeatures = db.updateItem('product_features', String(featureId), { linkedGoalId: undefined }, []);
        setFeatures(updatedFeatures);
    };

    // --- Drag & Drop Handlers ---

    const handleDragStart = (e: React.DragEvent, id: string | number) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(id));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: ProductFeature['status']) => {
        e.preventDefault();
        const id = draggedId; 
        
        if (id !== null) {
            handleUpdateStatus(id, status);
            setDraggedId(null);
        }
    };

    const listColumns: Column<ProductFeature>[] = [
        { key: 'name', label: 'Feature', sortable: true, filterable: true, filterType: 'text' },
        { 
            key: 'status', 
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: ['Backlog', 'In Progress', 'Done'],
            render: (f) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    f.status === 'Done' ? 'bg-green-900/20 text-green-400' : 
                    f.status === 'In Progress' ? 'bg-blue-900/20 text-blue-400' : 
                    'bg-neutral-800 text-neutral-400'
                }`}>
                    {f.status}
                </span>
            )
        },
        { 
            key: 'priority', 
            label: 'Priority',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: ['High', 'Medium', 'Low'],
            render: (f) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    f.priority === 'High' ? 'text-red-400' :
                    f.priority === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                    {f.priority}
                </span>
            )
        },
        {
            key: 'linkedGoalId',
            label: 'Strategy Link',
            render: (f) => (
                <EntityLinker
                    linkedType="GOAL"
                    linkedId={f.linkedGoalId}
                    onLink={(id) => handleLinkGoal(f.id, id)}
                    onUnlink={() => handleUnlinkGoal(f.id)}
                    placeholder="Link Goal"
                />
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Product Roadmap</h1>
                    <p className="text-neutral-400">Plan, track, and ship features.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                        <button onClick={() => setActiveTab('BOARD')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'BOARD' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.Kanban size={14}/></button>
                        <button onClick={() => setActiveTab('LIST')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'LIST' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.List size={14}/></button>
                        <button onClick={() => setActiveTab('ANALYTICS')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeTab === 'ANALYTICS' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}><Icons.BarChart2 size={14}/></button>
                    </div>
                    <Button onClick={handleOpenAdd}><Icons.Plus size={16} className="mr-2"/> New Feature</Button>
                </div>
            </div>

            {activeTab === 'BOARD' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="product-board">
                    {['Backlog', 'In Progress', 'Done'].map((status) => (
                        <div 
                            key={status} 
                            className={`bg-neutral-900/30 rounded-xl border p-4 min-h-[500px] transition-all duration-200 ${
                                draggedId !== null 
                                    ? 'border-dashed border-neutral-700 bg-neutral-900/50' 
                                    : 'border-neutral-800'
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status as ProductFeature['status'])}
                        >
                            <div className="flex items-center justify-between mb-4 pointer-events-none">
                                <h3 className="font-semibold text-neutral-300 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        status === 'Done' ? 'bg-green-500' : 
                                        status === 'In Progress' ? 'bg-blue-500' : 'bg-neutral-500'
                                    }`}/>
                                    {status}
                                </h3>
                                <span className="text-xs bg-neutral-800 text-neutral-500 px-2 py-1 rounded">
                                    {features.filter(f => f.status === status).length}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                {features.filter(f => f.status === status).map(feature => {
                                    // Find deals linked to this feature
                                    const requestingDeals = deals.filter(d => String(d.linkedFeatureId) === String(feature.id));
                                    
                                    return (
                                        <div 
                                            key={feature.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, feature.id)}
                                            onDragEnd={() => setDraggedId(null)}
                                            className={`relative p-4 bg-neutral-900 border border-neutral-800 rounded-lg cursor-move shadow-sm group animate-fade-in transition-all active:cursor-grabbing hover:border-neutral-600 ${
                                                draggedId === feature.id ? 'opacity-40 scale-95 border-primary-500 border-dashed' : 'opacity-100'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm font-medium text-white pr-6">{feature.name}</span>
                                                
                                                {/* Action Menu Trigger */}
                                                <button 
                                                    className="text-neutral-600 hover:text-white transition-colors absolute top-3 right-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === feature.id ? null : feature.id);
                                                    }}
                                                >
                                                    <Icons.MoreHorizontal size={14} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeMenuId === feature.id && (
                                                    <div className="absolute top-8 right-3 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20 w-32 overflow-hidden flex flex-col animate-fade-in">
                                                        <button 
                                                            onClick={(e) => handleOpenEdit(e, feature)}
                                                            className="px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-700 flex items-center gap-2"
                                                        >
                                                            <Icons.Edit2 size={12} /> Edit
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleDelete(e, feature.id)}
                                                            className="px-3 py-2 text-left text-xs text-red-400 hover:bg-neutral-700 flex items-center gap-2"
                                                        >
                                                            <Icons.Trash2 size={12} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                                                    feature.priority === 'High' ? 'border-red-900 text-red-400 bg-red-900/10' :
                                                    feature.priority === 'Medium' ? 'border-yellow-900 text-yellow-400 bg-yellow-900/10' :
                                                    'border-blue-900 text-blue-400 bg-blue-900/10'
                                                }`}>
                                                    {feature.priority}
                                                </span>
                                            </div>

                                            {/* Linker Section */}
                                            <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                                                {requestingDeals.length > 0 ? (
                                                    <div className="flex -space-x-2">
                                                        {requestingDeals.map((d, i) => (
                                                            <div key={d.id} className="w-5 h-5 rounded-full bg-primary-900 border border-neutral-800 flex items-center justify-center text-[8px] text-white" title={`Requested by ${d.company}`}>
                                                                {d.company.charAt(0)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <div />}
                                                
                                                <EntityLinker
                                                    linkedType="GOAL"
                                                    linkedId={feature.linkedGoalId}
                                                    onLink={(id) => handleLinkGoal(feature.id, id)}
                                                    onUnlink={() => handleUnlinkGoal(feature.id)}
                                                    placeholder="Link Strategy"
                                                    className="text-[10px]"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                <button 
                                    onClick={handleOpenAdd}
                                    className="w-full py-3 text-xs border border-dashed border-neutral-800 text-neutral-500 rounded-lg hover:bg-neutral-800 hover:text-neutral-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Icons.Plus size={14} /> Add Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'LIST' && (
                <Card className="animate-fade-in">
                    <CRUDTable 
                        data={features}
                        columns={listColumns}
                        onEdit={(f) => { setEditingId(f.id); setFormData({ name: f.name, priority: f.priority }); setIsModalOpen(true); }}
                        onDelete={(f) => { if(confirm('Delete?')) { deleteFeature(f.id).then(setFeatures); addToast('success', 'Deleted'); } }}
                        searchKey="name"
                        enableSelection
                        onBulkDelete={handleBulkDelete}
                        onExport={handleExport}
                    />
                </Card>
            )}

            {activeTab === 'ANALYTICS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <Card title="Feature Status Breakdown">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Backlog', value: features.filter(f => f.status === 'Backlog').length },
                                    { name: 'In Progress', value: features.filter(f => f.status === 'In Progress').length },
                                    { name: 'Done', value: features.filter(f => f.status === 'Done').length },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                    <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card title="Priority Distribution">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'High', value: features.filter(f => f.priority === 'High').length },
                                            { name: 'Medium', value: features.filter(f => f.priority === 'Medium').length },
                                            { name: 'Low', value: features.filter(f => f.priority === 'Low').length },
                                        ].filter(d => d.value > 0)}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#ef4444" />
                                        <Cell fill="#eab308" />
                                        <Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* Feature Modal (Create/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Feature' : 'New Feature'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Feature Name</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. 2FA Authentication" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Priority</label>
                                <select className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                            </div>
                            <Button className="w-full" onClick={handleSave}>{editingId ? 'Save Changes' : 'Create Feature'}</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
