import { Page, ShoppingListItem } from '@/types';

export interface CommandAction {
  type: 'NAVIGATE' | 'SEARCH' | 'ADD_PANTRY_ITEM' | 'REMOVE_PANTRY_ITEM' | 'ADD_SHOPPING_ITEM' | 'CHECK_SHOPPING_ITEM' | 'GENERATE_RECIPE' | 'UNKNOWN';
  payload?: any;
}

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