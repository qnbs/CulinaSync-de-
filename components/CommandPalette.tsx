import React, { useState, useEffect, useMemo } from 'react';
import { Search, LucideProps } from 'lucide-react';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

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
        return Object.values(groupedCommands).flat();
    }, [groupedCommands]);


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
                setActiveIndex(prev => (prev + 1) % flatCommandList.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + flatCommandList.length) % flatCommandList.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const command = flatCommandList[activeIndex];
                if (command) {
                    command.action();
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, flatCommandList, onClose]);
    
    useEffect(() => {
        document.getElementById(`command-item-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (!isOpen) {
        return null;
    }

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
                className="relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-2xl mx-4 transform transition-all"
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
                    {flatCommandList.length > 0 ? (
                        Object.entries(groupedCommands).map(([section, cmds]) => (
                            <div key={section} className="mb-2">
                                <h3 className="text-xs font-semibold text-zinc-500 px-2 my-1">{section}</h3>
                                <ul>
                                    {cmds.map(command => {
                                        const currentIndex = flatCommandList.findIndex(c => c.id === command.id);
                                        const Icon = command.icon;
                                        return (
                                            <li
                                                key={command.id}
                                                id={`command-item-${currentIndex}`}
                                                onClick={() => { command.action(); onClose(); }}
                                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                                                    activeIndex === currentIndex ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
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
                    ) : (
                        <p className="text-center text-zinc-500 p-8">Keine Befehle gefunden.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
