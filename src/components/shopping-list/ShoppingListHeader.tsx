import React, { useMemo } from 'react';
import { ShoppingCart, CheckCircle, ShoppingBag } from 'lucide-react';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';

export const ShoppingListHeader = () => {
    const { activeItems, completedItems, isShoppingMode, setShoppingMode } = useShoppingListContext();
    
    const totalCount = activeItems.length + completedItems.length;
    const progress = totalCount > 0 ? (completedItems.length / totalCount) * 100 : 0;
    
    // Circular progress calculation
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-grow">
                 <div className="flex items-center gap-3 mb-1">
                    <div className={`p-2 rounded-full ${isShoppingMode ? 'bg-green-500/20 text-green-400' : 'bg-[var(--color-accent-500)]/10 text-[var(--color-accent-400)]'}`}>
                        {isShoppingMode ? <ShoppingBag size={24} /> : <ShoppingCart size={24} />}
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-100 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        {isShoppingMode ? 'Einkaufsmodus' : 'Einkaufsliste'}
                    </h2>
                </div>
                <p className="text-zinc-400 text-sm ml-12">
                    {isShoppingMode ? 'Display bleibt an. Tippen zum Abhaken.' : 'Plane deinen nächsten Einkauf.'}
                </p>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto bg-zinc-900/40 border border-white/5 p-3 rounded-2xl backdrop-blur-sm">
                {/* Progress Circle */}
                <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="transform -rotate-90 w-16 h-16">
                        <circle
                            className="text-zinc-800"
                            strokeWidth="6"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="32"
                            cy="32"
                        />
                        <circle
                            className={`${progress === 100 ? 'text-green-500' : 'text-[var(--color-accent-500)]'} transition-all duration-1000 ease-out`}
                            strokeWidth="6"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="32"
                            cy="32"
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-zinc-200">
                        {Math.round(progress)}%
                    </div>
                </div>

                <div className="flex-grow flex flex-col gap-1 mr-2">
                    <div className="flex justify-between text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        <span>Offen</span>
                        <span className="text-white">{activeItems.length}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        <span>Im Wagen</span>
                        <span className="text-green-400">{completedItems.length}</span>
                    </div>
                </div>

                <button 
                    onClick={() => setShoppingMode(!isShoppingMode)}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border transition-all ${isShoppingMode ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20'}`}
                    title={isShoppingMode ? "Modus beenden" : "Einkauf starten"}
                >
                   {isShoppingMode ? <CheckCircle size={24}/> : <ShoppingBag size={24}/>}
                   <span className="text-[10px] font-bold mt-1">{isShoppingMode ? 'Fertig' : 'Start'}</span>
                </button>
            </div>
        </div>
    );
};