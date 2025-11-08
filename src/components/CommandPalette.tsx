import React, { useState, useEffect, useMemo } from 'react';
import { Search, LucideProps, Milk, BookOpen } from 'lucide-react';
import { db } from '../services/db';
import { Recipe, PantryItem } from '../types';
import { useAppDispatch } from '../store/hooks';
import { navigateToItem as navigateToItemAction, setCurrentPage, setVoiceAction } from '../store/slices/uiSlice';

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
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [dbSearchResults, setDbSearchResults] = useState<{recipes: Recipe[], pantry: PantryItem[]}>({recipes: [], pantry: []});

    const navigateToItem = (page: 'recipes' | 'pantry', id: number) => {
        dispatch(navigateToItemAction({ page, id }));
    };

    const handleGlobalSearch = (type: 'pantry' | 'recipes', term: string) => {
        dispatch(setCurrentPage({ page: type }));
        dispatch(setVoiceAction({ type: 'SEARCH', payload: `${term}#${Date.now()}` }));
        onClose();
    };


    useEffect(() => {
        if (isOpen && searchTerm.length > 1) {
            const search = async () => {
                const [recipes, pantry] = await Promise.all([
                    db.recipes.where('recipeTitle').startsWithIgnoreCase(searchTerm).limit(3).toArray(),
                    db.pantry.where('name').startsWithIgnoreCase(searchTerm).limit(3).toArray()
                ]);
                setDbSearchResults({recipes, pantry});
            };
            const debounce = setTimeout(search, 150);
            return () => clearTimeout(debounce);
        } else {
            setDbSearchResults({recipes: [], pantry: []});
        }
    }, [searchTerm, isOpen]);

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
    
    const groupedCommands: Record<string, Command[]> = useMemo(() => {
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
        
        const showGlobalSearch = list.length === 0 && searchTerm.trim().length > 1;

        if (showGlobalSearch) {
             list.push({ id: 'search-recipes-dynamic', title: `Suche in Rezepten nach: "${searchTerm}"`, action: () => handleGlobalSearch('recipes', searchTerm), type: 'global' });
             list.push({ id: 'search-pantry-dynamic', title: `Suche im Vorrat nach: "${searchTerm}"`, action: () => handleGlobalSearch('pantry', searchTerm), type: 'global' });
        }
        return list;
    }, [groupedCommands, searchTerm, dbSearchResults, handleGlobalSearch]);


    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setActiveIndex(0);
    }, [searchTerm, flatCommandList.length]);

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
    
    const renderItem = (item: any, index: number): React.ReactNode => {
        const isSelected = activeIndex === index;
        let content;
        let action;
    
        const getSectionTitle = (currentItem: any, previousItem: any) => {
            const currentSection = currentItem.type === 'recipe' ? 'Rezepte' : currentItem.type === 'pantry' ? 'Vorratskammer' : currentItem.type === 'global' ? 'Globale Suche' : currentItem.section;
            if (!previousItem) return currentSection;
            const previousSection = previousItem.type === 'recipe' ? 'Rezepte' : previousItem.type === 'pantry' ? 'Vorratskammer' : previousItem.type === 'global' ? 'Globale Suche' : previousItem.section;
            return currentSection !== previousSection ? currentSection : null;
        };
    
        switch (item.type) {
            case 'recipe':
                content = <><BookOpen className="h-5 w-5 mr-3 text-zinc-500" /><span>{item.recipeTitle}</span></>;
                action = () => { navigateToItem('recipes', item.id); onClose(); };
                break;
            case 'pantry':
                content = <><Milk className="h-5 w-5 mr-3 text-zinc-500" /><span>{item.name}</span></>;
                action = () => { navigateToItem('pantry', item.id); onClose(); };
                break;
            case 'command':
                const Icon = item.icon;
                content = <><Icon className="h-5 w-5 mr-3" /><span>{item.title}</span></>;
                action = () => { item.action(); onClose(); };
                break;
            case 'global':
                const GlobalIcon = item.id.includes('recipes') ? BookOpen : Milk;
                content = <><GlobalIcon className="h-5 w-5 mr-3" /><span>{item.title}</span></>;
                action = () => { item.action(); onClose(); };
                break;
            default:
                return null;
        }
    
        const sectionTitle = getSectionTitle(item, index > 0 ? flatCommandList[index - 1] : null);
    
        return (
            <React.Fragment key={item.id}>
                {sectionTitle && <h3 className="text-xs font-semibold text-zinc-500 px-2 my-1">{sectionTitle}</h3>}
                <li
                    id={`command-item-${index}`}
                    onClick={action}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${isSelected ? 'bg-[var(--color-accent-500)]/20 text-[var(--color-accent-300)]' : 'text-zinc-300 hover:bg-zinc-800'}`}
                >
                    {content}
                </li>
            </React.Fragment>
        );
    };

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
                        placeholder="Suchen oder Befehl ausführen..."
                        className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none hidden sm:block"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                     <div className="ml-3 text-xs text-zinc-500 border border-zinc-600 rounded px-1.5 py-0.5 hidden sm:block">ESC</div>
                </div>

                <div className="max-h-[70vh] md:max-h-[60vh] overflow-y-auto p-2">
                    {flatCommandList.length > 0 ? (
                        <ul>
                            {flatCommandList.map((item, index) => renderItem(item, index))}
                        </ul>
                    ) : (
                        <p className="text-center text-zinc-500 p-8">
                            {searchTerm ? 'Keine Ergebnisse gefunden.' : 'Befehl auswählen...'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;