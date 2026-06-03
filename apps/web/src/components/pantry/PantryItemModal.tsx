import React, { useState, useMemo, useRef } from 'react';
import { PantryItem } from '../../types';
import { foodDatabase, FoodEntry } from '../../data/foodDatabase';
import { Save } from 'lucide-react';
import { getCategoryForItem } from '../../services/utils';
import { useTranslation } from 'react-i18next';
import {
  findFoodEntryByName,
  formatFoodAllergens,
  getFoodDisplayName,
  pantryCategoryLabelForFood,
} from '../../utils/foodDatabaseLabels';
import { Button, Card, Input, Modal, Textarea } from '../ui';

const UNIT_KEYS = ['piece', 'gram', 'kilogram', 'milliliter', 'liter', 'teaspoon', 'tablespoon', 'can', 'bunch', 'clove', 'bottle', 'package'] as const;

const createInitialFormData = (item: PantryItem | null | undefined, defaultUnit: string): Partial<PantryItem> => (
    item ? { ...item } : { name: '', quantity: 1, unit: defaultUnit, category: '', expiryDate: '', minQuantity: undefined, notes: '' }
);

export const PantryItemModal: React.FC<{
    item?: PantryItem | null;
    onClose: () => void;
    onSave: (item: PantryItem) => void;
    pantryItems: PantryItem[];
}> = ({ item, onClose, onSave, pantryItems }) => {
    const { t } = useTranslation();
    const defaultUnit = t('pantryUnits.piece');
    const [formData, setFormData] = useState<Partial<PantryItem>>(() => createInitialFormData(item, defaultUnit));
    const nameInputRef = useRef<HTMLInputElement>(null);
    const unitOptions = useMemo(
      () => UNIT_KEYS.map((key) => ({ key, label: t(`pantryUnits.${key}`) })),
      [t],
    );

    const existingCategories = useMemo(() => Array.from(new Set(pantryItems.map(p => p.category).filter(Boolean))), [pantryItems]);
    
    const handleChange = (field: keyof PantryItem, value: PantryItem[keyof PantryItem] | undefined) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const [foodMatch, setFoodMatch] = useState<FoodEntry | null>(null);
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const category = getCategoryForItem(name);
        const match = findFoodEntryByName(name, t);
        setFoodMatch(match || null);
        setFormData((prev) => ({
          ...prev,
          name,
          category: prev.category || category || (match ? pantryCategoryLabelForFood(match, t) : ''),
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) return;
        onSave(formData as PantryItem);
    };

    return (
        <Modal
            open
            onClose={onClose}
            title={item ? t('pantry.modal.editTitle') : t('pantry.modal.newTitle')}
            size="lg"
            initialFocusRef={nameInputRef}
            footer={
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" form="pantry-item-form" className="gap-2">
                        <Save size={16} aria-hidden />
                        {t('common.save')}
                    </Button>
                </div>
            }
        >
            <form id="pantry-item-form" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                        <Input
                            ref={nameInputRef}
                            id="itemName"
                            label={t('pantry.modal.nameLabel')}
                            value={formData.name || ''}
                            onChange={handleNameChange}
                            required
                            list="food-autocomplete-list"
                        />
                        <datalist id="food-autocomplete-list">
                            {foodDatabase.map(f => (
                              <option key={f.id} value={getFoodDisplayName(f.id, t)} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <Input
                            id="itemCategory"
                            label={t('pantry.modal.categoryLabel')}
                            type="text"
                            value={formData.category || ''}
                            onChange={e => handleChange('category', e.target.value)}
                            list="categories-list"
                        />
                        <datalist id="categories-list">{existingCategories.map(c => <option key={c} value={c} />)}</datalist>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Input
                        id="itemQuantity"
                        label={t('pantry.modal.quantityLabel')}
                        type="number"
                        value={
                          formData.quantity != null && !Number.isNaN(formData.quantity)
                            ? formData.quantity
                            : ''
                        }
                        onChange={e => {
                          const parsed = parseFloat(e.target.value);
                          handleChange('quantity', Number.isNaN(parsed) ? undefined : parsed);
                        }}
                        required
                        min={0}
                        step="any"
                    />
                    <div>
                        <Input
                            id="itemUnit"
                            label={t('pantry.modal.unitLabel')}
                            type="text"
                            value={formData.unit || ''}
                            onChange={e => handleChange('unit', e.target.value)}
                            required
                            list="units-list"
                        />
                        <datalist id="units-list">{unitOptions.map(u => <option key={u.key} value={u.label}/>)}</datalist>
                    </div>
                    <div className="col-span-2">
                        <Input
                            id="itemExpiry"
                            label={t('pantry.modal.expiryDateLabel')}
                            type="date"
                            value={formData.expiryDate || ''}
                            onChange={e => handleChange('expiryDate', e.target.value)}
                        />
                    </div>
                </div>
                <Input
                    id="minQuantity"
                    label={t('pantry.modal.minQuantityLabel')}
                    type="number"
                    placeholder={t('pantry.modal.minQuantityPlaceholder')}
                    value={formData.minQuantity ?? ''}
                    onChange={e => handleChange('minQuantity', parseFloat(e.target.value) || undefined)}
                    hint={t('pantry.modal.minQuantityHint')}
                    min={0}
                    step="any"
                />
                <Textarea
                    id="itemNotes"
                    label={t('pantry.modal.notesLabel')}
                    value={formData.notes || ''}
                    onChange={e => handleChange('notes', e.target.value)}
                    rows={2}
                />
                {foodMatch && (
                    <Card variant="flat" padding="sm" className="text-xs text-zinc-300">
                        <div className="font-bold text-sm mb-1">{t('pantry.modal.nutritionTitle')}</div>
                        <div>{t('pantry.modal.nutritionSummary', { kcal: foodMatch.kcal, protein: foodMatch.protein, fat: foodMatch.fat, carbs: foodMatch.carbs })}</div>
                        {foodMatch.allergenCodes?.length ? (
                            <div className="mt-1 text-red-400">{t('pantry.modal.allergensLabel')}: {formatFoodAllergens(foodMatch.allergenCodes, t)}</div>
                        ) : null}
                    </Card>
                )}
            </form>
        </Modal>
    );
};
