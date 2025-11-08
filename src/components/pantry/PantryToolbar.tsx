import React from 'react';
import { Search, ArrowUpDown, ListTree, Filter, CheckSquare } from 'lucide-react';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';

export const PantryToolbar = () => {
    const {
        searchTerm,
        setSearchTerm,
        searchInputRef,
        expiryFilter,
        setExpiryFilter,
        sortOrder,
        setSortOrder,
        isGrouped,
        setIsGrouped,
        isSelectMode,
        toggleSelectMode,
    } = usePantryManagerContext();

    return (
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input
                    type="text"
                    placeholder="Vorratskammer durchsuchen..."
                    value={searchTerm}
                    ref={searchInputRef}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 pl-10 focus:ring-2 focus:ring-[var(--color-accent-500)]"
                />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <div className="relative">
                    <select value={expiryFilter} onChange={e => setExpiryFilter(e.target.value as any)} className="appearance-none w-full md:w-auto bg-zinc-800 border-zinc-700 rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-[var(--color-accent-500)]">
                        <option value="all">Alle</option>
                        <option value="nearing">Läuft bald ab</option>
                        <option value="expired">Abgelaufen</option>
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="appearance-none w-full md:w-auto bg-zinc-800 border-zinc-700 rounded-md py-2 pl-3 pr-8 focus:ring-2 focus:ring-[var(--color-accent-500)]">
                        <option value="name">Name (A-Z)</option>
                        <option value="expiryDate">Ablaufdatum</option>
                        <option value="updatedAt">Zuletzt geändert</option>
                        <option value="createdAt">Hinzugefügt</option>
                    </select>
                    <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                </div>
                <button onClick={() => setIsGrouped(!isGrouped)} className={`p-2 rounded-md transition-colors ${isGrouped ? 'bg-[var(--color-accent-500)] text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title="Nach Kategorie gruppieren">
                    <ListTree size={20} />
                </button>
                <button onClick={toggleSelectMode} className={`p-2 rounded-md transition-colors ${isSelectMode ? 'bg-[var(--color-accent-500)] text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title="Auswählen">
                    <CheckSquare size={20} />
                </button>
            </div>
        </div>
    );
};