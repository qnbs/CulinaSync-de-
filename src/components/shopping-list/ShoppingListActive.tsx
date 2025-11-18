import React from 'react';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { ShoppingListItemComponent } from './ShoppingListItemComponent';
import { ChevronDown, GripVertical } from 'lucide-react';
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
        isShoppingMode,
    } = useShoppingListContext();

    const collapsedSet = new Set(collapsedCategories);

    return (
        <div className={isShoppingMode ? 'space-y-6' : 'space-y-4'}>
            {Object.entries(groupedList).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]: [string, ShoppingListItem[]]) => {
                const isCollapsed = collapsedSet.has(category);
                const isDropTargetCategory = dropTargetInfo?.category === category && !dropTargetInfo.itemId;
                
                // Calculate category completion for mini-progress bar if needed (future enhancement)
                // For now, just list count.
                
                return (
                    <div 
                        key={category} 
                        onDragOver={e => { if(!isShoppingMode) { e.preventDefault(); setDropTargetInfo({category}) } }} 
                        onDragLeave={() => !isShoppingMode && setDropTargetInfo(null)} 
                        onDrop={() => !isShoppingMode && onCategoryDrop(category)} 
                        onDragEnd={!isShoppingMode ? onDragEnd : undefined}
                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isShoppingMode ? 'bg-zinc-900/20 border-zinc-800/50' : 'bg-zinc-900/40 border-white/5 shadow-lg backdrop-blur-sm'}`}
                    >
                        <div 
                            className={`flex justify-between items-center p-3 ${isShoppingMode ? 'bg-transparent' : 'bg-white/5 cursor-pointer hover:bg-white/10'}`}
                            onClick={() => !isShoppingMode && handleToggleCategoryCollapse(category)}
                        >
                             {editingCategory?.oldName === category && !isShoppingMode ? (
                                <form onSubmit={e => { e.preventDefault(); handleRenameCategory(); }} className="flex-grow mr-4">
                                    <input type="text" value={editingCategory.newName} onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })} onBlur={handleRenameCategory} autoFocus className="font-bold text-[var(--color-accent-400)] bg-zinc-800 border-[var(--color-accent-500)] border-2 rounded-md w-full p-1 text-lg" />
                                </form>
                            ) : (
                                <h3 
                                    onDoubleClick={() => !isShoppingMode && setEditingCategory({ oldName: category, newName: category })}
                                    className="font-bold text-[var(--color-accent-400)] text-lg flex items-center gap-2"
                                >
                                    {!isShoppingMode && <GripVertical size={16} className="text-zinc-600" />}
                                    {category} 
                                    <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{items.length}</span>
                                </h3>
                            )}
                            
                            {!isShoppingMode && (
                                <ChevronDown className={`text-zinc-500 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className={`p-2 ${isDropTargetCategory ? 'bg-[var(--color-accent-500)]/10' : ''}`}>
                                <ul className="space-y-2">
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
                                            isShoppingMode={isShoppingMode}
                                        />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};