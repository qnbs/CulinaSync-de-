import React from 'react';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { Plus, Send, Archive } from 'lucide-react';

export const ShoppingListQuickAdd = () => {
    const {
        completedItems,
        handleMoveToPantry,
        quickAddItem,
        setQuickAddItem,
        handleQuickAdd,
        addItemInputRef,
        isShoppingMode
    } = useShoppingListContext();

    // In shopping mode, we hide the quick add bar to minimize distraction, 
    // unless there are completed items to move to pantry.
    if (isShoppingMode && completedItems.length === 0) return null;

    return (
        <div className="fixed bottom-20 md:bottom-4 left-0 right-0 z-30 pointer-events-none">
            <div className="max-w-3xl mx-auto px-4 pointer-events-auto">
                {completedItems.length > 0 ? (
                    <button 
                        onClick={handleMoveToPantry} 
                        className="w-full flex items-center justify-center gap-3 bg-zinc-900/90 backdrop-blur-xl border border-[var(--color-accent-500)]/30 text-zinc-200 font-bold py-3 px-4 rounded-2xl hover:bg-[var(--color-accent-500)] hover:text-zinc-900 transition-all shadow-2xl group mb-4"
                    >
                        <Archive size={20} className="group-hover:scale-110 transition-transform"/>
                        <span>{completedItems.length} erledigt • In Vorrat verschieben</span>
                    </button>
                ) : null}

                {!isShoppingMode && (
                    <form onSubmit={handleQuickAdd} className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-1.5 border border-zinc-700/50 shadow-2xl focus-within:ring-2 focus-within:ring-[var(--color-accent-500)] focus-within:border-[var(--color-accent-500)] transition-all">
                         <div className="p-2 text-zinc-500">
                            <Plus size={20}/>
                         </div>
                         <input 
                            ref={addItemInputRef} 
                            type="text" 
                            value={quickAddItem} 
                            onChange={e => setQuickAddItem(e.target.value)} 
                            placeholder="Schnell hinzufügen (z.B. 500g Mehl)" 
                            className="flex-grow bg-transparent focus:outline-none p-2 text-zinc-100 placeholder-zinc-500"
                        />
                         <button 
                            type="submit" 
                            disabled={!quickAddItem.trim()}
                            className="flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-500)] text-zinc-900 font-bold p-2.5 rounded-xl hover:bg-[var(--color-accent-400)] disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors" 
                            aria-label="Artikel hinzufügen"
                        >
                             <Send size={18}/>
                         </button>
                    </form>
                )}
            </div>
        </div>
    );
};