
import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
    key: keyof T | 'actions';
    label: string;
    render?: (item: T) => React.ReactNode;
    width?: string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date';
    filterOptions?: string[]; // For select type
}

interface CRUDTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    isLoading?: boolean;
    searchKey?: keyof T;
    searchPlaceholder?: string;
    actionLabel?: string;
    onAdd?: () => void;
    enableSelection?: boolean;
    onBulkDelete?: (ids: string[]) => void;
    onExport?: (ids: string[]) => void;
}

export function CRUDTable<T extends { id: string | number }>({ 
    data, 
    columns, 
    onEdit, 
    onDelete, 
    isLoading,
    searchKey,
    searchPlaceholder = "Search...",
    actionLabel,
    onAdd,
    enableSelection,
    onBulkDelete,
    onExport
}: CRUDTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof T, direction: 'asc' | 'desc' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Advanced Filtering State
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setSelectedIds([]);
    }, [data]);

    const handleSort = (key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredData.map(item => String(item.id)));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredData = useMemo(() => {
        let items = [...data];
        
        // 1. Full Text Search
        if (search && searchKey) {
            items = items.filter(item => 
                String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
            );
        }

        // 2. Column Filters
        Object.keys(filters).forEach(key => {
            const filterValue = filters[key].toLowerCase();
            if (filterValue) {
                items = items.filter(item => {
                    const itemValue = String(item[key as keyof T] || '').toLowerCase();
                    return itemValue.includes(filterValue);
                });
            }
        });

        // 3. Sorting
        if (sortConfig) {
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return items;
    }, [data, search, searchKey, sortConfig, filters]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Icons.Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        {searchKey && (
                            <>
                                <Icons.Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
                                <input 
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-600 transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </>
                        )}
                    </div>
                    
                    {columns.some(c => c.filterable) && (
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg border ${showFilters ? 'bg-primary-900/20 border-primary-600 text-primary-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                            <Icons.Filter size={18} />
                        </button>
                    )}

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-fade-in bg-primary-900/10 border border-primary-900/30 rounded-lg px-3 py-1.5">
                            <span className="text-xs text-primary-300 font-medium">{selectedIds.length} Selected</span>
                            <div className="h-4 w-[1px] bg-primary-900/30 mx-1"></div>
                            {onBulkDelete && (
                                <button onClick={() => onBulkDelete(selectedIds)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                    <Icons.Trash2 size={12} /> Delete
                                </button>
                            )}
                            {onExport && (
                                <button onClick={() => onExport(selectedIds)} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 ml-2">
                                    <Icons.Download size={12} /> Export
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {onAdd && actionLabel && (
                    <Button onClick={onAdd}><Icons.Plus size={16} className="mr-2" /> {actionLabel}</Button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-900/30 border border-neutral-800 rounded-xl animate-slide-in">
                    {columns.filter(c => c.filterable).map(col => (
                        <div key={String(col.key)}>
                            <label className="block text-xs font-bold text-neutral-500 mb-1">{col.label}</label>
                            {col.filterType === 'select' ? (
                                <select 
                                    className="w-full bg-black border border-neutral-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-primary-600"
                                    value={filters[String(col.key)] || ''}
                                    onChange={(e) => handleFilterChange(String(col.key), e.target.value)}
                                >
                                    <option value="">All</option>
                                    {col.filterOptions?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input 
                                    type={col.filterType === 'date' ? 'date' : 'text'}
                                    className="w-full bg-black border border-neutral-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-primary-600"
                                    placeholder={`Filter by ${col.label.toLowerCase()}...`}
                                    value={filters[String(col.key)] || ''}
                                    onChange={(e) => handleFilterChange(String(col.key), e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex items-end">
                        <button 
                            onClick={() => setFilters({})}
                            className="text-xs text-neutral-500 hover:text-white underline pb-2"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-neutral-500 border-b border-neutral-800 bg-neutral-900/80">
                            <tr>
                                {enableSelection && (
                                    <th className="w-10 px-4 py-3">
                                        <input 
                                            type="checkbox" 
                                            className="rounded bg-neutral-800 border-neutral-700 text-primary-600 focus:ring-primary-600 cursor-pointer"
                                            checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                        />
                                    </th>
                                )}
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        className={`px-4 py-3 font-medium whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''} ${col.width || ''}`}
                                        onClick={() => col.sortable && col.key !== 'actions' && handleSort(col.key as keyof T)}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.label}
                                            {sortConfig?.key === col.key && (
                                                sortConfig.direction === 'asc' ? <Icons.ChevronUp size={14} className="text-primary-500" /> : <Icons.ChevronDown size={14} className="text-primary-500" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {(onEdit || onDelete) && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (enableSelection ? 2 : 1)} className="p-12 text-center text-neutral-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Icons.Search size={24} className="opacity-20" />
                                            <p>No records found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className={`hover:bg-neutral-800/40 transition-colors group ${selectedIds.includes(String(item.id)) ? 'bg-primary-900/5 border-l-2 border-l-primary-500' : 'border-l-2 border-l-transparent'}`}>
                                        {enableSelection && (
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded bg-neutral-800 border-neutral-700 text-primary-600 focus:ring-primary-600 cursor-pointer"
                                                    checked={selectedIds.includes(String(item.id))}
                                                    onChange={(e) => handleSelectRow(String(item.id), e.target.checked)}
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, idx) => (
                                            <td key={idx} className="px-4 py-3 text-neutral-300">
                                                {col.render ? col.render(item) : String(item[col.key as keyof T] || '')}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete) && (
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {onEdit && (
                                                        <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-500 hover:text-white transition-colors">
                                                            <Icons.Edit2 size={14} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button onClick={() => onDelete(item)} className="p-1.5 hover:bg-red-900/20 rounded text-neutral-500 hover:text-red-400 transition-colors">
                                                            <Icons.Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
