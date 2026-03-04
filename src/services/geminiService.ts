// --- Gemini Vision: Zutaten aus Bild extrahieren ---
export const extractPantryItemsFromImage = async (imageFile: File): Promise<string> => {
    const ai = await getAIClient();
    const model = "gemini-pro-vision";
    // Bild als base64 kodieren
    const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    const base64 = await fileToBase64(imageFile);
    const prompt = `Analysiere das Foto und erkenne alle Lebensmittel/Zutaten. Gib eine möglichst natürliche, aber strukturierte Zusammenfassung wie: 'Das sind deine 8 Eier, 2 Zucchini, 1 Packung Butter, ...'. Antworte nur mit einem einzigen deutschen Satz.`;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: [
                { role: "user", parts: [
                    { inlineData: { mimeType: imageFile.type, data: base64 } },
                    { text: prompt }
                ] }
            ],
            config: {
                responseMimeType: "text/plain",
                temperature: 0.2,
            }
        });
        return response.text?.trim() || "";
    } catch (e) {
        throw handleGeminiError(e, 'vision');
    }
};
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { fakerDE as faker } from '@faker-js/faker';
import { AppSettings, PantryItem, Recipe, StructuredPrompt, ShoppingListItem, RecipeIdea } from "../types";
import { loadApiKey } from "./apiKeyService";

// --- Dynamic AI Client (loaded from secure IndexedDB, never from env/build) ---
let _aiClient: GoogleGenAI | null = null;
let _lastKeyHash: string | null = null;

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
};

const getAIClient = async (): Promise<GoogleGenAI> => {
  const key = await loadApiKey();
  if (!key) {
    throw new Error(
      "Kein API-Schlüssel konfiguriert. Bitte hinterlege deinen Google Gemini API-Schlüssel unter Einstellungen → API-Schlüssel."
    );
  }
  const keyHash = simpleHash(key);
  if (!_aiClient || _lastKeyHash !== keyHash) {
    _aiClient = new GoogleGenAI({ apiKey: key });
    _lastKeyHash = keyHash;
  }
  return _aiClient;
};

export const invalidateAIClient = () => {
  _aiClient = null;
  _lastKeyHash = null;
};

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeTitle: { type: Type.STRING, description: "Ein kreativer und ansprechender Titel für das Rezept auf Deutsch." },
        shortDescription: { type: Type.STRING, description: "Eine kurze, verlockende Beschreibung des Gerichts auf Deutsch." },
        prepTime: { type: Type.STRING, description: "Vorbereitungszeit als Text, z.B. '15 Min.'" },
        cookTime: { type: Type.STRING, description: "Kochzeit als Text, z.B. '30 Min.'" },
        totalTime: { type: Type.STRING, description: "Gesamtzeit als Text, z.B. '45 Min.'" },
        servings: { type: Type.STRING, description: "Anzahl der Portionen, z.B. '4 Personen'" },
        difficulty: { type: Type.STRING, description: "Schwierigkeitsgrad, z.B. 'Einfach', 'Mittel', 'Schwer'" },
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    sectionTitle: { type: Type.STRING, description: "Titel für eine Zutatengruppe, z.B. 'Für den Teig'." },
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                quantity: { type: Type.STRING },
                                unit: { type: Type.STRING },
                                name: { type: Type.STRING }
                            },
                        }
                    }
                }
            }
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Schritt-für-Schritt-Anleitung zur Zubereitung des Gerichts."
        },
        nutritionPerServing: {
            type: Type.OBJECT,
            properties: {
                calories: { type: Type.STRING },
                protein: { type: Type.STRING },
                fat: { type: Type.STRING },
                carbs: { type: Type.STRING }
            }
        },
        tags: {
            type: Type.OBJECT,
            properties: {
                course: { type: Type.ARRAY, items: { type: Type.STRING } },
                cuisine: { type: Type.ARRAY, items: { type: Type.STRING } },
                occasion: { type: Type.ARRAY, items: { type: Type.STRING } },
                mainIngredient: { type: Type.ARRAY, items: { type: Type.STRING } },
                prepMethod: { type: Type.ARRAY, items: { type: Type.STRING } },
                diet: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        expertTips: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                }
            }
        }
    },
    propertyOrdering: [
        "recipeTitle", "shortDescription", "prepTime", "cookTime", "totalTime",
        "servings", "difficulty", "ingredients", "instructions",
        "nutritionPerServing", "tags", "expertTips"
    ],
    required: ["recipeTitle", "shortDescription", "totalTime", "servings", "difficulty", "ingredients", "instructions"]
};

const recipeIdeasSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            description: "Eine Liste von 3 unterschiedlichen, kreativen Rezeptideen.",
            items: {
                type: Type.OBJECT,
                properties: {
                    recipeTitle: { type: Type.STRING, description: "Ein kreativer und ansprechender Titel für die Rezeptidee auf Deutsch." },
                    shortDescription: { type: Type.STRING, description: "Eine kurze, verlockende Beschreibung des Gerichts in einem Satz auf Deutsch." }
                },
                required: ["recipeTitle", "shortDescription"]
            }
        }
    },
    required: ["ideas"]
};

const shoppingListSchema = {
    type: Type.OBJECT,
    properties: {
        items: {
            type: Type.ARRAY,
            description: "Eine Liste von Einkaufsartikeln.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Der Name des Artikels." },
                    quantity: { type: Type.NUMBER, description: "Die Menge des Artikels." },
                    unit: { type: Type.STRING, description: "Die Einheit der Menge (z.B. 'kg', 'Liter', 'Stück')." },
                    category: { type: Type.STRING, description: "Eine empfohlene Kategorie für den Supermarkt (z.B. 'Obst & Gemüse', 'Milchprodukte')." }
                },
                required: ["name", "quantity", "unit"]
            }
        }
    },
    required: ["items"]
};

const handleGeminiError = (error: unknown, context: string): Error => {
    console.error(`Error calling Gemini for ${context}:`, error);
    const errorMessage = (error as Error)?.message || String(error);

    if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
         return new Error("Der API-Schlüssel ist ungültig. Bitte überprüfe ihn unter Einstellungen → API-Schlüssel.");
    }
    if (errorMessage.includes('FETCH_ERROR') || errorMessage.includes('NetworkError')) {
        return new Error("Der KI-Dienst konnte nicht erreicht werden. Bitte prüfe deine Netzwerkverbindung.");
    }
     if (errorMessage.includes('429')) {
        return new Error("Zu viele Anfragen an den KI-Dienst. Bitte warte einen Moment.");
    }
    if (errorMessage.includes('Kein API-Schlüssel konfiguriert')) {
        return new Error(errorMessage);
    }
    return new Error("Ein unerwarteter Fehler beim KI-Dienst ist aufgetreten.");
};

const constructBasePrompt = (
    prompt: StructuredPrompt,
    pantryItems: PantryItem[],
    aiPreferences: AppSettings['aiPreferences']
): string => {
  const pantryList = pantryItems.map(item => `${item.quantity} ${item.unit} ${item.name}`).join(', ') || 'leer';
  const userPromptParts: string[] = [];
  userPromptParts.push(`Ein Nutzer möchte etwas kochen. Hier sind die Spezifikationen:`);
  userPromptParts.push(`- Hauptwunsch: "${prompt.craving}"`);

  if (prompt.includeIngredients.length > 0) {
      userPromptParts.push(`- Muss folgende Zutaten enthalten: ${prompt.includeIngredients.join(', ')}`);
  }
  if (prompt.excludeIngredients.length > 0) {
      userPromptParts.push(`- Darf folgende Zutaten NICHT enthalten: ${prompt.excludeIngredients.join(', ')}`);
  }
  if (prompt.modifiers.length > 0) {
      userPromptParts.push(`- Gewünschte Eigenschaften des Gerichts: ${prompt.modifiers.join(', ')}`);
  }

  userPromptParts.push(`\n**Globale Nutzereinstellungen, die IMMER zu beachten sind:**`);
  if (aiPreferences.dietaryRestrictions.length > 0) {
    userPromptParts.push(`- Zwingend erforderliche Ernährungsbeschränkungen: ${aiPreferences.dietaryRestrictions.join(', ')}.`);
  }
  if (aiPreferences.preferredCuisines.length > 0) {
    userPromptParts.push(`- Bevorzugte Küchen: ${aiPreferences.preferredCuisines.join(', ')}.`);
  }
  if (aiPreferences.customInstruction) {
    userPromptParts.push(`- Generelle Anweisung des Nutzers: "${aiPreferences.customInstruction}".`);
  }
  
  userPromptParts.push(`\n**Verfügbare Zutaten in der Vorratskammer:**`);
  userPromptParts.push(pantryList);
  
  userPromptParts.push(`\nBitte erstelle basierend auf ALL diesen Informationen eine passende, kreative Antwort.`);

  return userPromptParts.join('\n');
}

