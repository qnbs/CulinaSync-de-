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
    } = useShoppingListContext();

    return (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800 p-3 z-30">
            <div className="max-w-4xl mx-auto px-4">
                {completedItems.length > 0 ? (
                    <button onClick={handleMoveToPantry} className="w-full flex items-center justify-center gap-3 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-3 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors shadow-lg">
                        <Archive size={20}/>
                        <span>{completedItems.length} gekaufte Artikel in den Vorrat verschieben</span>
                    </button>
                ) : (
                    <form onSubmit={handleQuickAdd} className="flex items-center gap-2 bg-zinc-800 rounded-md p-1 border border-zinc-700 focus-within:ring-2 focus-within:ring-[var(--color-accent-500)]">
                         <Plus className="text-zinc-500 ml-2"/>
                         <input ref={addItemInputRef} type="text" value={quickAddItem} onChange={e => setQuickAddItem(e.target.value)} placeholder="z.B. 2l Milch, Eier, Brot..." className="flex-grow bg-transparent focus:outline-none p-2"/>
                         <button type="submit" className="flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-500)] text-zinc-900 font-bold p-2 rounded-md hover:bg-[var(--color-accent-400)] transition-colors" aria-label="Artikel hinzufügen">
                             <Send size={18}/>
                         </button>
                    </form>
                )}
            </div>
        </div>
    );
};