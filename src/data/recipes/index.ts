import { Recipe } from '@/types';
import { germanAustrianRecipes } from './german-austrian';
import { frenchRecipes } from './french';
import { italianRecipes } from './italian';
import { spanishPortugueseRecipes } from './spanish-portuguese';
import { asianRecipes } from './asian';
import { internationalRecipes } from './international';
import { bakingDessertsRecipes } from './baking-desserts';
import { breakfastBrunchRecipes } from './breakfast-brunch';

export const allSeedRecipes: Recipe[] = [
    ...germanAustrianRecipes,
    ...frenchRecipes,
    ...italianRecipes,
    ...spanishPortugueseRecipes,
    ...asianRecipes,
    ...internationalRecipes,
    ...bakingDessertsRecipes,
    ...breakfastBrunchRecipes,
];
