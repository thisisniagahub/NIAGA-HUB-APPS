
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import * as Icons from 'lucide-react';
import { getThreads, addThread } from '../services/phase2Services';
import { CommunityThread } from '../types';

export const CommunityModule: React.FC = () => {
    const [threads, setThreads] = useState<CommunityThread[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newThread, setNewThread] = useState({ title: '', tags: '' });

    useEffect(() => { getThreads().then(setThreads); }, []);

    const handleCreate = async () => {
        if (!newThread.title) return;
        const thread: CommunityThread = {
            id: Date.now().toString(),
            title: newThread.title,
            author: 'You',
            replies: 0,
            tags: newThread.tags.split(',').map(t => t.trim()).filter(t => t),
            lastActive: 'Just now'
        };
        const updated = await addThread(thread);
        setThreads(updated);
        setIsModalOpen(false);
        setNewThread({ title: '', tags: '' });
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Community</h1>
                    <p className="text-neutral-400">Forums, feedback, and user engagement.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Moderation</Button>
                    <Button onClick={() => setIsModalOpen(true)}><Icons.MessageSquarePlus size={16} className="mr-2"/> New Post</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {threads.map(thread => (
                        <Card key={thread.id} className="hover:border-primary-600/50 cursor-pointer transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                    <Icons.ChevronUp className="text-neutral-500 hover:text-primary-500" />
                                    <span className="font-bold text-white">{thread.replies * 2}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-white mb-1">{thread.title}</h3>
                                    <div className="flex gap-2 mb-2">
                                        {thread.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-neutral-800 text-neutral-400 text-[10px] rounded-full">#{tag}</span>
                                        ))}
                                    </div>
                                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                                        <span>Posted by <span className="text-primary-400">@{thread.author}</span></span>
                                        <span>•</span>
                                        <span>{thread.lastActive}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Icons.MessageCircle size={10} /> {thread.replies} replies</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                
                <div className="space-y-6">
                    <Card title="Community Health">
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-400">New Members</span>
                                <span className="text-white font-bold">+124</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-400">Active Threads</span>
                                <span className="text-white font-bold">{threads.length}</span>
                            </div>
                         </div>
                    </Card>
                    <Card title="Top Contributors">
                        <div className="space-y-3">
                            {['dev_guru', 'manager_mike', 'sarah_scale'].map((u, i) => (
                                <div key={u} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold">{i+1}</div>
                                    <span className="text-sm text-neutral-300">@{u}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Start New Discussion</h3>
                            <button onClick={() => setIsModalOpen(false)}><Icons.X size={20} className="text-neutral-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Title</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newThread.title} onChange={e => setNewThread({...newThread, title: e.target.value})} placeholder="e.g. Feedback on v2.0" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Tags (comma separated)</label>
                                <input className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-white" value={newThread.tags} onChange={e => setNewThread({...newThread, tags: e.target.value})} placeholder="feedback, feature-request" />
                            </div>
                            <Button className="w-full" onClick={handleCreate}>Post Thread</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
