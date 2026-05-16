// Health Connect Service: Export zu Apple Health, Google Fit, Samsung Health
// Privacy-first: Nur lokale Berechnung, Export als Health-CSV/JSON für Import in Health-Apps
import { NutritionAllergyReport } from './nutritionAllergyService';
import { sanitizeCsvCell } from './exportService';

export type HealthExportType = 'apple' | 'google' | 'samsung';

export interface HealthExportOptions {
  type: HealthExportType;
  date: string; // ISO
  nutrition: NutritionAllergyReport;
  mealName?: string;
}

const getHealthCsvHeaders = (type: HealthExportType) => {
  switch(type) {
    case 'apple':
      return 'Type,Start,End,Value,Unit,Meal';
    case 'google':
      return 'Date,Calories,Protein,Fat,Carbs,Meal';
    case 'samsung':
      return 'Date,Calories,Protein,Fat,Carbs,Meal';
    default:
      return 'Date,Calories,Protein,Fat,Carbs,Meal';
  }
};

const serializeCsvValue = (value: unknown) => {
  const sanitizedValue = sanitizeCsvCell(value);

  if (sanitizedValue === null || sanitizedValue === undefined) {
    return '';
  }

  const normalizedValue = String(sanitizedValue);
  const escapedValue = normalizedValue.replace(/"/g, '""');
  return `"${escapedValue}"`;
};

const serializeCsvRow = (values: unknown[]) => values.map(serializeCsvValue).join(',');

export const exportNutritionToHealthCsv = (opts: HealthExportOptions) => {
  const { type, date, nutrition, mealName } = opts;
  let csv = getHealthCsvHeaders(type) + '\n';
  if(type === 'apple') {
    csv += serializeCsvRow([
      'DietaryEnergyConsumed', date, date, nutrition.calories, 'kcal', mealName || ''
    ]) + '\n';
    csv += serializeCsvRow([
      'DietaryProtein', date, date, nutrition.protein, 'g', mealName || ''
    ]) + '\n';
    csv += serializeCsvRow([
      'DietaryFatTotal', date, date, nutrition.fat, 'g', mealName || ''
    ]) + '\n';
    csv += serializeCsvRow([
      'DietaryCarbohydrates', date, date, nutrition.carbs, 'g', mealName || ''
    ]) + '\n';
  } else {
    csv += serializeCsvRow([date, nutrition.calories, nutrition.protein, nutrition.fat, nutrition.carbs, mealName || '']) + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `culinasync_nutrition_${type}_${date}.csv`;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const exportNutritionToHealthJson = (opts: HealthExportOptions) => {
  const { type, date, nutrition, mealName } = opts;
  const json = {
    type,
    date,
    meal: mealName,
    calories: nutrition.calories,
    protein: nutrition.protein,
    fat: nutrition.fat,
    carbs: nutrition.carbs,
    allergens: nutrition.allergens
  };
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `culinasync_nutrition_${type}_${date}.json`;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
