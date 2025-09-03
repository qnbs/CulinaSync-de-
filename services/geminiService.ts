import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AppSettings, PantryItem, Recipe, StructuredPrompt, ShoppingListItem, RecipeIdea } from "@/types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
                difficulty: { type: Type.ARRAY, items: { type: Type.STRING } },
                totalTime: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    if (!API_KEY) throw new Error("API_KEY_MISSING");
    
    const model = "gemini-2.5-flash";
    const systemInstruction = `Du bist Culina, ein Weltklasse-Koch und kulinarischer Assistent. Deine Aufgabe ist es, 3 köstliche, unterschiedliche und plausible Rezeptideen auf Deutsch zu entwickeln, die genau auf die Wünsche des Nutzers zugeschnitten sind. Antworte IMMER NUR mit einem einzigen, gültigen JSON-Objekt, das dem Schema entspricht.`;
    const fullPrompt = constructBasePrompt(prompt, pantryItems, aiPreferences);

    try {
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: { systemInstruction, responseMimeType: 'application/json', responseSchema: recipeIdeasSchema }
        });
        const jsonText = response.text.trim();
        if (!jsonText) throw new Error("INVALID_RESPONSE: Empty");
        
        const parsedData = JSON.parse(jsonText);
        if (parsedData.ideas && Array.isArray(parsedData.ideas) && parsedData.ideas.length > 0) {
            return parsedData.ideas;
        } else {
            throw new Error("INVALID_STRUCTURE: Missing 'ideas' array.");
        }
    } catch (e: any) {
        console.error("Error calling Gemini for ideas:", e);
        if (e.message.startsWith("API_KEY")) throw e;
        throw new Error("API_ERROR");
    }
};

export const generateRecipe = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
  chosenIdea: RecipeIdea
): Promise<Recipe> => {
  if (!API_KEY) {
    throw new Error("API_KEY_MISSING: Gemini API key is not configured. Please set the API_KEY environment variable.");
  }

  const model = "gemini-2.5-flash";
  let fullPrompt = constructBasePrompt(prompt, pantryItems, aiPreferences);

  fullPrompt += `\n\n**Spezifische Anforderung:**\nErstelle nun das VOLLSTÄNDIGE und detaillierte Rezept für die folgende, zuvor von dir vorgeschlagene Idee. Halte dich eng an Titel und Beschreibung der Idee.`;
  fullPrompt += `\n- Titel: "${chosenIdea.recipeTitle}"`;
  fullPrompt += `\n- Beschreibung: "${chosenIdea.shortDescription}"`;
  
  const systemInstruction = `Du bist Culina, ein Weltklasse-Koch und kulinarischer Assistent für die App CulinaSync. Deine Aufgabe ist es, ein köstliches, stimmiges und plausibles Rezept auf Deutsch zu erstellen, das genau auf die Wünsche des Nutzers zugeschnitten ist. Antworte IMMER NUR mit einem einzigen, gültigen JSON-Objekt, das dem bereitgestellten Schema entspricht. Füge keinen anderen Text, keine Markdown-Formatierung oder Erklärungen vor oder nach dem JSON-Objekt hinzu.`;
  
  console.log("Sending prompt to Gemini for full recipe:", fullPrompt);
  
  let response: GenerateContentResponse;
  try {
    response = await ai.models.generateContent({
        model: model,
        contents: fullPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: recipeSchema,
        }
    });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    throw new Error("API_ERROR: Failed to communicate with the AI service. It might be down, or there could be a network issue.");
  }

  const jsonText = response.text.trim();
  if (!jsonText) {
      console.error("Gemini response was empty.");
      throw new Error("INVALID_RESPONSE: The AI returned an empty or invalid response.");
  }

  let recipeData;
  try {
    recipeData = JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse JSON from Gemini response:", jsonText);
    throw new Error("INVALID_JSON: The AI returned a response that was not valid JSON.");
  }
  
  // Basic validation to ensure the parsed data looks like a recipe
  if (recipeData.recipeTitle && Array.isArray(recipeData.ingredients) && Array.isArray(recipeData.instructions)) {
      return recipeData as Recipe;
  } else {
    console.error("Parsed JSON does not match Recipe structure:", recipeData);
    throw new Error("INVALID_STRUCTURE: The AI returned a JSON object with a missing or incorrect structure.");
  }
};


export const generateShoppingList = async (
    prompt: string,
    pantryItems: PantryItem[]
): Promise<Omit<ShoppingListItem, 'id' | 'isChecked'>[]> => {
    if (!API_KEY) {
        throw new Error("API_KEY_MISSING: Gemini API key is not configured.");
    }

    const model = "gemini-2.5-flash";
    const pantryList = pantryItems.map(item => item.name).join(', ') || 'keine';

    const fullPrompt = `
        Du bist ein Einkaufs-Assistent für die App CulinaSync.
        Der Benutzer hat folgende Anfrage für eine Einkaufsliste gestellt: "${prompt}".

        Folgende Artikel sind bereits im Vorrat vorhanden: ${pantryList}.

        Deine Aufgabe ist es, eine umfassende Einkaufsliste auf Deutsch zu erstellen, die zur Anfrage des Benutzers passt.
        BERÜCKSICHTIGE den Vorrat und füge Artikel, die bereits vorhanden sind, NICHT zur Liste hinzu, es sei denn, es ist sehr wahrscheinlich, dass mehr davon benötigt wird (z.B. Milch, Eier).
        
        Antworte NUR mit einem einzigen, gültigen JSON-Objekt, das dem bereitgestellten Schema entspricht.
        Füge keinen anderen Text, keine Markdown-Formatierung oder Erklärungen vor oder nach dem JSON-Objekt hinzu.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: shoppingListSchema,
            }
        });
        
        const jsonText = response.text.trim();
        if (!jsonText) {
            console.error("Gemini response for shopping list was empty.");
            throw new Error("INVALID_RESPONSE: The AI returned an empty response.");
        }

        const parsedData = JSON.parse(jsonText);
        
        if (parsedData.items && Array.isArray(parsedData.items)) {
            return parsedData.items;
        } else {
            throw new Error("INVALID_STRUCTURE: The AI returned a JSON object with a missing or incorrect structure.");
        }

    } catch (error) {
        console.error("Error generating shopping list with Gemini:", error);
        throw new Error("API_ERROR: Failed to generate shopping list.");
    }
};