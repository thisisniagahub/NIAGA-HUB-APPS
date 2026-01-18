
import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getEntitySummary, getAvailableEntities, EntityType, EntitySummary } from '../../services/relationshipService';

interface EntityLinkerProps {
    linkedType: EntityType;
    linkedId?: string | number;
    onLink: (targetId: string | number) => void;
    onUnlink?: () => void;
    placeholder?: string;
    className?: string;
}

export const EntityLinker: React.FC<EntityLinkerProps> = ({ 
    linkedType, 
    linkedId, 
    onLink, 
    onUnlink,
    placeholder = "Link Item",
    className = ""
}) => {
    const [linkedItem, setLinkedItem] = useState<EntitySummary | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState<EntitySummary[]>([]);

    useEffect(() => {
        if (linkedId) {
            const summary = getEntitySummary(linkedType, linkedId);
            setLinkedItem(summary);
        } else {
            setLinkedItem(null);
        }
    }, [linkedId, linkedType]);

    const handleOpen = () => {
        setOptions(getAvailableEntities(linkedType));
        setIsOpen(true);
    };

    const handleSelect = (item: EntitySummary) => {
        onLink(item.id);
        setLinkedItem(item);
        setIsOpen(false);
        setSearch('');
    };

    const filteredOptions = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

    const getIcon = (type: EntityType) => {
        switch(type) {
            case 'FEATURE': return <Icons.Box size={14} />;
            case 'IDEA': return <Icons.Lightbulb size={14} />;
            case 'GOAL': return <Icons.Target size={14} />;
            default: return <Icons.Link size={14} />;
        }
    };

    if (linkedItem) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-primary-900/20 border border-primary-900/50 rounded-full text-xs font-medium text-primary-300 group ${className}`}>
                {getIcon(linkedType)}
                <span className="truncate max-w-[150px]">{linkedItem.name}</span>
                {onUnlink && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onUnlink(); }} 
                        className="ml-1 text-primary-500 hover:text-white transition-colors"
                    >
                        <Icons.X size={12} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`relative inline-block ${className}`}>
            <button 
                onClick={(e) => { e.stopPropagation(); handleOpen(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 border border-dashed border-neutral-700 rounded-full hover:text-white hover:border-neutral-500 transition-all bg-transparent"
            >
                <Icons.Link size={12} />
                {placeholder}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2 border-b border-neutral-800 flex items-center gap-2">
                            <Icons.Search size={12} className="text-neutral-500" />
                            <input 
                                autoFocus
                                type="text" 
                                className="w-full bg-transparent text-xs text-white outline-none placeholder-neutral-600" 
                                placeholder={`Search ${linkedType.toLowerCase()}s...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1">
                            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                                <button 
                                    key={opt.id} 
                                    onClick={() => handleSelect(opt)}
                                    className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 rounded flex items-center gap-2 truncate"
                                >
                                    {getIcon(opt.type)}
                                    {opt.name}
                                </button>
                            )) : (
                                <div className="p-3 text-center text-xs text-neutral-500">No results found</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
