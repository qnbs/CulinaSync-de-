// Deep-Linking Handler für Tauri/Capacitor und Web
// Öffnet z.B. culinasync://recipe/123 oder culinasync://shoppinglist

export type DeepLinkDetail =
  | { type: 'recipe'; id: string }
  | { type: 'shoppinglist' };

export const DEEPLINK_EVENT = 'culinasync:deeplink' as const;

const getDeepLinkSegments = (parsed: URL): string[] => [
  ...(parsed.hostname ? [parsed.hostname] : []),
  ...parsed.pathname.split('/').filter(Boolean),
];

export function parseDeepLink(url: string): DeepLinkDetail | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'culinasync:') {
      return null;
    }
    const segments = getDeepLinkSegments(parsed);
    if (segments[0] === 'recipe') {
      const recipeId = segments[1];
      if (!recipeId) {
        return null;
      }
      return { type: 'recipe', id: recipeId };
    }
    if (segments[0] === 'shoppinglist' && segments.length === 1) {
      return { type: 'shoppinglist' };
    }
    return null;
  } catch {
    return null;
  }
}

export function dispatchDeepLink(detail: DeepLinkDetail): void {
  window.dispatchEvent(new CustomEvent(DEEPLINK_EVENT, { detail }));
}

export function handleDeepLink(url: string): void {
  const detail = parseDeepLink(url);
  if (detail) {
    dispatchDeepLink(detail);
  }
}
