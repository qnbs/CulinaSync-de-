// Erweiterte lokale Lebensmitteldatenbank mit Nährwerten und Allergenen
// Quelle: Open Food Facts, USDA, eigene Ergänzungen

export interface FoodEntry {
  id: string;
  name: string;
  category: string;
  kcal: number;
  protein: number; // g pro 100g
  fat: number;     // g pro 100g
  carbs: number;   // g pro 100g
  allergens?: string[];
}

export const foodDatabase: FoodEntry[] = [
  { id: 'apple', name: 'Apfel', category: 'Obst & Gemüse', kcal: 52, protein: 0.3, fat: 0.2, carbs: 11.4 },
  { id: 'banana', name: 'Banane', category: 'Obst & Gemüse', kcal: 89, protein: 1.1, fat: 0.3, carbs: 20.2 },
  { id: 'egg', name: 'Ei', category: 'Milchprodukte & Eier', kcal: 155, protein: 13, fat: 11, carbs: 1.1, allergens: ['Ei'] },
  { id: 'milk', name: 'Milch', category: 'Milchprodukte & Eier', kcal: 64, protein: 3.3, fat: 3.6, carbs: 4.8, allergens: ['Milch'] },
  { id: 'bread', name: 'Brot', category: 'Backwaren', kcal: 250, protein: 8, fat: 1.2, carbs: 49 },
  { id: 'butter', name: 'Butter', category: 'Fette & Öle', kcal: 717, protein: 0.9, fat: 81, carbs: 0.1, allergens: ['Milch'] },
  { id: 'cheese', name: 'Käse', category: 'Milchprodukte & Eier', kcal: 350, protein: 25, fat: 28, carbs: 1.5, allergens: ['Milch'] },
  { id: 'chicken_breast', name: 'Hähnchenbrust', category: 'Fleisch & Fisch', kcal: 110, protein: 23, fat: 1.2, carbs: 0 },
  { id: 'salmon', name: 'Lachs', category: 'Fleisch & Fisch', kcal: 208, protein: 20, fat: 13, carbs: 0 },
  { id: 'rice', name: 'Reis', category: 'Getreide & Hülsenfrüchte', kcal: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  { id: 'pasta', name: 'Pasta', category: 'Getreide & Hülsenfrüchte', kcal: 131, protein: 5, fat: 1.1, carbs: 25 },
  { id: 'tomato', name: 'Tomate', category: 'Obst & Gemüse', kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  { id: 'potato', name: 'Kartoffel', category: 'Obst & Gemüse', kcal: 77, protein: 2, fat: 0.1, carbs: 17 },
  { id: 'almond', name: 'Mandel', category: 'Nüsse & Samen', kcal: 579, protein: 21, fat: 50, carbs: 22, allergens: ['Schalenfrüchte'] },
  { id: 'hazelnut', name: 'Haselnuss', category: 'Nüsse & Samen', kcal: 628, protein: 15, fat: 61, carbs: 17, allergens: ['Schalenfrüchte'] },
  { id: 'soy', name: 'Soja', category: 'Getreide & Hülsenfrüchte', kcal: 446, protein: 36, fat: 20, carbs: 30, allergens: ['Soja'] },
  { id: 'wheat', name: 'Weizen', category: 'Getreide & Hülsenfrüchte', kcal: 327, protein: 12, fat: 1.5, carbs: 61, allergens: ['Gluten'] },
  { id: 'peanut', name: 'Erdnuss', category: 'Nüsse & Samen', kcal: 567, protein: 26, fat: 49, carbs: 16, allergens: ['Erdnuss'] },
  { id: 'shrimp', name: 'Garnele', category: 'Fleisch & Fisch', kcal: 99, protein: 24, fat: 0.3, carbs: 0.2, allergens: ['Krebstiere'] },
  // ... weitere Lebensmittel ...
];
