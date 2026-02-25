import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { loadSettings } from './services/settingsService';

import translationEN from './locales/en/translation.json';
import translationDE from './locales/de/translation.json';

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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
