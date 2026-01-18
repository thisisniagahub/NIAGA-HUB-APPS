
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getDocuments, addDocument, deleteDocument } from '../services/legalService';
import { LegalDoc } from '../types';
import { CRUDTable, Column } from '../components/ui/CRUDTable';
import { useToast } from '../context/ToastContext';

export const LegalModule: React.FC = () => {
    const { addToast } = useToast();
    const [docs, setDocs] = useState<LegalDoc[]>([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: '', type: 'Contract' });

    useEffect(() => {
        getDocuments().then(setDocs);
    }, []);

    const handleUpload = async () => {
        if (!newDoc.title) return;
        const doc: LegalDoc = {
            id: Date.now().toString(),
            title: newDoc.title,
            type: newDoc.type,
            status: 'DRAFT',
            lastModified: 'Just now'
        };
        const updated = await addDocument(doc);
        setDocs(updated);
        setIsUploadOpen(false);
        setNewDoc({ title: '', type: 'Contract' });
        addToast('success', 'Document Added');
    };

    const handleDelete = async (doc: LegalDoc) => {
        if(confirm('Delete document?')) {
            const updated = await deleteDocument(doc.id);
            setDocs(updated);
            addToast('success', 'Document Deleted');
        }
    };

    const columns: Column<LegalDoc>[] = [
        { 
            key: 'title', 
            label: 'Document Name', 
            sortable: true, 
            render: (doc) => (
                <div className="flex items-center gap-3">
                    <Icons.FileText className="text-neutral-500" size={18} />
                    <span className="font-medium text-white">{doc.title}</span>
                </div>
            )
        },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'lastModified', label: 'Last Modified' },
        { 
            key: 'status', 
            label: 'Status',
            render: (doc) => <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400">{doc.status}</span>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Legal & Compliance</h1>
                    <p className="text-neutral-400">Streamlined incorporation and document management.</p>
                </div>
                <Button variant="outline" onClick={() => setIsUploadOpen(true)}><Icons.Upload size={16} className="mr-2"/> Upload Document</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-900/30 to-black border-indigo-900/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Icons.Globe size={120} />
                        </div>
                        <div className="relative z-10 p-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500 rounded text-white">
                                    <Icons.Scale size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Stripe Atlas Partnership</h2>
                            </div>
                            <p className="text-lg text-neutral-300 max-w-lg mb-6 leading-relaxed">
                                Form your company in days, not weeks. We've partnered with Stripe Atlas to provide seamless Delaware C-Corp incorporation.
                            </p>
                            <div className="flex gap-4">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6">
                                    Start Incorporation ($450 off) <Icons.ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card title="Document Vault">
                        <CRUDTable 
                            data={docs} 
                            columns={columns} 
                            onDelete={handleDelete}
                            searchKey="title"
                            actionLabel="New Document"
                            onAdd={() => setIsUploadOpen(true)}
                        />
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card title="Compliance Checklist">
                         <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-green-500"><Icons.CheckCircle2 size={18} /></div>
                                <div>
                                    <h4 className="text-sm text-white font-medium">EIN Acquired</h4>
                                    <p className="text-xs text-neutral-500">Tax ID registered with IRS.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-green-500"><Icons.CheckCircle2 size={18} /></div>
                                <div>
                                    <h4 className="text-sm text-white font-medium">83(b) Election Filed</h4>
                                    <p className="text-xs text-neutral-500">Within 30 days of founding.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-yellow-500"><Icons.Circle size={18} /></div>
                                <div>
                                    <h4 className="text-sm text-white font-medium">State Qualification</h4>
                                    <p className="text-xs text-neutral-500">Register as foreign entity in NY.</p>
                                </div>
                            </div>
                         </div>
                    </Card>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Upload Document</h3>
                            <button onClick={() => setIsUploadOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Document Name</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} placeholder="e.g. Service Agreement" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Type</label>
                                <select className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newDoc.type} onChange={e => setNewDoc({...newDoc, type: e.target.value})}>
                                    <option>Contract</option>
                                    <option>Agreement</option>
                                    <option>Policy</option>
                                    <option>Filing</option>
                                </select>
                            </div>
                            <Button className="w-full" onClick={handleUpload}>Save to Vault</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
