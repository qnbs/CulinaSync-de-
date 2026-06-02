import i18next from 'i18next';

const SchemaType = {
  OBJECT: 'object',
  ARRAY: 'array',
  STRING: 'string',
  NUMBER: 'number',
} as const;

const schemaDesc = (key: string) => {
  const isEn = i18next.language?.startsWith('en');
  return i18next.t(`gemini.schema.${key}`, { lng: isEn ? 'en' : 'de' });
};

export const buildRecipeSchema = () => ({
  type: SchemaType.OBJECT,
  properties: {
    recipeTitle: { type: SchemaType.STRING, description: schemaDesc('recipeTitle') },
    shortDescription: { type: SchemaType.STRING, description: schemaDesc('shortDescription') },
    prepTime: { type: SchemaType.STRING, description: schemaDesc('prepTime') },
    cookTime: { type: SchemaType.STRING, description: schemaDesc('cookTime') },
    totalTime: { type: SchemaType.STRING, description: schemaDesc('totalTime') },
    servings: { type: SchemaType.STRING, description: schemaDesc('servings') },
    difficulty: { type: SchemaType.STRING, description: schemaDesc('difficulty') },
    ingredients: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          sectionTitle: { type: SchemaType.STRING, description: schemaDesc('sectionTitle') },
          items: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                quantity: { type: SchemaType.STRING },
                unit: { type: SchemaType.STRING },
                name: { type: SchemaType.STRING },
              },
            },
          },
        },
      },
    },
    instructions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: schemaDesc('instructions'),
    },
    nutritionPerServing: {
      type: SchemaType.OBJECT,
      properties: {
        calories: { type: SchemaType.STRING },
        protein: { type: SchemaType.STRING },
        fat: { type: SchemaType.STRING },
        carbs: { type: SchemaType.STRING },
      },
    },
    tags: {
      type: SchemaType.OBJECT,
      properties: {
        course: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        cuisine: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        occasion: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        mainIngredient: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        prepMethod: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        diet: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
    },
    expertTips: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING },
        },
      },
    },
  },
  propertyOrdering: [
    'recipeTitle', 'shortDescription', 'prepTime', 'cookTime', 'totalTime',
    'servings', 'difficulty', 'ingredients', 'instructions',
    'nutritionPerServing', 'tags', 'expertTips',
  ],
  required: ['recipeTitle', 'shortDescription', 'totalTime', 'servings', 'difficulty', 'ingredients', 'instructions'],
});

export const buildRecipeIdeasSchema = () => ({
  type: SchemaType.OBJECT,
  properties: {
    ideas: {
      type: SchemaType.ARRAY,
      description: schemaDesc('ideasList'),
      items: {
        type: SchemaType.OBJECT,
        properties: {
          recipeTitle: { type: SchemaType.STRING, description: schemaDesc('ideaTitle') },
          shortDescription: { type: SchemaType.STRING, description: schemaDesc('ideaShortDescription') },
        },
        required: ['recipeTitle', 'shortDescription'],
      },
    },
  },
  required: ['ideas'],
});

export const buildShoppingListSchema = () => ({
  type: SchemaType.OBJECT,
  properties: {
    items: {
      type: SchemaType.ARRAY,
      description: schemaDesc('shoppingItemsList'),
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: schemaDesc('itemName') },
          quantity: { type: SchemaType.NUMBER, description: schemaDesc('itemQuantity') },
          unit: { type: SchemaType.STRING, description: schemaDesc('itemUnit') },
          category: { type: SchemaType.STRING, description: schemaDesc('itemCategory') },
        },
        required: ['name', 'quantity', 'unit'],
      },
    },
  },
  required: ['items'],
});
