import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';  // Pastikan path benar
import id from './id.json';  // Pastikan path benar

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      id: { translation: id }
    },
    lng: 'en',  // Bahasa default
    fallbackLng: 'en',  // Jika bahasa yang dipilih tidak ada terjemahannya
    interpolation: { escapeValue: false }
  });

export default i18n;
