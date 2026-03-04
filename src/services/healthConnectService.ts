// Health Connect Service: Export zu Apple Health, Google Fit, Samsung Health
// Privacy-first: Nur lokale Berechnung, Export als Health-CSV/JSON für Import in Health-Apps
import { NutritionAllergyReport } from './nutritionAllergyService';

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

export const exportNutritionToHealthCsv = (opts: HealthExportOptions) => {
  const { type, date, nutrition, mealName } = opts;
  let csv = getHealthCsvHeaders(type) + '\n';
  if(type === 'apple') {
    csv += [
      'DietaryEnergyConsumed', date, date, nutrition.calories, 'kcal', mealName || ''
    ].join(',') + '\n';
    csv += [
      'DietaryProtein', date, date, nutrition.protein, 'g', mealName || ''
    ].join(',') + '\n';
    csv += [
      'DietaryFatTotal', date, date, nutrition.fat, 'g', mealName || ''
    ].join(',') + '\n';
    csv += [
      'DietaryCarbohydrates', date, date, nutrition.carbs, 'g', mealName || ''
    ].join(',') + '\n';
  } else {
    csv += [date, nutrition.calories, nutrition.protein, nutrition.fat, nutrition.carbs, mealName || ''].join(',') + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `culinasync_nutrition_${type}_${date}.csv`;
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
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
