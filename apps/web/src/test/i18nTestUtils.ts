import type { TOptions } from 'i18next';

type Json = Record<string, unknown>;

const interpolate = (template: string, options?: TOptions): string => {
  if (!options) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = (options as Record<string, unknown>)[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
};

export const resolveLocaleValue = (
  translations: Json,
  key: string,
  options?: TOptions & { returnObjects?: boolean },
): unknown => {
  const parts = key.split('.');
  let current: unknown = translations;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Json)) {
      current = (current as Json)[part];
    } else {
      return options?.returnObjects ? {} : key;
    }
  }

  if (options?.returnObjects) {
    return current ?? {};
  }

  if (typeof current === 'string') {
    return interpolate(current, options);
  }

  return key;
};

/** Deterministic `t` for Vitest when modules import `i18next` directly. */
export const createI18nTestT = (
  translations: Json,
  overrides: Record<string, string> = {},
) => (key: string, options?: TOptions & { returnObjects?: boolean }) => {
  if (key in overrides) return overrides[key];
  return resolveLocaleValue(translations, key, options);
};
