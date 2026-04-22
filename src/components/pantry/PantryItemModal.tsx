import React, { useState, useMemo, useRef } from 'react';
import { PantryItem } from '../../types';
import { foodDatabase, FoodEntry } from '../../data/foodDatabase';
import { Save } from 'lucide-react';
import { getCategoryForItem } from '../../services/utils';
import { useModalA11y } from '../../hooks/useModalA11y';
import { useTranslation } from 'react-i18next';

const DEFAULT_UNITS = ["Stück", "g", "kg", "ml", "l", "TL", "EL", "Dose", "Bund", "Zehen", "Flasche", "Packung"];

const createInitialFormData = (item?: PantryItem | null): Partial<PantryItem> => (
    item ? { ...item } : { name: '', quantity: 1, unit: 'Stück', category: '', expiryDate: '', minQuantity: undefined, notes: '' }
);

export const PantryItemModal: React.FC<{
    item?: PantryItem | null;
    onClose: () => void;
    onSave: (item: PantryItem) => void;
    pantryItems: PantryItem[];
}> = ({ item, onClose, onSave, pantryItems }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Partial<PantryItem>>(() => createInitialFormData(item));
    const nameInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useModalA11y({
        isOpen: true,
        onClose,
        containerRef: modalRef,
        initialFocusRef: nameInputRef,
    });

    const existingCategories = useMemo(() => Array.from(new Set(pantryItems.map(p => p.category).filter(Boolean))), [pantryItems]);
    
    const handleChange = (field: keyof PantryItem, value: PantryItem[keyof PantryItem] | undefined) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    // FoodDB-Autocomplete & Info
    const [foodMatch, setFoodMatch] = useState<FoodEntry | null>(null);
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const category = getCategoryForItem(name);
        setFormData(prev => ({ ...prev, name, category: prev.category || category }));
        // Suche nach passendem FoodEntry (exakt oder fuzzy)
        const match = foodDatabase.find(f => f.name.toLowerCase() === name.trim().toLowerCase())
            || foodDatabase.find(f => name && f.name.toLowerCase().startsWith(name.trim().toLowerCase()));
        setFoodMatch(match || null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) return;
        onSave(formData as PantryItem);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 page-fade-in glass-overlay" onClick={onClose}>
            <div
                ref={modalRef}
            className="rounded-lg p-6 w-full max-w-lg glass-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pantry-item-modal-title"
                tabIndex={-1}
            >
                <h3 id="pantry-item-modal-title" className="text-xl font-bold mb-6">{item ? t('pantry.modal.editTitle') : t('pantry.modal.newTitle')}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                           <label htmlFor="itemName" className="block text-sm font-medium text-zinc-400 mb-1">{t('pantry.modal.nameLabel')}</label>
                           <input
                               id="itemName"
                               ref={nameInputRef}
                               type="text"
                               value={formData.name || ''}
                               onChange={handleNameChange}
                               className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]"
                               required
                               list="food-autocomplete-list"
                           />
                           <datalist id="food-autocomplete-list">
                               {foodDatabase.map(f => <option key={f.id} value={f.name} />)}
                           </datalist>
                        </div>
                        <div>
                           <label htmlFor="itemCategory" className="block text-sm font-medium text-zinc-400 mb-1">{t('pantry.modal.categoryLabel')}</label>
                           <input id="itemCategory" type="text" value={formData.category || ''} onChange={e => handleChange('category', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" list="categories-list" />
                           <datalist id="categories-list">{existingCategories.map(c => <option key={c} value={c} />)}</datalist>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                           <label htmlFor="itemQuantity" className="block text-sm font-medium text-zinc-400 mb-1">{t('pantry.modal.quantityLabel')}</label>
                           <input id="itemQuantity" type="number" value={formData.quantity || ''} onChange={e => handleChange('quantity', parseFloat(e.target.value))} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" required min="0" step="any" />
                        </div>
                        <div>
                            <label htmlFor="itemUnit" className="block text-sm font-medium text-zinc-400 mb-1">{t('pantry.modal.unitLabel')}</label>
                            <input id="itemUnit" type="text" value={formData.unit || ''} onChange={e => handleChange('unit', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" required list="units-list"/>
                            <datalist id="units-list">{DEFAULT_UNITS.map(u => <option key={u} value={u}/>)}</datalist>
                        </div>
                        <div className="col-span-2">
                           <label htmlFor="itemExpiry" className="block text-sm font-medium text-zinc-400 mb-1">{t('pantry.modal.expiryDateLabel')}</label>
                           <input id="itemExpiry" type="date" value={formData.expiryDate || ''} onChange={e => handleChange('expiryDate', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="minQuantity" className="block text-sm font-medium text-zinc-400 mb-1">{t('pantry.modal.minQuantityLabel')}</label>
                        <input id="minQuantity" type="number" placeholder={t('pantry.modal.minQuantityPlaceholder')} value={formData.minQuantity || ''} onChange={e => handleChange('minQuantity', parseFloat(e.target.value) || undefined)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" min="0" step="any" />
                        <p className="text-xs text-zinc-500 mt-1">{t('pantry.modal.minQuantityHint')}</p>
                    </div>
                     <div>
                        <label htmlFor="itemNotes" className="block text-sm font-medium text-zinc-400 mb-1">{t('pantry.modal.notesLabel')}</label>
                        <textarea id="itemNotes" value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="w-full bg-zinc-700 rounded p-2 focus:ring-2 focus:ring-[var(--color-accent-500)]" rows={2}></textarea>
                    </div>
                    {foodMatch && (
                        <div className="bg-zinc-800 rounded-lg p-3 mb-2 text-xs text-zinc-300">
                            <div className="font-bold text-sm mb-1">{t('pantry.modal.nutritionTitle')}</div>
                            <div>{t('pantry.modal.nutritionSummary', { kcal: foodMatch.kcal, protein: foodMatch.protein, fat: foodMatch.fat, carbs: foodMatch.carbs })}</div>
                            {foodMatch.allergens?.length ? (
                                <div className="mt-1 text-red-400">{t('pantry.modal.allergensLabel')}: {foodMatch.allergens.join(', ')}</div>
                            ) : null}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">{t('common.cancel')}</button>
                        <button type="submit" className="flex items-center gap-2 py-2 px-4 rounded bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)]"><Save size={16}/> {t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};