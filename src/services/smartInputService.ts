import { parseShoppingItemString } from './utils';

type ParsedItem = { name: string; quantity: number; unit: string };

const barcodeCatalog: Record<string, string> = {
  '4006381333931': 'Spaghetti',
  '4311501653790': 'Milch',
  '7613034626844': 'Nudeln',
  '5411188111824': 'Haferflocken',
  '5000159484695': 'Ketchup',
};

const ignoredLinePatterns = [
  /summe|gesamt|mwst|rabatt|bon|beleg|kasse|zahlung|ec|karte|wechselgeld/i,
  /\d{2}[./-]\d{2}[./-]\d{2,4}/,
  /^\d{2}:\d{2}/,
  /^\*+$/,
  /^[-=]{3,}$/,
];

const cleanName = (value: string): string => {
  return value
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\s.,/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const parseReceiptLine = (line: string): ParsedItem | null => {
  const trimmed = cleanName(line);
  if (!trimmed || trimmed.length < 2) return null;
  if (ignoredLinePatterns.some((pattern) => pattern.test(trimmed))) return null;

  const withoutTrailingPrice = trimmed.replace(/\s\d+[.,]\d{2}\s?[A-Z]?$/i, '').trim();
  if (!withoutTrailingPrice) return null;

  const parsed = parseShoppingItemString(withoutTrailingPrice);
  if (!parsed.name || parsed.name.length < 2) return null;

  const quantity = Number.isFinite(parsed.quantity) && parsed.quantity > 0 ? parsed.quantity : 1;
  return {
    name: parsed.name,
    quantity,
    unit: parsed.unit || 'Stk.',
  };
};

export const parseReceiptTextToShoppingItems = (ocrText: string): ParsedItem[] => {
  const lines = ocrText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 300);

  const deduped = new Map<string, ParsedItem>();

  for (const line of lines) {
    const item = parseReceiptLine(line);
    if (!item) continue;

    const key = item.name.toLowerCase();
    const existing = deduped.get(key);
    if (existing) {
      deduped.set(key, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      deduped.set(key, item);
    }
  }

  return Array.from(deduped.values()).slice(0, 40);
};

export const lookupBarcodeItemName = (barcode: string): string | null => {
  return barcodeCatalog[barcode] || null;
};
