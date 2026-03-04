import DOMPurify from 'dompurify';
import type { Recipe, IngredientItem } from '../types';

const defaultRecipe = (): Recipe => ({
  recipeTitle: 'Imported recipe',
  shortDescription: 'Automatically imported recipe.',
  prepTime: '15 Min.',
  cookTime: '30 Min.',
  totalTime: '45 Min.',
  servings: '4 servings',
  difficulty: 'Medium',
  ingredients: [{ sectionTitle: 'Ingredients', items: [] }],
  instructions: [],
  nutritionPerServing: { calories: '', protein: '', fat: '', carbs: '' },
  tags: {
    course: [],
    cuisine: [],
    occasion: [],
    mainIngredient: [],
    prepMethod: [],
    diet: [],
  },
  expertTips: [],
});

const sanitizeText = (text: string): string => text.replace(/\s+/g, ' ').trim();

const isoDurationToGerman = (duration?: string): string => {
  if (!duration || typeof duration !== 'string') return '';
  const m = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return '';
  const hours = Number(m[1] || 0);
  const minutes = Number(m[2] || 0);
  if (hours > 0 && minutes > 0) return `${hours} Std. ${minutes} Min.`;
  if (hours > 0) return `${hours} Std.`;
  if (minutes > 0) return `${minutes} Min.`;
  return '';
};

const parseIngredientLine = (line: string): IngredientItem => {
  const cleaned = sanitizeText(line);
  const match = cleaned.match(/^(\d+[\d.,/\s]*)\s*([a-zA-ZäöüÄÖÜß.]+)?\s+(.+)$/);
  if (!match) {
    return { quantity: '', unit: '', name: cleaned };
  }

  return {
    quantity: (match[1] || '').trim(),
    unit: (match[2] || '').trim(),
    name: (match[3] || cleaned).trim(),
  };
};

const normalizeInstructions = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((step) => {
      if (typeof step === 'string') return sanitizeText(step);
      if (step && typeof step === 'object' && 'text' in step) return sanitizeText(String((step as { text?: unknown }).text || ''));
      if (step && typeof step === 'object' && 'name' in step) return sanitizeText(String((step as { name?: unknown }).name || ''));
      return '';
    })
    .filter(Boolean);
};

const pickJsonLdRecipe = (jsonLd: unknown): Record<string, unknown> | null => {
  const maybeArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  for (const item of maybeArray) {
    if (!item || typeof item !== 'object') continue;

    if ('@graph' in item && Array.isArray((item as { '@graph'?: unknown[] })['@graph'])) {
      const fromGraph = pickJsonLdRecipe((item as { '@graph': unknown[] })['@graph']);
      if (fromGraph) return fromGraph;
    }

    const type = (item as { '@type'?: unknown })['@type'];
    const typeStr = Array.isArray(type) ? type.join(',') : String(type || '');
    if (/Recipe/i.test(typeStr)) return item as Record<string, unknown>;

    if ('itemListElement' in item && Array.isArray((item as { itemListElement?: unknown[] }).itemListElement)) {
      const fromList = pickJsonLdRecipe((item as { itemListElement: unknown[] }).itemListElement);
      if (fromList) return fromList;
    }
  }
  return null;
};

const normalizeRecipeJsonLd = (recipeLd: Record<string, unknown>): Recipe => {
  const base = defaultRecipe();
  const recipeIngredient = Array.isArray(recipeLd.recipeIngredient) ? recipeLd.recipeIngredient : [];
  const instructions = normalizeInstructions(recipeLd.recipeInstructions);

  const prep = isoDurationToGerman(typeof recipeLd.prepTime === 'string' ? recipeLd.prepTime : undefined);
  const cook = isoDurationToGerman(typeof recipeLd.cookTime === 'string' ? recipeLd.cookTime : undefined);
  const total = isoDurationToGerman(typeof recipeLd.totalTime === 'string' ? recipeLd.totalTime : undefined);

  const recipeYield = recipeLd.recipeYield;
  const servings = Array.isArray(recipeYield)
    ? sanitizeText(String(recipeYield[0] || base.servings))
    : sanitizeText(String(recipeYield || base.servings));

  return {
    ...base,
    recipeTitle: sanitizeText(String(recipeLd.name || base.recipeTitle)),
    shortDescription: sanitizeText(String(recipeLd.description || base.shortDescription)),
    prepTime: prep || base.prepTime,
    cookTime: cook || base.cookTime,
    totalTime: total || (prep && cook ? `${prep} + ${cook}` : base.totalTime),
    servings: servings || base.servings,
    difficulty: base.difficulty,
    ingredients: [
      {
        sectionTitle: 'Zutaten',
        items: recipeIngredient.map((line) => parseIngredientLine(String(line))),
      },
    ],
    instructions: instructions.length > 0 ? instructions : base.instructions,
    tags: {
      ...base.tags,
      course: recipeLd.recipeCategory ? [sanitizeText(String(recipeLd.recipeCategory))] : [],
      cuisine: recipeLd.recipeCuisine ? [sanitizeText(String(recipeLd.recipeCuisine))] : [],
    },
  };
};

