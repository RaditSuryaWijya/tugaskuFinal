import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import id from './id.json';
import en from './en.json';

const LANGUAGE_KEY = '@language_key';

// Fungsi untuk menyimpan bahasa ke storage
export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Fungsi untuk mendapatkan bahasa dari storage
export const getStoredLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    return language || 'id'; // Default ke bahasa Indonesia jika belum ada
  } catch (error) {
    console.error('Error getting language:', error);
    return 'id';
  }
};

// Inisialisasi i18n
const initI18n = async () => {
  const storedLanguage = await getStoredLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        id: { translation: id },
        en: { translation: en }
      },
      lng: storedLanguage,
      fallbackLng: 'id',
      interpolation: {
        escapeValue: false
      }
    });
};

initI18n();

export default i18n;
