import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, LucideProps, Milk, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../services/dbInstance';
import { Recipe, PantryItem } from '../types';
import { useAppDispatch } from '../store/hooks';
import { navigateToItem as navigateToItemAction, setCurrentPage, setVoiceAction } from '../store/slices/uiSlice';
import { useModalA11y } from '../hooks/useModalA11y';

const EMPTY_DB_SEARCH_RESULTS = { recipes: [], pantry: [] } as const;

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

type PaletteItem = (Recipe & { type: 'recipe' }) 
    | (PantryItem & { type: 'pantry' }) 
    | (Command & { type: 'command' }) 
    | { id: string, title: string, action: () => void, type: 'global' };


const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [dbSearchResults, setDbSearchResults] = useState<{recipes: Recipe[], pantry: PantryItem[]}>({ recipes: [], pantry: [] });
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClose = useCallback(() => {
        setSearchTerm('');
        setActiveIndex(0);
        setDbSearchResults({ recipes: [], pantry: [] });
        onClose();
    }, [onClose]);

    useModalA11y({
        isOpen,
        onClose: handleClose,
        containerRef: modalRef,
        initialFocusRef: inputRef,
        closeOnEscape: false,
    });

    const navigateToItem = useCallback((page: 'recipes' | 'pantry', id: number) => {
        dispatch(navigateToItemAction({ page, id }));
    }, [dispatch]);

    const handleGlobalSearch = useCallback((type: 'pantry' | 'recipes', term: string) => {
        dispatch(setCurrentPage({ page: type }));
        dispatch(setVoiceAction({ type: 'SEARCH', payload: `${term}#${Date.now()}` }));
        handleClose();
    }, [dispatch, handleClose]);


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
        }
    }, [searchTerm, isOpen]);

    const visibleDbSearchResults = isOpen && searchTerm.length > 1 ? dbSearchResults : EMPTY_DB_SEARCH_RESULTS;

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
        let list: PaletteItem[] = [];
        list = list.concat(visibleDbSearchResults.recipes.map(r => ({ ...r, type: 'recipe' })));
        list = list.concat(visibleDbSearchResults.pantry.map(p => ({...p, type: 'pantry' })));
        list = list.concat(Object.values(groupedCommands).flat().map(c => ({...c, type: 'command'})));
        
        const showGlobalSearch = list.length === 0 && searchTerm.trim().length > 1;

        if (showGlobalSearch) {
             list.push({ id: 'search-recipes-dynamic', title: t('commandPalette.dynamicSearch.recipes', { searchTerm }), action: () => handleGlobalSearch('recipes', searchTerm), type: 'global' });
             list.push({ id: 'search-pantry-dynamic', title: t('commandPalette.dynamicSearch.pantry', { searchTerm }), action: () => handleGlobalSearch('pantry', searchTerm), type: 'global' });
        }
        return list;
    }, [groupedCommands, searchTerm, visibleDbSearchResults, handleGlobalSearch, t]);

    const currentActiveIndex = flatCommandList.length > 0 ? Math.min(activeIndex, flatCommandList.length - 1) : 0;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % (flatCommandList.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + (flatCommandList.length || 1)) % (flatCommandList.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = flatCommandList[currentActiveIndex];
                if (item) {
                    if (item.type === 'recipe') navigateToItem('recipes', item.id!);
                    else if (item.type === 'pantry') navigateToItem('pantry', item.id!);
                    else if (item.action) item.action();
                    handleClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentActiveIndex, flatCommandList, handleClose, navigateToItem]);
    
    useEffect(() => {
        document.getElementById(`command-item-${currentActiveIndex}`)?.scrollIntoView({ block: 'nearest' });
    }, [currentActiveIndex]);

    if (!isOpen) {
        return null;
    }
    
    const renderItem = (item: PaletteItem, index: number): React.ReactNode => {
        const isSelected = currentActiveIndex === index;
        let content;
        let action;
    
        const getSectionTitle = (currentItem: PaletteItem, previousItem: PaletteItem | null) => {
            const currentSection = currentItem.type === 'recipe' ? t('commandPalette.sections.recipes') : currentItem.type === 'pantry' ? t('commandPalette.sections.pantry') : currentItem.type === 'global' ? t('commandPalette.sections.globalSearch') : currentItem.section;
            if (!previousItem) return currentSection;
            const previousSection = previousItem.type === 'recipe' ? t('commandPalette.sections.recipes') : previousItem.type === 'pantry' ? t('commandPalette.sections.pantry') : previousItem.type === 'global' ? t('commandPalette.sections.globalSearch') : previousItem.section;
            return currentSection !== previousSection ? currentSection : null;
        };
    
        switch (item.type) {
            case 'recipe':
                content = <><BookOpen className="h-5 w-5 mr-3 text-zinc-500" /><span>{item.recipeTitle}</span></>;
                action = () => { navigateToItem('recipes', item.id!); handleClose(); };
                break;
            case 'pantry':
                content = <><Milk className="h-5 w-5 mr-3 text-zinc-500" /><span>{item.name}</span></>;
                action = () => { navigateToItem('pantry', item.id!); handleClose(); };
                break;
            case 'command': {
                const Icon = item.icon;
                content = <><Icon className="h-5 w-5 mr-3" /><span>{item.title}</span></>;
                action = () => { item.action(); handleClose(); };
                break;
            }
            case 'global': {
                const GlobalIcon = item.id.includes('recipes') ? BookOpen : Milk;
                content = <><GlobalIcon className="h-5 w-5 mr-3" /><span>{item.title}</span></>;
                action = () => { item.action(); handleClose(); };
                break;
            }
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
                    className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 glass-overlay"
                    onClick={handleClose}
                >
          <div 
                        ref={modalRef}
            className="relative w-full max-w-xl rounded-lg modal-fade-in glass-modal"
            onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('commandPalette.ariaLabel')}
                        tabIndex={-1}
          >
            <div className="flex items-center border-b border-zinc-700/50 p-1">
              <Search className="h-5 w-5 text-zinc-500 mx-3" />
              <input
                                ref={inputRef}
                type="text"
                autoFocus
                value={searchTerm}
                                onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setActiveIndex(0);
                                }}
                                placeholder={t('commandPalette.placeholder')}
                className="w-full bg-transparent p-2 text-lg text-zinc-100 focus:outline-none placeholder-zinc-500"
              />
            </div>
            {flatCommandList.length > 0 ? (
                <ul className="max-h-[60vh] overflow-y-auto p-2">
                    {flatCommandList.map((item, index) => renderItem(item, index))}
                </ul>
            ) : (
                                <p className="p-4 text-center text-zinc-500">{t('commandPalette.noResults')}</p>
            )}
          </div>
        </div>
    );
};

export { CommandPalette };