const normalizeExistingRecipeJson = (data: unknown): Recipe | null => {
  if (!data || typeof data !== 'object') return null;
  const candidate = data as Partial<Recipe>;
  if (!candidate.recipeTitle || !Array.isArray(candidate.ingredients) || !Array.isArray(candidate.instructions)) {
    return null;
  }

  const base = defaultRecipe();
  return {
    ...base,
    ...candidate,
    recipeTitle: sanitizeText(String(candidate.recipeTitle)),
    shortDescription: sanitizeText(String(candidate.shortDescription || base.shortDescription)),
    prepTime: String(candidate.prepTime || base.prepTime),
    cookTime: String(candidate.cookTime || base.cookTime),
    totalTime: String(candidate.totalTime || base.totalTime),
    servings: String(candidate.servings || base.servings),
    difficulty: String(candidate.difficulty || base.difficulty),
    nutritionPerServing: { ...base.nutritionPerServing, ...(candidate.nutritionPerServing || {}) },
    tags: { ...base.tags, ...(candidate.tags || {}) },
    expertTips: Array.isArray(candidate.expertTips) ? candidate.expertTips : [],
    ingredients: Array.isArray(candidate.ingredients) ? candidate.ingredients : base.ingredients,
    instructions: Array.isArray(candidate.instructions) ? candidate.instructions : base.instructions,
  };
};

const extractJsonLdBlocks = (html: string): string[] => {
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks: string[] = [];
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(html)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
};

const toAbsoluteUrl = (url: string): string => {
  try {
    return new URL(url).toString();
  } catch {
    throw new Error('Invalid URL.');
  }
};

const fetchWithFallback = async (url: string): Promise<{ content: string; contentType: string; sourceUrl: string }> => {
  const direct = await fetch(url, { method: 'GET' }).catch(() => null);
  if (direct?.ok) {
    return {
      content: await direct.text(),
      contentType: direct.headers.get('content-type') || '',
      sourceUrl: url,
    };
  }

  const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
  const proxy = await fetch(proxyUrl, { method: 'GET' }).catch(() => null);
  if (proxy?.ok) {
    return {
      content: await proxy.text(),
      contentType: 'text/plain',
      sourceUrl: proxyUrl,
    };
  }

  throw new Error('Could not load URL (network or CORS restriction).');
};

const buildGeminiExtractionInput = (sanitizedHtml: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedHtml, 'text/html');
  const title = sanitizeText(doc.querySelector('title')?.textContent || '');

  const headings = Array.from(doc.querySelectorAll('h1, h2, h3'))
    .map((el) => sanitizeText(el.textContent || ''))
    .filter(Boolean)
    .slice(0, 30)
    .join('\n');

  const listItems = Array.from(doc.querySelectorAll('li'))
    .map((el) => sanitizeText(el.textContent || ''))
    .filter((v) => v.length > 2)
    .slice(0, 150)
    .join('\n');

  const paragraphs = Array.from(doc.querySelectorAll('p'))
    .map((el) => sanitizeText(el.textContent || ''))
    .filter((v) => v.length > 20)
    .slice(0, 120)
    .join('\n');

  return [
    `PAGE TITLE: ${title}`,
    '',
    'HEADINGS:',
    headings,
    '',
    'LIST ITEMS:',
    listItems,
    '',
    'PARAGRAPHS:',
    paragraphs,
  ].join('\n');
};

export const importRecipeFromJsonString = (jsonContent: string): Recipe => {
  const parsed = JSON.parse(jsonContent) as unknown;

  const existing = normalizeExistingRecipeJson(parsed);
  if (existing) return existing;

  const jsonLdRecipe = pickJsonLdRecipe(parsed);
  if (jsonLdRecipe) {
    const normalized = normalizeRecipeJsonLd(jsonLdRecipe);
    if (normalized.instructions.length === 0 || normalized.ingredients[0].items.length === 0) {
      throw new Error('Detected recipe JSON is incomplete.');
    }
    return normalized;
  }

  throw new Error('No supported recipe format found.');
};

export const importRecipeFromUrl = async (urlInput: string): Promise<Recipe> => {
  const url = toAbsoluteUrl(urlInput.trim());
  const { content, contentType, sourceUrl } = await fetchWithFallback(url);

  if (/application\/json|text\/json/i.test(contentType) || /\.json($|\?)/i.test(url)) {
    return importRecipeFromJsonString(content);
  }

  const jsonLdBlocks = extractJsonLdBlocks(content);
  for (const block of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(block) as unknown;
      const recipeLd = pickJsonLdRecipe(parsed);
      if (recipeLd) {
        const normalized = normalizeRecipeJsonLd(recipeLd);
        if (normalized.instructions.length > 0 && normalized.ingredients[0].items.length > 0) {
          return normalized;
        }
      }
    } catch {
      // Continue trying other JSON-LD blocks.
    }
  }

  const sanitized = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'noscript', 'iframe', 'object', 'embed'],
  });

  const extractionInput = buildGeminiExtractionInput(sanitized);
  const { extractRecipeFromWebContent } = await import('./geminiService');
  return extractRecipeFromWebContent(sourceUrl, extractionInput);
};
