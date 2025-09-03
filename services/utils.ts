// Improved heuristic for category mapping
export const getCategoryForItem = (itemName: string): string => {
    const name = itemName.toLowerCase();
    if (['milch', 'joghurt', 'käse', 'butter', 'sahne', 'quark', 'feta', 'ei', 'eier'].some(s => name.includes(s))) return 'Milchprodukte & Eier';
    if (['apfel', 'banane', 'tomate', 'zwiebel', 'knoblauch', 'karotte', 'salat', 'paprika', 'spinat', 'gemüse', 'kartoffel', 'gurke', 'zucchini', 'lauch', 'petersilie', 'basilikum', 'schnittlauch'].some(s => name.includes(s))) return 'Obst & Gemüse';
    if (['huhn', 'rind', 'schwein', 'fisch', 'lachs', 'fleisch', 'wurst', 'hackfleisch'].some(s => name.includes(s))) return 'Fleisch & Fisch';
    if (['brot', 'brötchen', 'baguette', 'toast'].some(s => name.includes(s))) return 'Backwaren';
    if (['nudeln', 'reis', 'mehl', 'zucker', 'linsen', 'bohnen', 'pasta', 'haferflocken', 'müsli', 'kaffee', 'tee', 'couscous'].some(s => name.includes(s))) return 'Trockenwaren & Nudeln';
    if (['öl', 'essig', 'olivenöl'].some(s => name.includes(s))) return 'Öle & Essige';
    if (['tomatenmark', 'passata', 'kichererbsen', 'mais', 'oliven', 'konserve'].some(s => name.includes(s))) return 'Konserven & Gläser';
    if (['salz', 'pfeffer', 'paprika', 'curry', 'senf', 'ketchup', 'sojasauce', 'brühe'].some(s => name.includes(s))) return 'Gewürze & Saucen';
    return 'Sonstiges';
}

// Helper to format numbers nicely, avoiding unnecessary decimals.
const formatQuantity = (num: number): string => {
  if (num === 0) return "0";
  // Handle common fractions
  if (num > 0 && num < 1) {
    if (Math.abs(num - 1/8) < 0.01) return "1/8";
    if (Math.abs(num - 1/4) < 0.01) return "1/4";
    if (Math.abs(num - 1/3) < 0.01) return "1/3";
    if (Math.abs(num - 1/2) < 0.01) return "1/2";
    if (Math.abs(num - 2/3) < 0.01) return "2/3";
    if (Math.abs(num - 3/4) < 0.01) return "3/4";
  }
  // For small numbers, use two decimal places, for larger ones, one or none.
  if (num < 1) return num.toFixed(2).replace(/\.00$/, '').replace(/0$/, "");
  if (num < 10) return num.toFixed(1).replace(/\.0$/, "");
  return String(Math.round(num));
};

export const scaleIngredientQuantity = (originalQuantity: string, scaleFactor: number): string => {
    if (!originalQuantity || scaleFactor === 1) {
        return originalQuantity;
    }
    const quantityStr = originalQuantity.trim().replace(',', '.');

    // Case 1: Range (e.g., "2-3")
    const rangeMatch = quantityStr.match(/^(\d+\.?\d*)\s*-\s*(\d+\.?\d*)$/);
    if (rangeMatch) {
        const start = parseFloat(rangeMatch[1]) * scaleFactor;
        const end = parseFloat(rangeMatch[2]) * scaleFactor;
        return `${formatQuantity(start)}-${formatQuantity(end)}`;
    }

    // Case 2: Fraction (e.g., "1/2")
    const fractionMatch = quantityStr.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
        const num = (parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10)) * scaleFactor;
        return formatQuantity(num);
    }

    // Case 3: Number (e.g., "1.5", "100")
    const numberMatch = quantityStr.match(/^(\d+\.?\d*)/);
    if (numberMatch) {
        const num = parseFloat(numberMatch[0]) * scaleFactor;
        return formatQuantity(num);
    }
    
    // Case 4: Non-numeric, return as is
    return originalQuantity;
};

export const parseShoppingItemString = (input: string): { name: string; quantity: number; unit: string } => {
    const text = input.trim();
    const units = ['g', 'kg', 'mg', 'l', 'ml', 'cl', 'stk', 'stück', 'stueck', 'bund', 'pck', 'packung', 'dose', 'dosen', 'fl', 'flasche', 'flaschen', 'zehe', 'zehen', 'el', 'tl'];
    const unitRegexPart = units.join('|');

    // Case 1: "2kg Mehl" or "2 kg Mehl"
    let match = text.match(new RegExp(`^(\\d+[\\.,]?\\d*)\\s*(${unitRegexPart})?\\s+(.+)`, 'i'));
    if (match) {
        return {
            quantity: parseFloat(match[1].replace(',', '.')) || 1,
            unit: match[2] || 'Stk.',
            name: match[3].trim()
        };
    }

    // Case 2: "Mehl 2kg" or "Mehl 2 kg"
    match = text.match(new RegExp(`^(.+?)\\s+(\\d+[\\.,]?\\d*)\\s*(${unitRegexPart})?$`, 'i'));
    if (match) {
        return {
            name: match[1].trim(),
            quantity: parseFloat(match[2].replace(',', '.')) || 1,
            unit: match[3] || 'Stk.'
        };
    }

    // Fallback: No specific pattern, just the text
    return {
        name: text,
        quantity: 1,
        unit: 'Stk.'
    };
};
