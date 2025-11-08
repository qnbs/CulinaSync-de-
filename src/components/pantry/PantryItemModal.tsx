import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PantryItem } from '../../types';
import { Save } from 'lucide-react';
import { getCategoryForItem } from '../../services/utils';

const DEFAULT_UNITS = ["Stück", "g", "kg", "ml", "l", "TL", "EL", "Dose", "Bund", "Zehen", "Flasche", "Packung"];

export const PantryItemModal: React.FC<{
    isOpen: boolean;
    item?: PantryItem | null;
    onClose: () => void;
    onSave: (item: PantryItem) => void;
    pantryItems: PantryItem[];
}> = ({ isOpen, item, onClose, onSave, pantryItems }) => {
    const [formData, setFormData] = useState<Partial<PantryItem>>({});
    const nameInputRef = useRef<HTMLInputElement>(null);

    const existingCategories = useMemo(() => Array.from(new Set(pantryItems.map(p => p.category).filter(Boolean))), [pantryItems]);

    useEffect(() => {
        if (isOpen) {
            setFormData(item ? { ...item } : { name: '', quantity: 1, unit: 'Stück', category: '', expiryDate: '', minQuantity: undefined, notes: '' });
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [isOpen, item]);
    
    const handleChange = (field: keyof PantryItem, value: any) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const category = getCategoryForItem(name);
        setFormData(prev => ({ ...prev, name, category: prev.category || category }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) return;
        onSave(formData as PantryItem);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6">{item ? 'Artikel bearbeiten' : 'Neuer Artikel im Vorrat'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                           <label htmlFor="itemName" className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                           <input id="itemName" ref={nameInputRef} type="text" value={formData.name || ''} onChange={handleNameChange} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" required />
                        </div>
                        <div>
                           <label htmlFor="itemCategory" className="block text-sm font-medium text-zinc-400 mb-1">Kategorie</label>
                           <input id="itemCategory" type="text" value={formData.category || ''} onChange={e => handleChange('category', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" list="categories-list" />
                           <datalist id="categories-list">{existingCategories.map(c => <option key={c} value={c} />)}</datalist>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                           <label htmlFor="itemQuantity" className="block text-sm font-medium text-zinc-400 mb-1">Menge</label>
                           <input id="itemQuantity" type="number" value={formData.quantity || ''} onChange={e => handleChange('quantity', parseFloat(e.target.value))} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" required min="0" step="any" />
                        </div>
                        <div>
                            <label htmlFor="itemUnit" className="block text-sm font-medium text-zinc-400 mb-1">Einheit</label>
                            <input id="itemUnit" type="text" value={formData.unit || ''} onChange={e => handleChange('unit', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" required list="units-list"/>
                            <datalist id="units-list">{DEFAULT_UNITS.map(u => <option key={u} value={u}/>)}</datalist>
                        </div>
                        <div className="col-span-2">
                           <label htmlFor="itemExpiry" className="block text-sm font-medium text-zinc-400 mb-1">Ablaufdatum (optional)</label>
                           <input id="itemExpiry" type="date" value={formData.expiryDate || ''} onChange={e => handleChange('expiryDate', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="minQuantity" className="block text-sm font-medium text-zinc-400 mb-1">Mindestmenge (optional)</label>
                        <input id="minQuantity" type="number" placeholder="z.B. 1" value={formData.minQuantity || ''} onChange={e => handleChange('minQuantity', parseFloat(e.target.value) || undefined)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" min="0" step="any" />
                        <p className="text-xs text-zinc-500 mt-1">Wenn die Menge darunter fällt, wird eine Warnung angezeigt.</p>
                    </div>
                     <div>
                        <label htmlFor="itemNotes" className="block text-sm font-medium text-zinc-400 mb-1">Notizen (optional)</label>
                        <textarea id="itemNotes" value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" rows={2}></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                        <button type="submit" className="flex items-center gap-2 py-2 px-4 rounded bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)]"><Save size={16}/> Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};