import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '../htmlSanitizer';

describe('htmlSanitizer', () => {
  it('text-Mode entfernt jedes Markup', () => {
    expect(sanitizeHtml('<b>Milch</b><script>alert(1)</script>', 'text')).toBe('Milch');
  });

  it('html-Mode behält sichere Tags und entfernt Script/Iframe', () => {
    const out = sanitizeHtml('<p>Pasta</p><script>x</script><iframe src="x"></iframe>', 'html');
    expect(out).toContain('<p>Pasta</p>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('iframe');
  });
});
