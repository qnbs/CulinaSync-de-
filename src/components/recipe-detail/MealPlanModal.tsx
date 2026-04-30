import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useModalA11y } from '../../hooks/useModalA11y';
import { addRecipeToMealPlan } from '../../services/repositories/mealPlanRepository';

interface MealPlanModalProps {
  recipeId: number;
  onClose: () => void;
  onSave: () => void;
}

export const MealPlanModal: React.FC<MealPlanModalProps> = ({recipeId, onClose, onSave}) => {
  const { t } = useTranslation();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState<'Frühstück' | 'Mittagessen' | 'Abendessen'>('Abendessen');
  const modalRef = React.useRef<HTMLDivElement>(null);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  useModalA11y({
    isOpen: true,
    onClose,
    containerRef: modalRef,
    initialFocusRef: dateInputRef,
  });

    const handleSave = async () => {
        await addRecipeToMealPlan({ recipeId, date, mealType });
        onSave();
        onClose();
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 glass-overlay" onClick={onClose}>
        <div ref={modalRef} className="rounded-lg p-6 w-full max-w-sm glass-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="mealplan-modal-title" tabIndex={-1}>
          <h3 id="mealplan-modal-title" className="text-lg font-bold mb-4">{t('recipeDetail.modal.addToMealPlanTitle')}</h3>
                <div className="space-y-4">
                    <div>
                <label htmlFor="date" className="block text-sm font-medium text-zinc-400 mb-1">{t('recipeDetail.modal.date')}</label>
              <input ref={dateInputRef} type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none"/>
                    </div>
                    <div>
                <label htmlFor="mealType" className="block text-sm font-medium text-zinc-400 mb-1">{t('recipeDetail.modal.mealType')}</label>
              <select id="mealType" value={mealType} onChange={e => setMealType(e.target.value as 'Frühstück' | 'Mittagessen' | 'Abendessen')} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none">
                  <option value="Frühstück">{t('recipeDetail.mealType.breakfast')}</option>
                  <option value="Mittagessen">{t('recipeDetail.mealType.lunch')}</option>
                  <option value="Abendessen">{t('recipeDetail.mealType.dinner')}</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">{t('common.cancel')}</button>
            <button type="button" onClick={handleSave} className="py-2 px-4 rounded-md bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)]">{t('common.save')}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}