import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
  
import translationEN from "./en.json";
import translationHR from "./hr.json";

const resources = {
  hr: {
    translation: translationHR
  },
  en: {
    translation: translationEN
  }
};


i18n
  .use(initReactI18next) // Initialize i18next
  .init({
    resources,
    supportedLngs: ['en', 'hr'], // Add supported languages
    lng: "hr", // Default language
    fallbackLng: 'hr', // Default language
    debug: true, // Show debug logs
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;