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