export const generateRecipeIdeas = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences']
): Promise<RecipeIdea[]> => {
    try {
        const ai = await getAIClient();
        const model = "gemini-2.5-flash";
        const systemInstruction = `Du bist Culina, ein Weltklasse-Koch. Entwickle 3 kreative, unterschiedliche Rezeptideen auf Deutsch. Nutze deinen "Thinking Process", um sicherzustellen, dass die Ideen exakt zu den Vorräten und Einschränkungen passen.`;
        const fullPrompt = constructBasePrompt(prompt, pantryItems, aiPreferences);
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: { 
                systemInstruction, 
                responseMimeType: 'application/json', 
                responseSchema: recipeIdeasSchema,
                thinkingConfig: { thinkingBudget: 2048 },
                temperature: aiPreferences.creativityLevel ?? 0.7,
            }
        });
        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Die KI hat eine leere Antwort zurückgegeben.");
        const parsedData = JSON.parse(jsonText);
        if (parsedData.ideas && Array.isArray(parsedData.ideas) && parsedData.ideas.length > 0) {
            return parsedData.ideas;
        } else {
            throw new Error("Die KI hat eine Antwort mit falscher Struktur gesendet.");
        }
    } catch (e: unknown) {
        const errMsg = (e as Error)?.message || String(e);
        if (errMsg.includes('Netzwerk') || errMsg.includes('KI-Dienst konnte nicht erreicht werden')) {
            // Offline-Fallback: Generiere Dummy-Ideen lokal
            const fallbackIdeas: RecipeIdea[] = Array.from({ length: 3 }).map(() => ({
                recipeTitle: faker.lorem.words(3) + ' (Offline)',
                shortDescription: faker.lorem.sentence(),
            }));
            return fallbackIdeas;
        }
        throw handleGeminiError(e, 'ideas');
    }
};

