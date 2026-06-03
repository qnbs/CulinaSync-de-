import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { loadSettings } from './services/settingsService';

import translationEN from './locales/en';
import translationDE from './locales/de';

const resources = {
  en: {
    translation: translationEN
  },
  de: {
    translation: translationDE
  }
};

const settings = loadSettings();
const defaultLanguage = settings.language || 'de';

const isDev = import.meta.env.DEV;

// QNBS-v3: Fehlende Keys in Dev warnen; Prod ohne rohe Key-Anzeige (Fallback de → en)
void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: ['de', 'en'],
    returnEmptyString: false,
    interpolation: {
      escapeValue: false,
    },
    parseMissingKeyHandler: (key) => {
      if (isDev) {
        console.warn(`[i18n] missing key: ${key}`);
        return `[${key}]`;
      }
      return '';
    },
  });

export default i18n;
