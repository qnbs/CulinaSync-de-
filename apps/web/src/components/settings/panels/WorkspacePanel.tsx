import React from 'react';
import { BookOpen, CalendarDays, ChefHat, Refrigerator, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppSettings } from '../../../types';
import { SettingsToggle } from '../SettingsToggle';

interface WorkspacePanelProps {
  settings: AppSettings;
  onChange: (path: string, value: unknown) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ settings, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 page-fade-in">
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Refrigerator size={16} /> {t('settings.workspace.pantryTitle')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 glass-card rounded-xl">
            <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.workspace.pantrySortLabel')}</label>
            <select
              value={settings.pantry.defaultSort}
              onChange={(e) => onChange('pantry.defaultSort', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
            >
              <option value="name">{t('settings.workspace.sort.name')}</option>
              <option value="expiryDate">{t('settings.workspace.sort.expiry')}</option>
              <option value="updatedAt">{t('settings.workspace.sort.updated')}</option>
              <option value="createdAt">{t('settings.workspace.sort.created')}</option>
            </select>
          </div>
          <div className="p-4 glass-card rounded-xl">
            <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.workspace.unitSystemLabel')}</label>
            <select
              value={settings.pantry.unitSystem}
              onChange={(e) => onChange('pantry.unitSystem', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
            >
              <option value="metric">{t('settings.workspace.unitMetric')}</option>
              <option value="imperial">{t('settings.workspace.unitImperial')}</option>
            </select>
          </div>
        </div>
        <SettingsToggle
          label={t('settings.workspace.pantryGroupedLabel')}
          description={t('settings.workspace.pantryGroupedDesc')}
          checked={settings.pantry.isGrouped}
          onToggle={() => onChange('pantry.isGrouped', !settings.pantry.isGrouped)}
        />
        <SettingsToggle
          label={t('settings.workspace.expiryBadgesLabel')}
          description={t('settings.workspace.expiryBadgesDesc')}
          checked={settings.pantry.showExpiryBadges}
          onToggle={() => onChange('pantry.showExpiryBadges', !settings.pantry.showExpiryBadges)}
        />
        <SettingsToggle
          label={t('settings.workspace.lowStockLabel')}
          description={t('settings.workspace.lowStockDesc')}
          checked={settings.pantry.highlightLowStock}
          onToggle={() => onChange('pantry.highlightLowStock', !settings.pantry.highlightLowStock)}
        />
        <div className="p-4 glass-card rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-zinc-200">{t('settings.modules.expiryWarning')}</span>
            <span className="font-mono text-[var(--color-accent-400)]">
              {t('settings.modules.expiryDays', { count: settings.pantry.expiryWarningDays })}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={settings.pantry.expiryWarningDays}
            onChange={(e) => onChange('pantry.expiryWarningDays', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={16} /> {t('settings.workspace.recipeTitle')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 glass-card rounded-xl">
            <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.workspace.recipeSortLabel')}</label>
            <select
              value={settings.recipeBook.defaultSort}
              onChange={(e) => onChange('recipeBook.defaultSort', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
            >
              <option value="newest">{t('settings.workspace.recipeSort.newest')}</option>
              <option value="favorites">{t('settings.workspace.recipeSort.favorites')}</option>
              <option value="a-z">{t('settings.workspace.recipeSort.az')}</option>
              <option value="z-a">{t('settings.workspace.recipeSort.za')}</option>
            </select>
          </div>
          <div className="p-4 glass-card rounded-xl">
            <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.workspace.recipeViewLabel')}</label>
            <select
              value={settings.recipeBook.defaultView}
              onChange={(e) => onChange('recipeBook.defaultView', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
            >
              <option value="grid">{t('settings.workspace.recipeView.grid')}</option>
              <option value="list">{t('settings.workspace.recipeView.list')}</option>
            </select>
          </div>
        </div>
        <SettingsToggle
          label={t('settings.workspace.nutritionPreviewLabel')}
          description={t('settings.workspace.nutritionPreviewDesc')}
          checked={settings.recipeBook.showNutritionPreview}
          onToggle={() => onChange('recipeBook.showNutritionPreview', !settings.recipeBook.showNutritionPreview)}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <ShoppingCart size={16} /> {t('settings.workspace.shoppingTitle')}
        </h3>
        <div className="p-4 glass-card rounded-xl">
          <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.workspace.shoppingSortLabel')}</label>
          <select
            value={settings.shoppingList.defaultSort}
            onChange={(e) => onChange('shoppingList.defaultSort', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
          >
            <option value="category">{t('settings.workspace.shoppingSort.category')}</option>
            <option value="alpha">{t('settings.workspace.shoppingSort.alpha')}</option>
          </select>
        </div>
        <SettingsToggle
          label={t('settings.modules.autoCategorizeLabel')}
          description={t('settings.modules.autoCategorizeDesc')}
          checked={settings.shoppingList.autoCategorize}
          onToggle={() => onChange('shoppingList.autoCategorize', !settings.shoppingList.autoCategorize)}
        />
        <SettingsToggle
          label={t('settings.workspace.checkedBottomLabel')}
          description={t('settings.workspace.checkedBottomDesc')}
          checked={settings.shoppingList.groupCheckedAtBottom}
          onToggle={() => onChange('shoppingList.groupCheckedAtBottom', !settings.shoppingList.groupCheckedAtBottom)}
        />
        <SettingsToggle
          label={t('settings.workspace.mergeDuplicatesLabel')}
          description={t('settings.workspace.mergeDuplicatesDesc')}
          checked={settings.shoppingList.smartMergeDuplicates}
          onToggle={() => onChange('shoppingList.smartMergeDuplicates', !settings.shoppingList.smartMergeDuplicates)}
        />
        <SettingsToggle
          label={t('settings.workspace.suggestQuantitiesLabel')}
          description={t('settings.workspace.suggestQuantitiesDesc')}
          checked={settings.shoppingList.suggestQuantitiesFromRecipes}
          onToggle={() =>
            onChange('shoppingList.suggestQuantitiesFromRecipes', !settings.shoppingList.suggestQuantitiesFromRecipes)
          }
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <CalendarDays size={16} /> {t('settings.workspace.mealPlannerTitle')}
        </h3>
        <SettingsToggle
          label={t('settings.workspace.varietyLabel')}
          description={t('settings.workspace.varietyDesc')}
          checked={settings.mealPlanner.preferVariety}
          onToggle={() => onChange('mealPlanner.preferVariety', !settings.mealPlanner.preferVariety)}
        />
        <SettingsToggle
          label={t('settings.workspace.expiryPlanLabel')}
          description={t('settings.workspace.expiryPlanDesc')}
          checked={settings.mealPlanner.respectExpiryDates}
          onToggle={() => onChange('mealPlanner.respectExpiryDates', !settings.mealPlanner.respectExpiryDates)}
        />
        <SettingsToggle
          label={t('settings.workspace.pantrySuggestLabel')}
          description={t('settings.workspace.pantrySuggestDesc')}
          checked={settings.mealPlanner.suggestFromPantry}
          onToggle={() => onChange('mealPlanner.suggestFromPantry', !settings.mealPlanner.suggestFromPantry)}
        />
        <div className="p-4 glass-card rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-zinc-200">{t('settings.workspace.avoidRepeatLabel')}</span>
            <span className="font-mono text-[var(--color-accent-400)]">
              {t('settings.workspace.avoidRepeatDays', { count: settings.mealPlanner.avoidRepeatWithinDays })}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={settings.mealPlanner.avoidRepeatWithinDays}
            onChange={(e) => onChange('mealPlanner.avoidRepeatWithinDays', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <ChefHat size={16} /> {t('settings.workspace.cookModeTitle')}
        </h3>
        <SettingsToggle
          label={t('settings.workspace.cookAiLabel')}
          description={t('settings.workspace.cookAiDesc')}
          checked={settings.cookMode.aiAssistantEnabled}
          onToggle={() => onChange('cookMode.aiAssistantEnabled', !settings.cookMode.aiAssistantEnabled)}
        />
        <SettingsToggle
          label={t('settings.workspace.cookAutoAdvanceLabel')}
          description={t('settings.workspace.cookAutoAdvanceDesc')}
          checked={settings.cookMode.autoAdvanceSteps}
          onToggle={() => onChange('cookMode.autoAdvanceSteps', !settings.cookMode.autoAdvanceSteps)}
        />
        <SettingsToggle
          label={t('settings.workspace.cookTimerSoundLabel')}
          description={t('settings.workspace.cookTimerSoundDesc')}
          checked={settings.cookMode.timerSoundEnabled}
          onToggle={() => onChange('cookMode.timerSoundEnabled', !settings.cookMode.timerSoundEnabled)}
        />
        <SettingsToggle
          label={t('settings.workspace.cookWakeLockLabel')}
          description={t('settings.workspace.cookWakeLockDesc')}
          checked={settings.cookMode.keepScreenAwake}
          onToggle={() => onChange('cookMode.keepScreenAwake', !settings.cookMode.keepScreenAwake)}
        />
        <SettingsToggle
          label={t('settings.workspace.cookChecklistLabel')}
          description={t('settings.workspace.cookChecklistDesc')}
          checked={settings.cookMode.showIngredientChecklist}
          onToggle={() => onChange('cookMode.showIngredientChecklist', !settings.cookMode.showIngredientChecklist)}
        />
      </section>
    </div>
  );
};