export const generateRecipe = async (
    prompt: StructuredPrompt,
    pantryItems: PantryItem[],
    aiPreferences: AppSettings['aiPreferences'],
    chosenIdea: RecipeIdea
): Promise<Recipe> => {
    try {
        const ai = await getAIClient();
        const model = "gemini-2.5-flash";
        let fullPrompt = constructBasePrompt(prompt, pantryItems, aiPreferences);
        fullPrompt += `\n\n**Spezifische Anforderung:**\nErstelle nun das VOLLSTÄNDIGE und detaillierte Rezept für die folgende, zuvor von dir vorgeschlagene Idee. Halte dich eng an Titel und Beschreibung der Idee.`;
        fullPrompt += `\n- Titel: "${chosenIdea.recipeTitle}"`;
        fullPrompt += `\n- Beschreibung: "${chosenIdea.shortDescription}"`;
        const systemInstruction = `Du bist Culina, ein Weltklasse-Koch. Erstelle ein präzises, deutsches Rezept. Nutze deinen "Thinking Process", um die Kochschritte logisch zu strukturieren und sicherzustellen, dass keine Zutat in der Anleitung vergessen wird.`;
        const response = await ai.models.generateContent({
                model: model,
                contents: fullPrompt,
                config: {
                        systemInstruction,
                        responseMimeType: 'application/json',
                        responseSchema: recipeSchema,
                        thinkingConfig: { thinkingBudget: 4096 },
                        temperature: aiPreferences.creativityLevel ?? 0.7,
                }
        });
        const jsonText = response.text?.trim();
        if (!jsonText) {
                throw new Error("Die KI hat eine leere Antwort zurückgegeben.");
        }
        const recipeData = JSON.parse(jsonText);
        if (recipeData.recipeTitle && Array.isArray(recipeData.ingredients) && Array.isArray(recipeData.instructions)) {
                return recipeData as Recipe;
        } else {
            throw new Error("Die KI hat eine Antwort mit falscher Struktur gesendet.");
        }
    } catch (error) {
        const errMsg = (error as Error)?.message || String(error);
        if (errMsg.includes('Netzwerk') || errMsg.includes('KI-Dienst konnte nicht erreicht werden')) {
            // Offline-Fallback: Dummy-Rezept generieren
            const fallbackRecipe: Recipe = {
                recipeTitle: chosenIdea.recipeTitle + ' (Offline)',
                shortDescription: chosenIdea.shortDescription,
                prepTime: '10 Min.',
                cookTime: '20 Min.',
                totalTime: '30 Min.',
                servings: '2 Personen',
                difficulty: 'Einfach',
                ingredients: [
                    {
                        sectionTitle: '',
                        items: pantryItems.slice(0, 5).map(item => ({
                            quantity: item.quantity.toString(),
                            unit: item.unit,
                            name: item.name
                        }))
                    }
                ],
                instructions: [
                    'Alle Zutaten vorbereiten.',
                    'Zutaten vermengen und kochen.',
                    'Servieren und genießen.'
                ],
                nutritionPerServing: { calories: '350', protein: '10g', fat: '12g', carbs: '40g' },
                tags: { course: ['Hauptgericht'], cuisine: ['International'], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
                expertTips: [{ title: 'Offline-Tipp', content: 'Dieses Rezept wurde ohne KI generiert.' }]
            };
            return fallbackRecipe;
        }
        throw handleGeminiError(error, 'full recipe');
    }
};


export const generateShoppingList = async (
    prompt: string,
    pantryItems: PantryItem[],
    currentListItems: ShoppingListItem[]
): Promise<Omit<ShoppingListItem, 'id' | 'isChecked'>[]> => {
    try {
        const ai = await getAIClient();
        const model = "gemini-2.5-flash";
        const pantryList = pantryItems.map(item => item.name).join(', ') || 'keine';
        const currentShoppingList = currentListItems.map(item => item.name).join(', ') || 'keine';
        const fullPrompt = `
            Du bist ein Einkaufs-Assistent für die App CulinaSync.
            Der Benutzer hat folgende Anfrage für eine Einkaufsliste gestellt: "${prompt}".

            KONTEXT:
            1.  **Vorrat:** Folgende Artikel sind bereits im Vorrat vorhanden: ${pantryList}.
            2.  **Einkaufsliste:** Folgende Artikel stehen bereits auf der Einkaufsliste: ${currentShoppingList}.

            Deine Aufgabe ist es, eine umfassende Einkaufsliste auf Deutsch zu erstellen, die zur Anfrage des Benutzers passt.
            BERÜCKSICHTIGE den Vorrat UND die bereits existierende Einkaufsliste. Füge Artikel, die bereits an einem der beiden Orte vorhanden sind, NICHT zur Liste hinzu, es sei denn, es ist sehr wahrscheinlich, dass mehr davon benötigt wird (z.B. Milch, Eier).
            
            Antworte NUR mit einem einzigen, gültigen JSON-Objekt, das dem bereitgestellten Schema entspricht.
            Füge keinen anderen Text, keine Markdown-Formatierung oder Erklärungen vor oder nach dem JSON-Objekt hinzu.
        `;
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: shoppingListSchema,
            }
        });
        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error("Die KI hat eine leere Antwort zurückgegeben.");
        }
        const parsedData = JSON.parse(jsonText);
        if (parsedData.items && Array.isArray(parsedData.items)) {
            return parsedData.items;
        } else {
            throw new Error("Die KI hat eine Antwort mit falscher Struktur gesendet.");
        }
    } catch (error) {
        const errMsg = (error as Error)?.message || String(error);
        if (errMsg.includes('Netzwerk') || errMsg.includes('KI-Dienst konnte nicht erreicht werden')) {
            // Offline-Fallback: Dummy-Einkaufsliste
            const fallbackItems = [
                { name: 'Brot', quantity: 1, unit: 'Stück', category: 'Backwaren' },
                { name: 'Milch', quantity: 1, unit: 'Liter', category: 'Milchprodukte' },
                { name: 'Äpfel', quantity: 6, unit: 'Stück', category: 'Obst & Gemüse' }
            ];
            return fallbackItems;
        }
        throw handleGeminiError(error, 'shopping list');
    }
};

