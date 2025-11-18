
import React, { useState } from 'react';
import { Search, Book, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCommandPaletteOpen, setCurrentPage, setVoiceAction } from '../store/slices/uiSlice';
import { FaqSection, TipsSection, AboutSection } from './help/HelpComponents';

interface HelpProps {
  appVersion: string;
}

const Help: React.FC<HelpProps> = ({ appVersion }) => {
  const dispatch = useAppDispatch();
  const { isListening } = useAppSelector(state => state.ui); // Access global listening state just in case we need it
  
  const [activeTab, setActiveTab] = useState<'knowledge' | 'about'>('knowledge');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Action Handler for "Try It" Buttons ---
  const handleAction = (actionId: string) => {
      switch(actionId) {
          case 'OPEN_CMD':
              dispatch(setCommandPaletteOpen(true));
              break;
          case 'TOGGLE_VOICE':
             // Trigger global voice toggle logic via UI slice if possible, 
             // or navigate to a page where voice is prominent.
             // For this demo, we simulate a voice search.
             dispatch(setVoiceAction({ type: 'UNKNOWN', payload: 'Test' })); 
             // In a real app, we'd dispatch a thunk to toggle listening.
             break;
          case 'NAV_SHOPPING':
              dispatch(setCurrentPage({ page: 'shopping-list' }));
              break;
      }
  };

  return (
    <div className="space-y-8 pb-24 min-h-[80vh]">
      
      {/* Header & Search */}
      <header className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Wissensdatenbank
                </h2>
                <p className="text-zinc-400 mt-1">Anleitungen, Tipps & Systemstatus.</p>
            </div>
         </div>

         <div className="relative group max-w-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-accent-500)] to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex items-center bg-zinc-900 border border-zinc-700 rounded-xl p-1 focus-within:border-[var(--color-accent-500)] focus-within:ring-1 focus-within:ring-[var(--color-accent-500)] transition-all">
                <Search className="ml-3 text-zinc-500" size={20} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Wie kann ich...?"
                    className="w-full bg-transparent border-none focus:ring-0 text-zinc-100 placeholder-zinc-500 h-12 px-4 text-lg"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="mr-2 p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300">
                        <X size={18}/>
                    </button>
                )}
            </div>
         </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-full sm:w-fit backdrop-blur-sm">
        <button 
            onClick={() => setActiveTab('knowledge')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'knowledge' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            <Book size={16} /> 
            <span>Wissen & FAQ</span>
        </button>
        <button 
            onClick={() => setActiveTab('about')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            <Info size={16} /> 
            <span>System & Über</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
          {activeTab === 'knowledge' ? (
              <div className="space-y-8 page-fade-in">
                  {!searchTerm && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider pl-1">Pro-Tipps (Interaktiv)</h3>
                        <TipsSection onAction={handleAction} searchTerm={searchTerm} />
                      </div>
                  )}
                  
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider pl-1">Häufige Fragen</h3>
                     <FaqSection searchTerm={searchTerm} />
                  </div>
              </div>
          ) : (
              <AboutSection appVersion={appVersion} />
          )}
      </div>

    </div>
  );
};

export default Help;