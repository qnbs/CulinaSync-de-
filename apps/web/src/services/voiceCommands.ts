import { Page, ShoppingListItem, PantryItem } from '../types';
import { setVoiceAction } from '../store/slices/uiSlice';
import i18next from 'i18next';

export interface CommandAction {
    type: 'NAVIGATE' | 'SEARCH' | 'ADD_PANTRY_ITEM' | 'REMOVE_PANTRY_ITEM' | 'ADJUST_PANTRY_QUANTITY' | 'ADD_SHOPPING_ITEM' | 'CHECK_SHOPPING_ITEM' | 'GENERATE_RECIPE' | 'READ_LIST' | 'START_COOK_MODE' | 'NEXT_STEP' | 'PREVIOUS_STEP' | 'EXIT_COOK_MODE' | 'CHECK_COOK_INGREDIENT' | 'UNCHECK_COOK_INGREDIENT' | 'START_COOK_TIMER' | 'PAUSE_COOK_TIMER' | 'UNKNOWN';
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
        addToast(i18next.t('voiceCommands.navigatedTo', { page: page.charAt(0).toUpperCase() + page.slice(1) }));
    } else if (action.type === 'ADD_SHOPPING_ITEM') {
        const itemPayload = action.payload as Omit<ShoppingListItem, 'id' | 'sortOrder' | 'category'>;
        addShoppingListItem(itemPayload).then(() => {
            addToast(i18next.t('voiceCommands.addedToShoppingList', { name: itemPayload.name }));
            if (currentPage !== 'shopping-list') {
              navigate('shopping-list');
            }
        });
    } else if (action.type === 'ADD_PANTRY_ITEM') {
        const itemPayload = action.payload as Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>;
        addOrUpdatePantryItem(itemPayload).then(({ status, item }) => {
             const message = status === 'added' 
                ? i18next.t('voiceCommands.addedToPantry', { name: item.name })
                : i18next.t('voiceCommands.updatedInPantry', { name: item.name });
             addToast(message);
             if (currentPage !== 'pantry') {
                navigate('pantry');
             }
        });
    } else if (action.type === 'REMOVE_PANTRY_ITEM') {
        const itemName = action.payload as string;
        removeItemFromPantry(itemName).then((success) => {
            if(success) {
                addToast(i18next.t('voiceCommands.removedFromPantry', { name: itemName }));
            } else {
                addToast(i18next.t('voiceCommands.notFoundInPantry', { name: itemName }), "error");
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
        addToast(i18next.t('voiceCommands.commandNotRecognized'), "error");
    }
};

const parseItemString = (itemString: string): { quantity: number; unit: string; name: string } => {
    // Regex to capture quantity (number), unit (word), and name (rest)
    const match = itemString.trim().match(/^(\d+[.,]?\d*)\s*([a-zA-ZäöüÄÖÜß]+)?\s+(.+)$/);

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
    if (command.includes('nächster schritt') || command.includes('next step')) return { type: 'NEXT_STEP' };
    if (command.includes('vorheriger schritt') || command.includes('schritt zurück') || command.includes('previous step') || command.includes('go back')) return { type: 'PREVIOUS_STEP' };
    if (command.includes('beende kochmodus') || command.includes('kochmodus beenden') || command.includes('exit cook mode') || command.includes('stop cook mode')) return { type: 'EXIT_COOK_MODE' };
    if ((command.includes('starte kochmodus') || command.includes('start cook mode')) && currentPage === 'recipes') return { type: 'START_COOK_MODE' };

    const timerStartMatch = command.match(/timer (start|starte|starten)(?:\s+(?:für|fuer)\s+(\d+)\s*(sekunden|sekunde|minuten|minute))?/);
    if (timerStartMatch) {
        const amount = timerStartMatch[2] ? parseInt(timerStartMatch[2], 10) : 0;
        const unit = timerStartMatch[3] || '';
        const seconds = amount > 0 ? (unit.startsWith('minute') ? amount * 60 : amount) : 0;
        return { type: 'START_COOK_TIMER', payload: String(seconds) };
    }
    if (command.includes('timer pause') || command.includes('timer pausieren') || command.includes('timer stopp') || command.includes('timer stoppen')) {
        return { type: 'PAUSE_COOK_TIMER' };
    }

    const checkIngredientMatch = command.match(/^(?:zutat\s+)?(.+?)\s+(?:abhaken|abgehakt|als erledigt markieren)$/);
    if (checkIngredientMatch?.[1]) {
        return { type: 'CHECK_COOK_INGREDIENT', payload: checkIngredientMatch[1].trim() };
    }
    const uncheckIngredientMatch = command.match(/^(?:zutat\s+)?(.+?)\s+(?:zurücksetzen|entferne haken|nicht erledigt)$/);
    if (uncheckIngredientMatch?.[1]) {
        return { type: 'UNCHECK_COOK_INGREDIENT', payload: uncheckIngredientMatch[1].trim() };
    }


    // Navigation Commands
    if (command.includes('gehe zu') || command.includes('öffne') || command.includes('go to') || command.includes('open')) {
        if (command.includes('vorrat') || command.includes('vorratskammer') || command.includes('pantry')) return { type: 'NAVIGATE', payload: 'pantry' };
        if (command.includes('chef') || command.includes('ki') || command.includes('ai')) return { type: 'NAVIGATE', payload: 'chef' };
        if (command.includes('rezepte') || command.includes('kochbuch') || command.includes('recipes') || command.includes('cookbook')) return { type: 'NAVIGATE', payload: 'recipes' };
        if (command.includes('planer') || command.includes('essensplan') || command.includes('meal planner') || command.includes('planner')) return { type: 'NAVIGATE', payload: 'meal-planner' };
        if (command.includes('einkaufsliste') || command.includes('liste') || command.includes('shopping list') || command.includes('shopping')) return { type: 'NAVIGATE', payload: 'shopping-list' };
        if (command.includes('einstellungen') || command.includes('settings')) return { type: 'NAVIGATE', payload: 'settings' };
        if (command.includes('hilfe') || command.includes('help')) return { type: 'NAVIGATE', payload: 'help' };
    }

    // Read list command
    if(command.startsWith('lies') || command.startsWith('lese') || command.startsWith('was habe ich') || command.startsWith('read') || command.startsWith('what do i have')) {
        if(command.includes('einkaufsliste') || command.includes('shopping list') || (command.includes('liste') && currentPage === 'shopping-list') || (command.includes('list') && currentPage === 'shopping-list')) {
            return { type: 'READ_LIST', payload: 'shopping-list'};
        }
        if(command.includes('vorrat') || command.includes('vorratskammer') || command.includes('pantry')) {
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
    const addShoppingMatch = command.match(/^(füge|setze|add)\s(.+?)\s(?:auf die |to the )?(einkaufs)?(?:liste|list)/);
     if (addShoppingMatch && addShoppingMatch[2]) {
        const parsedItem = parseItemString(addShoppingMatch[2]);
        return { type: 'ADD_SHOPPING_ITEM', payload: { ...parsedItem, isChecked: false } as Omit<ShoppingListItem, 'id'> };
    }

    // Check Shopping List Item Command
    const checkShoppingMatch = command.match(/^(hake|streiche|check off|cross off)\s(.+?)\s(von der liste |off the list )?ab?/);
    if ((currentPage === 'shopping-list' || currentPage === 'pantry') && checkShoppingMatch && checkShoppingMatch[2]) {
        return { type: 'CHECK_SHOPPING_ITEM', payload: checkShoppingMatch[2].trim() };
    }

    // Add Pantry Item Command
    const addPantryMatch = command.match(/^(füge|packe|add)\s(.+?)\s(?:in den|zum|to(?: the)?)\s?(?:vorrat|pantry)( hinzu)?/);
    if (addPantryMatch && addPantryMatch[2]) {
        return { type: 'ADD_PANTRY_ITEM', payload: parseItemString(addPantryMatch[2]) };
    }
    
    // Remove Pantry Item Command
    const removePantryMatch = command.match(/^(entferne|lösche|remove|delete)\s(.+?)\s(?:aus dem|vom|from(?: the)?)\s?(?:vorrat|pantry)/);
    if(removePantryMatch && removePantryMatch[2]){
        return { type: 'REMOVE_PANTRY_ITEM', payload: removePantryMatch[2].trim() };
    }
    
    // AI Chef Command
    if (currentPage === 'chef' && (command.startsWith('koche') || command.startsWith('mache') || command.startsWith('generiere') || command.startsWith('erstelle') || command.startsWith('cook') || command.startsWith('make') || command.startsWith('generate') || command.startsWith('create'))) {
        return { type: 'GENERATE_RECIPE', payload: transcript };
    }
    
    return { type: 'UNKNOWN', payload: transcript };
}