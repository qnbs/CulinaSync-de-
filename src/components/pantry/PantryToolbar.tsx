import React from 'react';
import { Search, ArrowUpDown, ListTree, Filter, CheckSquare, X } from 'lucide-react';
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
        <div className="sticky top-[4.5rem] z-30 backdrop-blur-xl bg-zinc-950/70 border border-white/10 rounded-xl p-2 shadow-2xl mb-6">
            <div className="flex flex-col lg:flex-row gap-2">
                {/* Search Bar */}
                <div className="relative flex-grow group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--color-accent-400)] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Suchen..."
                        value={searchTerm}
                        ref={searchInputRef}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-10 text-sm text-zinc-200 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent focus:bg-zinc-900 outline-none transition-all placeholder-zinc-600"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Controls Group */}
                <div className="flex overflow-x-auto gap-2 pb-1 lg:pb-0 no-scrollbar">
                    {/* Filter */}
                    <div className="relative flex-shrink-0">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                            <Filter size={16} />
                        </div>
                        <select 
                            value={expiryFilter} 
                            onChange={e => setExpiryFilter(e.target.value as any)} 
                            className="appearance-none h-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-8 text-sm text-zinc-300 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none cursor-pointer transition-all"
                        >
                            <option value="all">Alle Status</option>
                            <option value="nearing">Läuft bald ab</option>
                            <option value="expired">Bereits abgelaufen</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="relative flex-shrink-0">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                            <ArrowUpDown size={16} />
                        </div>
                        <select 
                            value={sortOrder} 
                            onChange={e => setSortOrder(e.target.value)} 
                            className="appearance-none h-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-8 text-sm text-zinc-300 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none cursor-pointer transition-all"
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="expiryDate">Ablaufdatum</option>
                            <option value="updatedAt">Zuletzt geändert</option>
                            <option value="createdAt">Neu hinzugefügt</option>
                        </select>
                    </div>

                    <div className="w-px bg-zinc-800 mx-1 my-1"></div>

                    {/* Toggles */}
                    <button 
                        onClick={() => setIsGrouped(!isGrouped)} 
                        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all flex-shrink-0 ${isGrouped ? 'bg-[var(--color-accent-500)]/10 border-[var(--color-accent-500)] text-[var(--color-accent-400)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`} 
                        title={isGrouped ? "Gruppierung aufheben" : "Nach Kategorie gruppieren"}
                    >
                        <ListTree size={20} />
                    </button>
                    
                    <button 
                        onClick={toggleSelectMode} 
                        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all flex-shrink-0 ${isSelectMode ? 'bg-[var(--color-accent-500)] text-zinc-900 border-[var(--color-accent-500)] shadow-[0_0_15px_var(--color-accent-glow)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`} 
                        title="Auswahlmodus"
                    >
                        <CheckSquare size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};