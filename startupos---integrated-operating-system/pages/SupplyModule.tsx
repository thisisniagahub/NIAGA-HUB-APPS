
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getInventory, addInventoryItem } from '../services/phase2Services';
import { InventoryItem } from '../types';

export const SupplyModule: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [showIntake, setShowIntake] = useState(false);
    const [newItem, setNewItem] = useState({ sku: '', name: '', qty: 0 });

    useEffect(() => { getInventory().then(setInventory); }, []);

    const handleReceive = async () => {
        if (!newItem.sku) return;
        const added: InventoryItem = {
            id: Date.now().toString(),
            sku: newItem.sku,
            name: newItem.name,
            stockLevel: Number(newItem.qty),
            reorderPoint: 5,
            status: 'OK'
        };
        const updated = await addInventoryItem(added);
        setInventory(updated);
        setShowIntake(false);
        setNewItem({ sku: '', name: '', qty: 0 });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Supply Chain</h1>
                    <p className="text-neutral-400">Inventory tracking and logistics.</p>
                </div>
                <Button id="supply-add-btn" onClick={() => setShowIntake(true)}><Icons.PackagePlus size={16} className="mr-2"/> Receive Stock</Button> {/* Targeted by Tutorial */}
            </div>

            <Card>
                <table className="w-full text-left text-sm">
                    <thead className="text-neutral-500 border-b border-neutral-800">
                        <tr>
                            <th className="pb-3 font-medium">SKU</th>
                            <th className="pb-3 font-medium">Item Name</th>
                            <th className="pb-3 font-medium text-right">Stock Level</th>
                            <th className="pb-3 font-medium text-right">Reorder Point</th>
                            <th className="pb-3 font-medium pl-6">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-neutral-300">
                        {inventory.map(item => (
                            <tr key={item.id} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/30 transition-colors">
                                <td className="py-4 font-mono text-neutral-500">{item.sku}</td>
                                <td className="py-4 font-medium text-white">{item.name}</td>
                                <td className="py-4 text-right font-mono">{item.stockLevel}</td>
                                <td className="py-4 text-right font-mono text-neutral-500">{item.reorderPoint}</td>
                                <td className="py-4 pl-6">
                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                                        ${item.status === 'OK' ? 'bg-green-900/20 text-green-400' : 
                                          item.status === 'LOW' ? 'bg-yellow-900/20 text-yellow-400' : 
                                          'bg-red-900/20 text-red-400'}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Modal */}
            {showIntake && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Receive Inventory</h3>
                            <button onClick={() => setShowIntake(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" placeholder="SKU" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} />
                            <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                            <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" type="number" placeholder="Quantity" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: Number(e.target.value)})} />
                            <Button className="w-full" onClick={handleReceive}>Add to Stock</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
