import React from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';

export const PantryBulkActions = () => {
    const { 
        isSelectMode, 
        selectedItems,
        handleAddSelectedToShoppingList,
        handleDeleteSelected,
    } = usePantryManagerContext();
    
    if (!isSelectMode || selectedItems.length === 0) return null;

    return (
        <div className="sticky bottom-4 z-20 bg-zinc-800/80 backdrop-blur-md border border-zinc-700 rounded-lg p-3 flex justify-between items-center w-full max-w-lg mx-auto shadow-xl page-fade-in">
            <span className="font-medium text-zinc-200">{selectedItems.length} Artikel ausgewählt</span>
            <div className="flex gap-2">
                <button onClick={handleAddSelectedToShoppingList} disabled={selectedItems.length === 0} className="flex items-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-3 rounded-md hover:bg-[var(--color-accent-400)] transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed text-sm">
                    <ShoppingCart size={16}/> Zur Liste
                </button>
                <button onClick={handleDeleteSelected} disabled={selectedItems.length === 0} className="flex items-center gap-2 bg-red-800/80 text-white font-bold py-2 px-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed text-sm">
                    <Trash2 size={16}/> Löschen
                </button>
            </div>
        </div>
    );
};