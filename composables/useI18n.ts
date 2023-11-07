import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import de from '~/locales/de.json';
import en from '~/locales/en.json';
import { objectMap } from '~/shared/typeHelpers';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/de';
import 'dayjs/locale/en';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

// Set the key-value pairs for the different languages you want to support.
const i18n = new I18n({
  de,
  en,
});

// Set the locale once at the beginning of your app.
i18n.locale = 'en'; //getLocales()[0].languageCode;
dayjs.locale('en');

export const useI18n = () => {
  return objectMap(i18n, (value, key) => {
    return typeof value === 'function' ? value.bind(i18n) : value;
  }) as unknown as I18n;
};

export const useDayJs = () => {
  return dayjs;
};
