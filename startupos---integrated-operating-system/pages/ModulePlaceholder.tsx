
import React from 'react';
import { Card } from '../components/ui/Card';
import * as Icons from 'lucide-react';
// Fix: Import as any to bypass "no exported member" type error
import * as Router from 'react-router-dom';
const { useParams } = Router as any;
import { MODULES } from '../constants';

export const ModulePlaceholder: React.FC = () => {
    // This component is generic, but in a real app, we'd look up the current route
    // However, react-router hash router doesn't give us the config directly in the component easily without context.
    // For this scaffold, we will just render a generic "Coming Soon" state.
    
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                <Icons.Construction size={32} className="text-neutral-600" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white">Module In Development</h1>
                <p className="text-neutral-500 mt-2 max-w-md mx-auto">
                    This module is part of the Phase 2 rollout. The infrastructure is ready, but the UI is currently locked for MVP.
                </p>
            </div>
            <div className="flex gap-4">
                <button className="px-6 py-2 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors">
                    Notify Me
                </button>
                <button className="px-6 py-2 border border-neutral-700 text-neutral-300 rounded-lg text-sm hover:bg-neutral-800 transition-colors">
                    View Roadmap
                </button>
            </div>
        </div>
    );
};
