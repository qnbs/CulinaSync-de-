import React, { useState, useEffect, useMemo } from 'react';
import { Search, LucideProps, Milk, BookOpen } from 'lucide-react';
import { db } from '@/services/db';

export interface Command {
    id: string;
    title: string;
    section: string;
    icon: React.FC<LucideProps>;
    action: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
    onGlobalSearch: (type: 'pantry' | 'recipes', term: string) => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    navigateToItem: (page: 'recipes' | 'pantry', id: number) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands, onGlobalSearch, navigateToItem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [dbSearchResults, setDbSearchResults] = useState<{recipes: any[], pantry: any[]}>({recipes: [], pantry: []});

    useEffect(() => {
        if (searchTerm.length > 1) {
            const search = async () => {
                const [recipes, pantry] = await Promise.all([
                    db.recipes.where('recipeTitle').startsWithIgnoreCase(searchTerm).limit(3).toArray(),
                    db.pantry.where('name').startsWithIgnoreCase(searchTerm).limit(3).toArray()
                ]);
                setDbSearchResults({recipes, pantry});
            };
            search();
        } else {
            setDbSearchResults({recipes: [], pantry: []});
        }
    }, [searchTerm]);

    const filteredCommands = useMemo(() => {
        if (!searchTerm) {
            return commands;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return commands.filter(cmd => 
            cmd.title.toLowerCase().includes(lowerCaseSearch) ||
            cmd.section.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchTerm, commands]);
    
    const showGlobalSearch = useMemo(() => filteredCommands.length === 0 && searchTerm.trim().length > 1 && dbSearchResults.recipes.length === 0 && dbSearchResults.pantry.length === 0, [filteredCommands, searchTerm, dbSearchResults]);

    const groupedCommands = useMemo(() => {
        return filteredCommands.reduce((acc, cmd) => {
            if (!acc[cmd.section]) {
                acc[cmd.section] = [];
            }
            acc[cmd.section].push(cmd);
            return acc;
        }, {} as Record<string, Command[]>);
    }, [filteredCommands]);

    const flatCommandList = useMemo(() => {
        let list: any[] = [];
        list = list.concat(dbSearchResults.recipes.map(r => ({ ...r, type: 'recipe' })));
        list = list.concat(dbSearchResults.pantry.map(p => ({ ...p, type: 'pantry' })));
        list = list.concat(Object.values(groupedCommands).flat().map(c => ({...c, type: 'command'})));
        
        if (showGlobalSearch) {
             list.push({ id: 'search-recipes-dynamic', title: `Suche in Rezepten nach: "${searchTerm}"`, action: () => onGlobalSearch('recipes', searchTerm), type: 'global' });
             list.push({ id: 'search-pantry-dynamic', title: `Suche im Vorrat nach: "${searchTerm}"`, action: () => onGlobalSearch('pantry', searchTerm), type: 'global' });
        }
        return list;
    }, [groupedCommands, showGlobalSearch, searchTerm, onGlobalSearch, dbSearchResults]);


    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setActiveIndex(0);
    }, [searchTerm]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % (flatCommandList.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + (flatCommandList.length || 1)) % (flatCommandList.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = flatCommandList[activeIndex];
                if (item) {
                    if (item.type === 'recipe') navigateToItem('recipes', item.id);
                    else if (item.type === 'pantry') navigateToItem('pantry', item.id);
                    else if (item.action) item.action();
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, flatCommandList, onClose, navigateToItem]);
    
    useEffect(() => {
        document.getElementById(`command-item-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (!isOpen) {
        return null;
    }
    
    let currentIndex = 0;

    return (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-24" 
          aria-labelledby="command-palette-title" 
          role="dialog" 
          aria-modal="true"
          onClick={onClose}
        >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

            <div 
                className="relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-2xl mx-4 transform transition-all modal-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center border-b border-zinc-700 p-3">
                    <Search className="h-5 w-5 text-zinc-500 mr-3" />
                    <input
                        type="text"
                        placeholder="Befehl suchen oder Aktion ausführen..."
                        className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                     <div className="ml-3 text-xs text-zinc-500 border border-zinc-600 rounded px-1.5 py-0.5">ESC</div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    { (dbSearchResults.recipes.length > 0 || dbSearchResults.pantry.length > 0) && (
                        <div className="mb-2">
                            <h3 className="text-xs font-semibold text-zinc-500 px-2 my-1">Schnellzugriff</h3>
                            <ul>
                                {dbSearchResults.recipes.map(recipe => {
                                    const itemIndex = currentIndex++;
                                    return (
                                        <li
                                            key={`db-recipe-${recipe.id}`}
                                            id={`command-item-${itemIndex}`}
                                            onClick={() => { navigateToItem('recipes', recipe.id); onClose(); }}
                                            className={`flex items-center p-2 rounded-md cursor-pointer ${activeIndex === itemIndex ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                        >
                                            <BookOpen className="h-5 w-5 mr-3 text-zinc-500" />
                                            <span>{recipe.recipeTitle}</span>
                                        </li>
                                    );
                                })}
                                {dbSearchResults.pantry.map(pantryItem => {
                                    const itemIndex = currentIndex++;
                                    return (
                                        <li
                                            key={`db-pantry-${pantryItem.id}`}
                                            id={`command-item-${itemIndex}`}
                                            onClick={() => { navigateToItem('pantry', pantryItem.id); onClose(); }}
                                            className={`flex items-center p-2 rounded-md cursor-pointer ${activeIndex === itemIndex ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                        >
                                            <Milk className="h-5 w-5 mr-3 text-zinc-500" />
                                            <span>{pantryItem.name}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {Object.keys(groupedCommands).length > 0 ? (
                        Object.entries(groupedCommands).map(([section, cmds]) => (
                            <div key={section} className="mb-2">
                                <h3 className="text-xs font-semibold text-zinc-500 px-2 my-1">{section}</h3>
                                <ul>
                                    {cmds.map(command => {
                                        const itemIndex = currentIndex++;
                                        const Icon = command.icon;
                                        return (
                                            <li
                                                key={command.id}
                                                id={`command-item-${itemIndex}`}
                                                onClick={() => { command.action(); onClose(); }}
                                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                                                    activeIndex === itemIndex ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <Icon className="h-5 w-5 mr-3" />
                                                    <span>{command.title}</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))
                    ) : showGlobalSearch ? (
                         <div className="mb-2">
                            <h3 className="text-xs font-semibold text-zinc-500 px-2 my-1">Globale Suche</h3>
                            <ul>
                                <li id={`command-item-${currentIndex}`} onClick={() => { onGlobalSearch('recipes', searchTerm); onClose(); }} className={`flex items-center p-2 rounded-md cursor-pointer ${ activeIndex === currentIndex ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800' }`} >
                                    <BookOpen className="h-5 w-5 mr-3" />
                                    <span>Suche in Rezepten nach: "{searchTerm}"</span>
                                </li>
                                <li id={`command-item-${currentIndex + 1}`} onClick={() => { onGlobalSearch('pantry', searchTerm); onClose(); }} className={`flex items-center p-2 rounded-md cursor-pointer ${ activeIndex === currentIndex + 1 ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800' }`} >
                                    <Milk className="h-5 w-5 mr-3" />
                                    <span>Suche im Vorrat nach: "{searchTerm}"</span>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        searchTerm.length === 0 && dbSearchResults.recipes.length === 0 && dbSearchResults.pantry.length === 0 && (
                            <p className="text-center text-zinc-500 p-8">Beginne zu tippen, um Befehle zu sehen...</p>
                        )
                    )}

                    {searchTerm.length > 0 && flatCommandList.length === 0 && !showGlobalSearch && (
                        <p className="text-center text-zinc-500 p-8">Keine Ergebnisse gefunden.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;