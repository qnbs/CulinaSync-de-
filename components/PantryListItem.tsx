import React from 'react';
import { PantryItem } from '@/types';
import { Minus, Plus, Square, CheckSquare, Edit3, AlertTriangle, ShoppingCart } from 'lucide-react';

export const getExpiryStatus = (expiryDate?: string): 'expired' | 'nearing' | 'ok' => {
  if (!expiryDate) return 'ok';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0,0,0,0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'nearing';
  return 'ok';
};

interface PantryListItemProps {
    item: PantryItem;
    isSelectMode: boolean;
    isSelected: boolean;
    onStartEdit: (item: PantryItem) => void;
    onAdjustQuantity: (item: PantryItem, amount: number) => void;
    onToggleSelect: (id: number) => void;
    onAddToShoppingList: (item: PantryItem) => void;
}

const PantryListItem = React.memo<PantryListItemProps>(({
    item, isSelectMode, isSelected,
    onStartEdit, onAdjustQuantity, onToggleSelect, onAddToShoppingList
}) => {
    const status = getExpiryStatus(item.expiryDate);
    const isRunningLow = item.minQuantity != null && item.quantity <= item.minQuantity;

    let indicatorClasses = 'border-l-4 transition-colors ';
    if (status === 'expired') indicatorClasses += 'border-red-500 bg-red-900/20';
    else if (status === 'nearing') indicatorClasses += 'border-yellow-500 bg-yellow-900/20';
    else if (isRunningLow) indicatorClasses += 'border-yellow-500 bg-yellow-900/20';
    else if (isSelected) indicatorClasses += 'border-amber-500 bg-amber-900/20';
    else indicatorClasses += 'border-zinc-800';

    return (
        <li className={`p-3 flex items-center gap-3 group ${indicatorClasses}`}>
          {isSelectMode && (
            <button onClick={() => onToggleSelect(item.id!)} className="p-1 text-zinc-400" aria-label={`Select ${item.name}`}>
              {isSelected ? <CheckSquare className="text-amber-400"/> : <Square/>}
            </button>
          )}
          <div className="flex-grow cursor-pointer" onClick={() => onStartEdit(item)}>
            <div className="flex items-center gap-2">
                <p className="font-medium text-zinc-100">{item.name}</p>
                {(isRunningLow || status !== 'ok') && <span title={status === 'expired' ? 'Abgelaufen!' : (status === 'nearing' ? 'Läuft bald ab!' : `Wird knapp! Mindestmenge: ${item.minQuantity} ${item.unit}`)}><AlertTriangle size={14} className={status === 'expired' ? 'text-red-400' : 'text-yellow-400'}/></span>}
            </div>
            <p className="text-zinc-400 text-sm">
              {item.category && <span className="mr-3">{item.category}</span>}
              {item.expiryDate && <span title="Ablaufdatum">Ablauf: {new Date(item.expiryDate).toLocaleDateString('de-DE')}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <button onClick={() => onAdjustQuantity(item, -1)} aria-label={`Reduce quantity of ${item.name}`} className="p-1.5 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition-colors"><Minus size={14}/></button>
            <span className="font-mono w-20 text-center text-lg tabular-nums">{item.quantity} <span className="text-base text-zinc-400">{item.unit}</span></span>
            <button onClick={() => onAdjustQuantity(item, 1)} aria-label={`Increase quantity of ${item.name}`} className="p-1.5 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition-colors"><Plus size={14}/></button>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {isRunningLow && <button onClick={() => onAddToShoppingList(item)} aria-label={`Add ${item.name} to shopping list`} className="p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-amber-400"><ShoppingCart size={16} /></button>}
            <button onClick={() => onStartEdit(item)} aria-label={`Edit ${item.name}`} className="p-2 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">
              <Edit3 size={16} />
            </button>
          </div>
        </li>
    );
});

export default PantryListItem;