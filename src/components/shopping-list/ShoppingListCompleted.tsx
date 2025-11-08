import React from 'react';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { ShoppingListItemComponent } from './ShoppingListItemComponent';
import { ChevronDown } from 'lucide-react';

export const ShoppingListCompleted = () => {
    const {
        completedItems,
        isCompletedVisible,
        setIsCompletedVisible,
        recipesById,
        handleToggle,
        setEditingItem,
        deleteItem,
    } = useShoppingListContext();

    return (
        <div className="pt-4 border-t border-zinc-700/50">
            <button onClick={() => setIsCompletedVisible()} className="w-full flex justify-between items-center text-lg font-semibold text-zinc-400 hover:text-white p-2">
                <span>Erledigt ({completedItems.length})</span>
                <ChevronDown className={`transition-transform ${!isCompletedVisible ? '' : 'rotate-180'}`} />
            </button>
            {isCompletedVisible && <ul className="mt-2 space-y-1 page-fade-in">{
                completedItems.map(item => (
                    <ShoppingListItemComponent
                        key={item.id}
                        item={item}
                        isEditing={false}
                        editingItem={null}
                        recipeName={item.recipeId ? recipesById.get(item.recipeId)?.recipeTitle ?? null : null}
                        onToggle={handleToggle}
                        onStartEdit={() => {}}
                        onCancelEdit={() => {}}
                        onSaveEdit={() => {}}
                        setEditingItem={setEditingItem}
                        onDeleteItem={deleteItem}
                        onDragStart={() => {}}
                        onDragEnd={() => {}}
                        onDragOver={() => {}}
                        onDragLeave={() => {}}
                        onDrop={() => {}}
                        isDragged={false}
                        dropTargetId={null}
                    />
                ))
            }</ul>}
        </div>
    );
};