import React from 'react';
import { ShoppingListItem } from '../../types';
import { Save, X, Edit3, Trash2, CheckCircle, GripVertical, ChefHat, Circle } from 'lucide-react';

export const ShoppingListItemComponent = React.memo<{
    item: ShoppingListItem;
    isEditing: boolean;
    editingItem: ShoppingListItem | null;
    recipeName: string | null;
    isDragged: boolean;
    dropTargetId: number | null;
    onToggle: (item: ShoppingListItem) => void;
    onStartEdit: (item: ShoppingListItem) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    setEditingItem: React.Dispatch<React.SetStateAction<ShoppingListItem | null>>;
    onDeleteItem: (id: number) => void;
    onDragStart: (e: React.DragEvent, item: ShoppingListItem) => void;
    onDragOver: (e: React.DragEvent, item: ShoppingListItem) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, item: ShoppingListItem) => void;
    onDragEnd: (e: React.DragEvent) => void;
    isShoppingMode?: boolean;
}>(({ item, isEditing, editingItem, recipeName, isDragged, dropTargetId, onToggle, onStartEdit, onCancelEdit, onSaveEdit, setEditingItem, onDeleteItem, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, isShoppingMode = false }) => {
    
    if (isEditing) {
        return (
            <li className="p-3 bg-zinc-800 rounded-xl ring-2 ring-[var(--color-accent-500)] shadow-lg z-10">
                <form onSubmit={e => { e.preventDefault(); onSaveEdit(); }} className="flex flex-wrap items-center gap-2">
                  <input type="text" value={editingItem!.name} onChange={e => setEditingItem({...editingItem!, name: e.target.value})} className="flex-grow bg-zinc-700 rounded-lg p-2 text-zinc-100" autoFocus/>
                  <div className="flex gap-2">
                      <input type="number" value={editingItem!.quantity} onChange={e => setEditingItem({...editingItem!, quantity: parseFloat(e.target.value) || 0})} className="w-20 bg-zinc-700 rounded-lg p-2 text-zinc-100" />
                      <input type="text" value={editingItem!.unit} onChange={e => setEditingItem({...editingItem!, unit: e.target.value})} className="w-24 bg-zinc-700 rounded-lg p-2 text-zinc-100" />
                  </div>
                  <div className="flex gap-1 ml-auto">
                      <button type="submit" className="p-2 rounded-lg bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-400)] text-zinc-900"><Save size={18}/></button>
                      <button type="button" onClick={onCancelEdit} className="p-2 rounded-lg bg-zinc-600 hover:bg-zinc-500"><X size={18}/></button>
                  </div>
                </form>
            </li>
        );
    }

    return (
        <li
            draggable={!item.isChecked && !isShoppingMode}
            onDragStart={!isShoppingMode ? e => onDragStart(e, item) : undefined}
            onDragOver={!isShoppingMode ? e => onDragOver(e, item) : undefined}
            onDragLeave={!isShoppingMode ? onDragLeave : undefined}
            onDrop={!isShoppingMode ? e => onDrop(e, item) : undefined}
            onDragEnd={!isShoppingMode ? onDragEnd : undefined}
            className={`transition-all duration-200 relative group ${isShoppingMode ? 'py-1' : ''}`}
        >
            {dropTargetId === item.id && !isShoppingMode && <div className="absolute -top-2 left-0 right-0 h-1 bg-[var(--color-accent-400)] rounded-full shadow-[0_0_10px_var(--color-accent-glow)] z-10" />}
            
            <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDragged ? 'opacity-30 scale-95' : ''} ${!item.isChecked ? 'bg-zinc-800/40 hover:bg-zinc-800/60' : 'bg-transparent opacity-60'} ${isShoppingMode && !item.isChecked ? 'bg-zinc-800 border border-zinc-700/50 shadow-md min-h-[70px]' : ''}`}>
                
                {!item.isChecked && !isShoppingMode && (
                    <GripVertical className="text-zinc-600 cursor-grab touch-none flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                )}
                
                <button 
                    onClick={() => onToggle(item)} 
                    className={`flex-shrink-0 transition-all duration-200 ${isShoppingMode ? 'p-2' : 'mt-0.5'}`}
                    aria-label={`Mark ${item.name} as ${item.isChecked ? 'incomplete' : 'complete'}`}
                >
                    {item.isChecked ? (
                        <CheckCircle className="text-zinc-500" size={isShoppingMode ? 32 : 24}/>
                    ) : (
                        <Circle className={`text-zinc-400 group-hover:text-[var(--color-accent-400)] transition-colors ${isShoppingMode ? 'stroke-2' : ''}`} size={isShoppingMode ? 32 : 24} />
                    )}
                </button>
                
                <div className="flex-grow min-w-0 cursor-pointer" onClick={() => onToggle(item)}>
                    <div className="flex items-baseline justify-between gap-2">
                         <span className={`font-medium truncate ${item.isChecked ? 'line-through text-zinc-500' : 'text-zinc-100'} ${isShoppingMode ? 'text-lg' : 'text-base'}`}>
                             {item.name}
                         </span>
                         <span className={`font-mono font-bold text-zinc-400 whitespace-nowrap flex-shrink-0 ${isShoppingMode ? 'text-lg bg-zinc-950/50 px-2 py-0.5 rounded' : 'text-sm'}`}>
                            {(item.quantity || 0).toFixed(1).replace(/\.0$/, '')} {item.unit}
                        </span>
                    </div>
                    
                    {recipeName && !item.isChecked && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--color-accent-400)]/80">
                            <ChefHat size={12}/> 
                            <span className="truncate">für {recipeName}</span>
                        </div>
                    )}
                </div>

                {!item.isChecked && !isShoppingMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); onStartEdit(item); }} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"><Edit3 size={16}/></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id!); }} className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-900/20"><Trash2 size={16}/></button>
                    </div>
                )}
            </div>
        </li>
    );
});