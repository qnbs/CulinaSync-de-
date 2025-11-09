import { Page, ShoppingListItem, PantryItem } from '../types';
import { setVoiceAction } from '../store/slices/uiSlice';

export interface CommandAction {
  type: 'NAVIGATE' | 'SEARCH' | 'ADD_PANTRY_ITEM' | 'REMOVE_PANTRY_ITEM' | 'ADJUST_PANTRY_QUANTITY' | 'ADD_SHOPPING_ITEM' | 'CHECK_SHOPPING_ITEM' | 'GENERATE_RECIPE' | 'READ_LIST' | 'START_COOK_MODE' | 'NEXT_STEP' | 'PREVIOUS_STEP' | 'EXIT_COOK_MODE' | 'UNKNOWN';
  payload?: unknown;
}

// This interface defines the dependencies needed by the voice action executor.
export interface VoiceCommandServices {
  navigate: (page: Page, focusTarget?: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  addShoppingListItem: (item: Omit<ShoppingListItem, 'id' | 'sortOrder' | 'category'>) => Promise<{ status: 'added' | 'updated'; item: ShoppingListItem }>;
  addOrUpdatePantryItem: (item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ status: 'added' | 'updated'; item: PantryItem }>;
  removeItemFromPantry: (name: string) => Promise<boolean>;
  dispatch: (action: ReturnType<typeof setVoiceAction>) => void;
}

/**
 * Executes the side effect corresponding to a parsed voice command action.
 * This centralizes the business logic away from the UI component.
 * @param action The parsed command action.
 * @param services An object containing functions for side effects (navigation, toasts, DB operations).
 * @param currentPage The current page of the application for context-sensitive actions.
 */
export const executeVoiceAction = (
  action: CommandAction,
  services: VoiceCommandServices,
  currentPage: Page
) => {
    const { navigate, addToast, addShoppingListItem, addOrUpdatePantryItem, removeItemFromPantry, dispatch } = services;

    if (action.type === 'NAVIGATE') {
        const page = action.payload as Page;
        navigate(page);
        addToast(`Navigiere zu: ${page.charAt(0).toUpperCase() + page.slice(1)}`);
    } else if (action.type === 'ADD_SHOPPING_ITEM') {
        const itemPayload = action.payload as Omit<ShoppingListItem, 'id' | 'sortOrder' | 'category'>;
        addShoppingListItem(itemPayload).then(() => {
            addToast(`"${itemPayload.name}" zur Einkaufsliste hinzugefügt.`);
            if (currentPage !== 'shopping-list') {
              navigate('shopping-list');
            }
        });
    } else if (action.type === 'ADD_PANTRY_ITEM') {
        const itemPayload = action.payload as Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>;
        addOrUpdatePantryItem(itemPayload).then(({ status, item }) => {
             const message = status === 'added' 
                ? `"${item.name}" zum Vorrat hinzugefügt.`
                : `Vorrat für "${item.name}" aktualisiert.`;
             addToast(message);
             if (currentPage !== 'pantry') {
                navigate('pantry');
             }
        });
    } else if (action.type === 'REMOVE_PANTRY_ITEM') {
        const itemName = action.payload as string;
        removeItemFromPantry(itemName).then((success) => {
            if(success) {
                addToast(`"${itemName}" aus dem Vorrat entfernt.`);
            } else {
                addToast(`"${itemName}" nicht im Vorrat gefunden.`, "error");
            }
            if (currentPage !== 'pantry') {
                navigate('pantry');
            }
        });
    }
    else if (action.type !== 'UNKNOWN') {
        const payloadContent = String(action.payload ?? '');
        dispatch(setVoiceAction({ type: action.type, payload: `${payloadContent}#${Date.now()}` }));
    } else {
        addToast("Befehl nicht erkannt.", "error");
    }
};

const parseItemString = (itemString: string): { quantity: number; unit: string; name: string } => {
    // Regex to capture quantity (number), unit (word), and name (rest)
    const match = itemString.trim().match(/^(\d+[\.,]?\d*)\s*([a-zA-ZäöüÄÖÜß]+)?\s+(.+)$/);

    if (match) {
        const [, quantityStr, unit, name] = match;
        return {
            quantity: parseFloat(quantityStr.replace(',', '.')) || 1,
            unit: unit || 'Stk',
            name: name.trim()
        };
    }
    // Fallback for commands without quantity/unit
    return {
        quantity: 1,
        unit: 'Stk',
        name: itemString.trim()
    };
};


export const processCommand = (transcript: string, currentPage: Page): CommandAction => {
    const command = transcript.toLowerCase().trim();

    // Cook Mode Commands (Highest Priority)
    if (command.includes('nächster schritt')) return { type: 'NEXT_STEP' };
    if (command.includes('vorheriger schritt') || command.includes('schritt zurück')) return { type: 'PREVIOUS_STEP' };
    if (command.includes('beende kochmodus') || command.includes('kochmodus beenden')) return { type: 'EXIT_COOK_MODE' };
    if (command.includes('starte kochmodus') && currentPage === 'recipes') return { type: 'START_COOK_MODE' };


    // Navigation Commands
    if (command.includes('gehe zu') || command.includes('öffne')) {
        if (command.includes('vorrat') || command.includes('vorratskammer')) return { type: 'NAVIGATE', payload: 'pantry' };
        if (command.includes('chef') || command.includes('ki')) return { type: 'NAVIGATE', payload: 'chef' };
        if (command.includes('rezepte') || command.includes('kochbuch')) return { type: 'NAVIGATE', payload: 'recipes' };
        if (command.includes('planer') || command.includes('essensplan')) return { type: 'NAVIGATE', payload: 'meal-planner' };
        if (command.includes('einkaufsliste') || command.includes('liste')) return { type: 'NAVIGATE', payload: 'shopping-list' };
        if (command.includes('einstellungen')) return { type: 'NAVIGATE', payload: 'settings' };
        if (command.includes('hilfe')) return { type: 'NAVIGATE', payload: 'help' };
    }

    // Read list command
    if(command.startsWith('lies') || command.startsWith('lese') || command.startsWith('was habe ich')) {
        if(command.includes('einkaufsliste') || (command.includes('liste') && currentPage === 'shopping-list')) {
            return { type: 'READ_LIST', payload: 'shopping-list'};
        }
        if(command.includes('vorrat') || command.includes('vorratskammer')) {
            return { type: 'READ_LIST', payload: 'pantry'};
        }
    }

    // Adjust Pantry Quantity
    const adjustPantryMatch = command.match(/^(erhöhe|reduziere|erhöhe|verringere)\s(.+?)\s(um|um)\s(\d+)/);
    if (currentPage === 'pantry' && adjustPantryMatch) {
        const [, action, itemName, , amountStr] = adjustPantryMatch;
        const amount = parseInt(amountStr, 10);
        const isIncreasing = action === 'erhöhe' || action === 'erhöhe';
        return {
            type: 'ADJUST_PANTRY_QUANTITY',
            payload: {
                name: itemName.trim(),
                amount: isIncreasing ? amount : -amount,
            }
        };
    }

    // Search Command (context-sensitive)
    const searchMatch = command.match(/^(suche nach|suche|finde)\s(.+)/);
    if ((currentPage === 'pantry' || currentPage === 'recipes') && searchMatch && searchMatch[2]) {
        return { type: 'SEARCH', payload: searchMatch[2] };
    }

    // Add Shopping List Item Command
    const addShoppingMatch = command.match(/^(füge|setze)\s(.+?)\sauf die (einkaufs)?liste/);
     if (addShoppingMatch && addShoppingMatch[2]) {
        const parsedItem = parseItemString(addShoppingMatch[2]);
        return { type: 'ADD_SHOPPING_ITEM', payload: { ...parsedItem, isChecked: false } as Omit<ShoppingListItem, 'id'> };
    }

    // Check Shopping List Item Command
    const checkShoppingMatch = command.match(/^(hake|streiche)\s(.+?)\s(von der liste )?ab/);
    if ((currentPage === 'shopping-list' || currentPage === 'pantry') && checkShoppingMatch && checkShoppingMatch[2]) {
        return { type: 'CHECK_SHOPPING_ITEM', payload: checkShoppingMatch[2].trim() };
    }

    // Add Pantry Item Command
    const addPantryMatch = command.match(/^(füge|packe)\s(.+?)\s(in den|zum)?\s?vorrat( hinzu)?/);
    if (addPantryMatch && addPantryMatch[2]) {
        return { type: 'ADD_PANTRY_ITEM', payload: parseItemString(addPantryMatch[2]) };
    }
    
    // Remove Pantry Item Command
    const removePantryMatch = command.match(/^(entferne|lösche)\s(.+?)\s(aus dem|vom)\s?vorrat/);
    if(removePantryMatch && removePantryMatch[2]){
        return { type: 'REMOVE_PANTRY_ITEM', payload: removePantryMatch[2].trim() };
    }
    
    // AI Chef Command
    if (currentPage === 'chef' && (command.startsWith('koche') || command.startsWith('mache') || command.startsWith('generiere') || command.startsWith('erstelle'))) {
        return { type: 'GENERATE_RECIPE', payload: transcript };
    }
    
    return { type: 'UNKNOWN', payload: transcript };
}