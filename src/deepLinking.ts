// Deep-Linking Handler für Tauri/Capacitor und Web
// Öffnet z.B. culinasync://recipe/123 oder culinasync://shoppinglist

export function handleDeepLink(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'culinasync:') return;
    const path = parsed.pathname.replace(/^\//, '');
    // Beispiel: /recipe/123
    if (path.startsWith('recipe/')) {
      const recipeId = path.split('/')[1];
      // TODO: Navigation zu Rezept-Detail
      window.dispatchEvent(new CustomEvent('deeplink', { detail: { type: 'recipe', id: recipeId } }));
    } else if (path === 'shoppinglist') {
      window.dispatchEvent(new CustomEvent('deeplink', { detail: { type: 'shoppinglist' } }));
    }
    // Weitere Deep-Links nach Bedarf
  } catch (e) {
    // Ungültige URL ignorieren
  }
}
