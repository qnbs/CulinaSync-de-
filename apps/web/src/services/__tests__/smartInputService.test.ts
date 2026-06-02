import { describe, expect, it } from 'vitest';
import { lookupBarcodeItemName, parseReceiptTextToShoppingItems } from '../smartInputService';

describe('smartInputService', () => {
  it('lookupBarcodeItemName liefert Katalog-Namen', () => {
    expect(lookupBarcodeItemName('4006381333931')).toBe('Spaghetti');
    expect(lookupBarcodeItemName('999')).toBeNull();
  });

  it('parseReceiptTextToShoppingItems filtert Kassenzeilen und summiert Duplikate', () => {
    const ocr = [
      'REWE Markt',
      'Summe 12,34 EUR',
      '2x Tomaten  1,98 A',
      'Tomaten  0,99',
      'Milch 1L  1,29',
      '12.06.2026',
      '***',
    ].join('\n');

    const items = parseReceiptTextToShoppingItems(ocr);
    expect(items.some((i) => i.name.toLowerCase().includes('tomate'))).toBe(true);
    expect(items.some((i) => i.name.toLowerCase().includes('milch'))).toBe(true);
    expect(items.every((i) => i.quantity >= 1 && i.unit.length > 0)).toBe(true);
    expect(items.length).toBeLessThanOrEqual(40);
  });

  it('parseReceiptTextToShoppingItems ignoriert zu kurze Zeilen', () => {
    expect(parseReceiptTextToShoppingItems('x\n\n')).toEqual([]);
  });
});
