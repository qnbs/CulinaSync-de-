import type { TFunction } from 'i18next';
import { foodDatabase, type FoodEntry } from '../data/foodDatabase';
import i18next from 'i18next';
import { resolvePantryCategoryLabel } from './categoryLabels';

export const getFoodDisplayName = (id: string, t: TFunction): string =>
  t(`foodDatabase.items.${id}.name`, { defaultValue: id });

export const formatFoodAllergens = (codes: string[] | undefined, t: TFunction): string =>
  (codes ?? []).map((code) => t(`foodDatabase.allergens.${code}`, { defaultValue: code })).join(', ');

export const findFoodEntryByName = (name: string, t: TFunction): FoodEntry | undefined => {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return undefined;

  return foodDatabase.find((entry) => {
    const displayName = getFoodDisplayName(entry.id, t).toLowerCase();
    const displayNameDe = getFoodDisplayName(entry.id, i18next.getFixedT('de')).toLowerCase();
    const displayNameEn = getFoodDisplayName(entry.id, i18next.getFixedT('en')).toLowerCase();
    return (
      displayName === trimmed
      || displayName.startsWith(trimmed)
      || displayNameDe === trimmed
      || displayNameDe.startsWith(trimmed)
      || displayNameEn === trimmed
      || displayNameEn.startsWith(trimmed)
    );
  });
};

export const pantryCategoryLabelForFood = (entry: FoodEntry, t: TFunction): string =>
  resolvePantryCategoryLabel(entry.category, t);
