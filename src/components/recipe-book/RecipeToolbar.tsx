import React, { useState } from 'react';
import { Search, Filter, X, ArrowUpDown, Star, CheckCircle2, Leaf } from 'lucide-react';

interface FilterOptions {
    courses: string[];
    cuisines: string[];
    mainIngredients: string[];
    difficulties: string[];
    diets: string[];
}

interface RecipeToolbarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement>;
    
    sortBy: string;
    setSortBy: (sort: string) => void;
    
    filters: {
        course: string;
        cuisine: string;
        mainIngredient: string;
        difficulty: string;
        diet: string;
        favoritesOnly: boolean;
        pantryReady: boolean;
    };
    
    setFilters: (filters: any) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
    filterOptions: FilterOptions;
}

export const RecipeToolbar: React.FC<RecipeToolbarProps> = ({
    searchTerm, setSearchTerm, searchInputRef,
    sortBy, setSortBy,
    filters, setFilters, clearFilters, hasActiveFilters, filterOptions
}) => {
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const toggleFilter = (key: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectChange = (key: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="sticky top-[4.5rem] z-30 space-y-2">
            <div className="backdrop-blur-xl bg-zinc-950/80 border border-white/10 rounded-xl p-2 shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-2">
                    {/* Search */}
                    <div className="relative flex-grow group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--color-accent-400)] transition-colors" size={20} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Rezepte durchsuchen..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-10 text-sm text-zinc-200 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none transition-all"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"><X size={16} /></button>
                        )}
                    </div>

                    {/* Actions Group */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                        {/* Quick Toggles */}
                        <button 
                            onClick={() => toggleFilter('pantryReady')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${filters.pantryReady ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900'}`}
                        >
                            <CheckCircle2 size={16} /> Kochbereit
                        </button>

                        <button 
                            onClick={() => toggleFilter('favoritesOnly')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${filters.favoritesOnly ? 'bg-[var(--color-accent-500)]/10 border-[var(--color-accent-500)]/50 text-[var(--color-accent-400)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900'}`}
                        >
                            <Star size={16} className={filters.favoritesOnly ? "fill-current" : ""} /> Favoriten
                        </button>
                        
                        <div className="w-px bg-zinc-800 mx-1 my-1"></div>

                         {/* Filter Toggle */}
                         <button 
                            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${isFilterPanelOpen || (hasActiveFilters && !filters.pantryReady && !filters.favoritesOnly) ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900'}`}
                        >
                            <Filter size={16} /> Filter
                        </button>

                        {/* Sort */}
                         <div className="relative flex-shrink-0">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                                <ArrowUpDown size={16} />
                            </div>
                            <select 
                                value={sortBy} 
                                onChange={e => setSortBy(e.target.value)} 
                                className="appearance-none h-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 pr-8 text-sm text-zinc-300 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none cursor-pointer transition-all"
                            >
                                <option value="newest">Neueste</option>
                                <option value="favorites">Favoriten</option>
                                <option value="a-z">A-Z</option>
                                <option value="z-a">Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Extended Filter Panel */}
            {isFilterPanelOpen && (
                <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 page-fade-in">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Gang</label>
                        <select value={filters.course} onChange={e => handleSelectChange('course', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-300 focus:ring-2 focus:ring-[var(--color-accent-500)] outline-none">
                            <option value="">Alle</option>
                            {filterOptions.courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Küche</label>
                        <select value={filters.cuisine} onChange={e => handleSelectChange('cuisine', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-300 focus:ring-2 focus:ring-[var(--color-accent-500)] outline-none">
                            <option value="">Alle</option>
                            {filterOptions.cuisines.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Hauptzutat</label>
                        <select value={filters.mainIngredient} onChange={e => handleSelectChange('mainIngredient', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-300 focus:ring-2 focus:ring-[var(--color-accent-500)] outline-none">
                            <option value="">Alle</option>
                            {filterOptions.mainIngredients.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Schwierigkeit</label>
                        <select value={filters.difficulty} onChange={e => handleSelectChange('difficulty', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-300 focus:ring-2 focus:ring-[var(--color-accent-500)] outline-none">
                            <option value="">Alle</option>
                            {filterOptions.difficulties.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Ernährung</label>
                        <select value={filters.diet} onChange={e => handleSelectChange('diet', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-300 focus:ring-2 focus:ring-[var(--color-accent-500)] outline-none">
                            <option value="">Alle</option>
                            {filterOptions.diets.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <div className="col-span-full flex justify-end pt-2 border-t border-zinc-800 mt-2">
                             <button onClick={clearFilters} className="text-xs font-bold text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)] flex items-center gap-1">
                                <X size={12} /> ALLE FILTER ZURÜCKSETZEN
                             </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};