export const generateRecipeImage = async (recipeTitle: string): Promise<string> => {
    const ai = await getAIClient();
    const model = "imagen-4.0-generate-001";
    const prompt = `High quality, professional food photography of ${recipeTitle}, studio lighting, delicious, appetizing, 4k resolution, photorealistic, overhead shot, plated elegantly`;
    
    try {
        const response = await ai.models.generateImages({
            model,
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        
        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) throw new Error("Kein Bild generiert.");
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (e: unknown) {
        throw handleGeminiError(e, 'image generation');
    }
};

export const extractRecipeFromWebContent = async (
    sourceUrl: string,
    webContent: string
): Promise<Recipe> => {
    const ai = await getAIClient();
    const model = 'gemini-2.5-flash';

    const systemInstruction = 'Extract a complete recipe from provided website content. Return only valid JSON matching the required schema. If information is missing, use sensible defaults.';

    const prompt = [
        'Extract exactly one recipe from the following website content.',
        `Quelle: ${sourceUrl}`,
        'If multiple recipes exist, choose the most likely primary recipe.',
        'Important: ingredients as a structured list, instructions as ordered steps, and sensible time/servings.',
        '',
        'WEB CONTENT (already sanitized):',
        webContent.slice(0, 24000),
    ].join('\n');

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: recipeSchema,
                thinkingConfig: { thinkingBudget: 2048 },
                temperature: 0.3,
            },
        });

        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error('AI returned an empty response.');
        }

        const parsed = JSON.parse(jsonText) as Recipe;
        if (!parsed.recipeTitle || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.instructions)) {
            throw new Error('AI returned a response with invalid structure.');
        }
        return parsed;
    } catch (e: unknown) {
        throw handleGeminiError(e, 'recipe import extraction');
    }
};

export interface GeminiNutritionVerification {
    summary: string;
    warnings: string[];
}

export const verifyNutritionAndAllergensWithGemini = async (
    recipe: Recipe,
    localEstimate: { calories: number; protein: number; fat: number; carbs: number; allergens: string[] }
): Promise<GeminiNutritionVerification> => {
    const ai = await getAIClient();
    const model = 'gemini-2.5-flash';

    const verificationSchema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['summary', 'warnings'],
    };

    const ingredientPreview = recipe.ingredients
        .flatMap((group) => group.items)
        .slice(0, 40)
        .map((item) => `${item.quantity} ${item.unit} ${item.name}`.trim())
        .join('\n');

    const prompt = [
        'Validate nutrition/allergen estimate for this recipe.',
        `Recipe title: ${recipe.recipeTitle}`,
        `Servings: ${recipe.servings}`,
        'Ingredients:',
        ingredientPreview,
        '',
        `Local estimate kcal/protein/fat/carbs per serving: ${Math.round(localEstimate.calories)} / ${Math.round(localEstimate.protein)}g / ${Math.round(localEstimate.fat)}g / ${Math.round(localEstimate.carbs)}g`,
        `Local allergens: ${localEstimate.allergens.join(', ') || 'none detected'}`,
        '',
        'Return concise verification summary and warnings (if uncertain ingredients or allergens).',
    ].join('\n');

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: verificationSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error('AI returned an empty verification response.');
        }

        const parsed = JSON.parse(jsonText) as GeminiNutritionVerification;
        return {
            summary: parsed.summary || 'No summary available.',
            warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        };
    } catch (e: unknown) {
        throw handleGeminiError(e, 'nutrition verification');
    }
};