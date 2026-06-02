import type { TFunction } from 'i18next';

export const PANTRY_CATEGORY_IDS = [
  'fruitsVegetables',
  'dairy',
  'meat',
  'grainsLegumes',
  'fatsOils',
  'bakery',
  'nutsSeeds',
] as const;

export type PantryCategoryId = (typeof PANTRY_CATEGORY_IDS)[number];

const SHOPPING_CATEGORY_IDS = [
  'misc',
  'dairy',
  'produce',
  'meat',
  'bakery',
  'dryGoods',
  'oils',
  'canned',
  'spices',
] as const;

export const isPantryCategoryId = (value: string): value is PantryCategoryId =>
  (PANTRY_CATEGORY_IDS as readonly string[]).includes(value);

/** Resolves stored category (key, legacy German label, or translated shopping label) for display. */
export const resolvePantryCategoryLabel = (category: string | undefined, t: TFunction): string => {
  if (!category) {
    return t('shoppingList.categories.misc');
  }

  if (isPantryCategoryId(category)) {
    return t(`pantry.categories.${category}`);
  }

  if (category.startsWith('shoppingList.categories.')) {
    return t(category);
  }

  for (const id of PANTRY_CATEGORY_IDS) {
    if (category === t(`pantry.categories.${id}`, { lng: 'de' })) {
      return t(`pantry.categories.${id}`);
    }
  }

  for (const id of SHOPPING_CATEGORY_IDS) {
    if (category === t(`shoppingList.categories.${id}`, { lng: 'de' })) {
      return t(`shoppingList.categories.${id}`);
    }
    if (category === t(`shoppingList.categories.${id}`)) {
      return category;
    }
  }

  return category;
};
