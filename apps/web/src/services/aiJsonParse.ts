import { z } from 'zod';

const recipeIdeaSchema = z.object({
  recipeTitle: z.string(),
  shortDescription: z.string(),
});

export const recipeIdeasResponseSchema = z.object({
  ideas: z.array(recipeIdeaSchema).min(1),
});

const ingredientItemSchema = z.object({
  quantity: z.string(),
  unit: z.string(),
  name: z.string(),
});

const ingredientGroupSchema = z.object({
  sectionTitle: z.string(),
  items: z.array(ingredientItemSchema),
});

const nutritionPerServingSchema = z.object({
  calories: z.string(),
  protein: z.string(),
  fat: z.string(),
  carbs: z.string(),
});

const tagsSchema = z.object({
  course: z.array(z.string()),
  cuisine: z.array(z.string()),
  occasion: z.array(z.string()),
  mainIngredient: z.array(z.string()),
  prepMethod: z.array(z.string()),
  diet: z.array(z.string()),
});

const expertTipSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const recipeAiSchema = z.object({
  recipeTitle: z.string(),
  shortDescription: z.string(),
  prepTime: z.string(),
  cookTime: z.string(),
  totalTime: z.string(),
  servings: z.string(),
  difficulty: z.string(),
  ingredients: z.array(ingredientGroupSchema),
  instructions: z.array(z.string()),
  nutritionPerServing: nutritionPerServingSchema,
  tags: tagsSchema,
  expertTips: z.array(expertTipSchema),
});

export const shoppingListGenerationSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().finite(),
      unit: z.string(),
      category: z.string().optional(),
    }),
  ),
});

export const geminiNutritionVerificationSchema = z.object({
  summary: z.string(),
  warnings: z.array(z.string()),
});

export const parseAiJsonWithSchema = <T>(jsonText: string, schema: z.ZodType<T>): T => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('invalid JSON');
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error('invalid structure');
  }
  return result.data;
};
