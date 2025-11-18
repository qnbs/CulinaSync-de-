import React from 'react';
import { PantryItem } from '../types';
import { Minus, Plus, Square, CheckSquare, Edit3, AlertTriangle, ShoppingCart, Calendar, Clock } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

// Improved date formatter for "In 3 days" style
const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    // Reset hours for accurate day diff
    date.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });
    return rtf.format(diffDays, 'day');
}

export const getExpiryStatus = (expiryDate?: string, warningDays: number = 3): 'expired' | 'nearing' | 'ok' => {
  if (!expiryDate) return 'ok';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0,0,0,0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= warningDays) return 'nearing';
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
    const { pantry: pantrySettings } = useAppSelector(state => state.settings);
    const expiryStatus = getExpiryStatus(item.expiryDate, pantrySettings.expiryWarningDays);
    const isRunningLow = item.minQuantity != null && item.quantity <= item.minQuantity;

    // Calculate fill percentage for the "stock bar"
    // If minQuantity exists, we use it as a reference point (e.g., bar is full if quantity >= 2*minQuantity)
    // If no minQuantity, we just visually represent "some" stock, capped at 100%
    const maxRef = item.minQuantity ? item.minQuantity * 2 : Math.max(10, item.quantity * 1.5);
    const fillPercent = Math.min(100, Math.max(5, (item.quantity / maxRef) * 100));
    
    let barColor = 'bg-emerald-500';
    if (isRunningLow) barColor = 'bg-amber-500';
    if (item.quantity === 0) barColor = 'bg-red-500';

    // Dynamic styling
    let containerClasses = 'group relative p-4 rounded-xl border transition-all duration-300 ';
    if (isSelected) {
        containerClasses += 'bg-[var(--color-accent-500)]/10 border-[var(--color-accent-500)] shadow-[0_0_15px_rgba(var(--color-accent-500),0.1)]';
    } else if (expiryStatus === 'expired') {
        containerClasses += 'bg-red-950/20 border-red-900/50 hover:border-red-700';
    } else {
        containerClasses += 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/80 hover:border-zinc-700';
    }

    return (
        <div className={containerClasses}>
            <div className="flex items-center gap-4">
                {isSelectMode && (
                    <button 
                        onClick={() => onToggleSelect(item.id!)} 
                        className={`flex-shrink-0 p-1 transition-colors ${isSelected ? 'text-[var(--color-accent-400)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {isSelected ? <CheckSquare size={22}/> : <Square size={22}/>}
                    </button>
                )}

                <div 
                    className="flex-grow min-w-0 cursor-pointer"
                    onClick={() => isSelectMode ? onToggleSelect(item.id!) : onStartEdit(item)}
                >
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-bold truncate text-lg ${item.quantity === 0 ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                            {item.name}
                        </h3>
                        {/* Status Badges */}
                        {expiryStatus === 'expired' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-500/20 text-red-400 border border-red-500/20">
                                <AlertTriangle size={10}/> Abgelaufen
                            </span>
                        )}
                        {expiryStatus === 'nearing' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-500/20 text-amber-400 border border-amber-500/20">
                                <Clock size={10}/> Läuft bald ab
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                         {item.expiryDate && (
                            <span className={`flex items-center gap-1.5 ${expiryStatus === 'expired' ? 'text-red-400 font-semibold' : ''}`}>
                                <Calendar size={14} className="opacity-70"/>
                                {formatRelativeTime(item.expiryDate)}
                            </span>
                        )}
                        {isRunningLow && (
                            <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                                <AlertTriangle size={14}/>
                                {item.quantity === 0 ? 'Leer' : 'Wird knapp'}
                            </span>
                        )}
                    </div>
                    
                    {/* Stock Level Bar */}
                    <div className="mt-3 h-1.5 w-full max-w-[200px] bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColor} ${isRunningLow ? 'animate-pulse' : ''}`} 
                            style={{ width: `${fillPercent}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden shadow-inner">
                        <button 
                            onClick={() => onAdjustQuantity(item, -1)} 
                            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors active:bg-zinc-700"
                        >
                            <Minus size={16}/>
                        </button>
                        <div className="w-16 text-center font-mono text-sm leading-none">
                            <div className="font-bold text-zinc-100">{item.quantity}</div>
                            <div className="text-[10px] text-zinc-500 truncate px-1">{item.unit}</div>
                        </div>
                        <button 
                            onClick={() => onAdjustQuantity(item, 1)} 
                            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-green-400 transition-colors active:bg-zinc-700"
                        >
                            <Plus size={16}/>
                        </button>
                    </div>

                    {/* Quick Actions (Show on Hover/Focus) */}
                    <div className="flex flex-col gap-1">
                         {isRunningLow && (
                            <button 
                                onClick={() => onAddToShoppingList(item)} 
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-[var(--color-accent-500)] text-zinc-400 hover:text-zinc-900 transition-all shadow-sm"
                                title="Zur Einkaufsliste"
                            >
                                <ShoppingCart size={18} />
                            </button>
                        )}
                        <button 
                            onClick={() => onStartEdit(item)} 
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all shadow-sm"
                            title="Bearbeiten"
                        >
                            <Edit3 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PantryListItem;