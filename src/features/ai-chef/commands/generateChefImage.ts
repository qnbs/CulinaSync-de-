import { getAppServices } from '../../../services/serviceRegistry';

export const generateChefImage = (recipeTitle: string) => getAppServices().ai.generateRecipeImage(recipeTitle);