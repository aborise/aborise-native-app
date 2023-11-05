import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import de from '~/locales/de.json';
import en from '~/locales/en.json';
import { objectMap } from '~/shared/typeHelpers';

// Set the key-value pairs for the different languages you want to support.
const i18n = new I18n({
  de,
  en,
});

// Set the locale once at the beginning of your app.
i18n.locale = 'de'; //getLocales()[0].languageCode;

export const useI18n = () => {
  return objectMap(i18n, (value, key) => {
    return typeof value === 'function' ? value.bind(i18n) : value;
  }) as unknown as I18n;
};
