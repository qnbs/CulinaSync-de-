import React from 'react';
import { ShoppingListItem } from '../../types';
import { Save, X, Edit3, Trash2, CheckCircle, GripVertical } from 'lucide-react';

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
}>(({ item, isEditing, editingItem, recipeName, isDragged, dropTargetId, onToggle, onStartEdit, onCancelEdit, onSaveEdit, setEditingItem, onDeleteItem, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }) => {
    
    if (isEditing) {
        return (
            <li className="p-2 bg-zinc-800 rounded-md ring-2 ring-[var(--color-accent-500)]">
                <form onSubmit={e => { e.preventDefault(); onSaveEdit(); }} className="flex items-center gap-2">
                  <input type="text" value={editingItem!.name} onChange={e => setEditingItem({...editingItem!, name: e.target.value})} className="flex-grow bg-zinc-700 rounded p-1" autoFocus/>
                  <input type="number" value={editingItem!.quantity} onChange={e => setEditingItem({...editingItem!, quantity: parseFloat(e.target.value) || 0})} className="w-16 bg-zinc-700 rounded p-1" />
                  <input type="text" value={editingItem!.unit} onChange={e => setEditingItem({...editingItem!, unit: e.target.value})} className="w-20 bg-zinc-700 rounded p-1" />
                  <button type="submit" className="p-2 rounded bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-400)] text-zinc-900"><Save size={16}/></button>
                  <button type="button" onClick={onCancelEdit} className="p-2 rounded bg-zinc-600 hover:bg-zinc-500"><X size={16}/></button>
                </form>
            </li>
        );
    }

    return (
        <li
            draggable={!item.isChecked}
            onDragStart={e => onDragStart(e, item)}
            onDragOver={e => onDragOver(e, item)}
            onDragLeave={onDragLeave}
            onDrop={e => onDrop(e, item)}
            onDragEnd={onDragEnd}
            className={`transition-opacity duration-200 relative`}
        >
            {dropTargetId === item.id && <div className="absolute -top-1 left-0 right-0 h-1.5 bg-[var(--color-accent-400)] rounded-full" />}
            <div className={`flex items-start gap-3 p-2 rounded-md group ${isDragged ? 'opacity-30' : ''} ${!item.isChecked ? 'hover:bg-zinc-800/50' : ''}`}>
                {!item.isChecked && <GripVertical className="text-zinc-600 cursor-grab touch-none mt-1" size={18} />}
                <button onClick={() => onToggle(item)} className="mt-0.5" aria-label={`Mark ${item.name} as ${item.isChecked ? 'incomplete' : 'complete'}`}>
                    {item.isChecked ? <CheckCircle className="text-[var(--color-accent-500)]"/> : <div className="w-5 h-5 rounded-full border-2 border-zinc-500 group-hover:border-[var(--color-accent-500)] transition-colors"/>}
                </button>
                <div className="flex-grow cursor-pointer" onClick={() => onToggle(item)}>
                    <span className={` ${item.isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{item.name}</span>
                    <div className="text-xs text-zinc-400">
                        <span>({(item.quantity || 0).toFixed(1).replace(/\.0$/, '')} {item.unit})</span>
                        {recipeName && <span className="italic ml-2 text-[var(--color-accent-500)]">für: {recipeName}</span>}
                    </div>
                </div>
                {!item.isChecked && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onStartEdit(item)} className="p-1 text-zinc-400 hover:text-[var(--color-accent-400)]"><Edit3 size={14}/></button>
                        <button onClick={() => onDeleteItem(item.id!)} className="p-1 text-zinc-400 hover:text-red-400"><Trash2 size={14}/></button>
                    </div>
                )}
            </div>
        </li>
    );
});