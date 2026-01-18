
import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Workspace } from '../../types';
import { getWorkspaces, createWorkspace, switchWorkspace } from '../../services/workspaceService';
import { useToast } from '../../context/ToastContext';
import { Presence } from '../ui/Presence';

export const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
    const { addToast } = useToast();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [isWsMenuOpen, setIsWsMenuOpen] = useState(false);

    useEffect(() => {
        getWorkspaces().then(list => {
            setWorkspaces(list);
            const savedId = localStorage.getItem('current_workspace');
            const active = list.find(w => w.id === savedId) || list[0];
            setCurrentWorkspace(active);
        });
    }, []);

    const handleSwitchWorkspace = async (ws: Workspace) => {
        await switchWorkspace(ws.id);
        setCurrentWorkspace(ws);
        setIsWsMenuOpen(false);
        addToast('success', 'Workspace Switched', `Active: ${ws.name}`);
    };

    const handleCreateWorkspace = async () => {
        const name = prompt("Workspace Name:");
        if (name) {
            const updated = await createWorkspace(name);
            setWorkspaces(updated);
            handleSwitchWorkspace(updated[updated.length-1]);
        }
    };

    return (
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-neutral-400 mt-2">{subtitle}</p>}
            </div>
            
            <div className="flex items-center gap-6">
                <Presence />
                
                <div className="h-8 w-[1px] bg-neutral-800"></div>

                <div className="relative">
                    <button 
                        onClick={() => setIsWsMenuOpen(!isWsMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 border border-neutral-700 transition-colors"
                    >
                        <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-[10px] font-bold">
                            {currentWorkspace?.name.charAt(0)}
                        </div>
                        {currentWorkspace?.name}
                        <Icons.ChevronDown size={14} className="text-neutral-500" />
                    </button>

                    {isWsMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                            <div className="p-2 border-b border-neutral-800 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Switch Workspace</div>
                            {workspaces.map(ws => (
                                <button 
                                    key={ws.id} 
                                    onClick={() => handleSwitchWorkspace(ws)}
                                    className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex justify-between items-center"
                                >
                                    {ws.name}
                                    {ws.id === currentWorkspace?.id && <Icons.Check size={14} className="text-primary-500" />}
                                </button>
                            ))}
                            <div className="p-2 border-t border-neutral-800">
                                <button onClick={handleCreateWorkspace} className="w-full flex items-center gap-2 px-2 py-2 text-sm text-primary-400 hover:bg-neutral-800 rounded-lg">
                                    <Icons.Plus size={14} /> Create New
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
