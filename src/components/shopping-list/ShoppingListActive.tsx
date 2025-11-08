import React from 'react';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { ShoppingListItemComponent } from './ShoppingListItemComponent';
import { ChevronDown } from 'lucide-react';
import { ShoppingListItem } from '../../types';

export const ShoppingListActive = () => {
    const {
        groupedList,
        collapsedCategories,
        editingCategory,
        setEditingCategory,
        handleRenameCategory,
        handleToggleCategoryCollapse,
        dropTargetInfo,
        setDropTargetInfo,
        onCategoryDrop,
        onDragEnd,
        editingItem,
        setEditingItem,
        recipesById,
        handleToggle,
        updateItem,
        deleteItem,
        handleDragStart,
        handleDragOver,
        handleDrop,
        draggedItem,
    } = useShoppingListContext();

    const collapsedSet = new Set(collapsedCategories);

    return (
        <>
            {Object.entries(groupedList).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]: [string, ShoppingListItem[]]) => {
                const isCollapsed = collapsedSet.has(category);
                const isDropTargetCategory = dropTargetInfo?.category === category && !dropTargetInfo.itemId;
                return (
                    <div key={category} onDragOver={e => { e.preventDefault(); setDropTargetInfo({category}) }} onDragLeave={() => setDropTargetInfo(null)} onDrop={() => onCategoryDrop(category)} onDragEnd={onDragEnd}>
                        {editingCategory?.oldName === category ? (
                            <form onSubmit={e => { e.preventDefault(); handleRenameCategory(); }} className="mb-2">
                                <input type="text" value={editingCategory.newName} onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })} onBlur={handleRenameCategory} autoFocus className="font-bold text-[var(--color-accent-400)] bg-zinc-800 border-[var(--color-accent-500)] border-2 rounded-md w-full p-2 text-lg" />
                            </form>
                        ) : (
                            <h3 onDoubleClick={() => setEditingCategory({ oldName: category, newName: category })} onClick={() => handleToggleCategoryCollapse(category)} title="Klicken zum Ein-/Ausklappen, Doppelklick zum Umbenennen" className="font-bold text-[var(--color-accent-400)] text-lg mb-2 p-2 rounded-md bg-zinc-900/50 flex justify-between items-center cursor-pointer hover:bg-zinc-800/50" aria-expanded={!isCollapsed}>
                                <span>{category} ({items.length})</span>
                                <ChevronDown className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                            </h3>
                        )}
                        {!isCollapsed && <ul className={`space-y-1 p-2 rounded-lg transition-colors ${isDropTargetCategory ? 'bg-[var(--color-accent-500)]/10' : ''}`}>
                            {items.map(item => (
                                <ShoppingListItemComponent
                                    key={item.id} item={item} isEditing={editingItem?.id === item.id}
                                    editingItem={editingItem} recipeName={item.recipeId ? recipesById.get(item.recipeId)?.recipeTitle ?? null : null}
                                    onToggle={handleToggle} 
                                    onStartEdit={(itemToEdit) => setEditingItem({ ...itemToEdit })} 
                                    onCancelEdit={() => setEditingItem(null)}
                                    onSaveEdit={async () => { if (editingItem) { await updateItem(editingItem); setEditingItem(null); } }}
                                    setEditingItem={setEditingItem} 
                                    onDeleteItem={deleteItem}
                                    onDragStart={handleDragStart}
                                    onDragEnd={onDragEnd}
                                    onDragOver={e => handleDragOver(e, item)}
                                    onDragLeave={() => setDropTargetInfo(null)}
                                    onDrop={e => handleDrop(e, item)}
                                    isDragged={draggedItem?.id === item.id}
                                    dropTargetId={dropTargetInfo?.itemId ?? null}
                                />))}
                        </ul>}
                    </div>
                );
            })}
        </>
    );
};