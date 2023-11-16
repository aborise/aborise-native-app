import { Cookies } from '@react-native-cookies/cookies';
import type { Cookie } from 'playwright-core';
import { Storage, useLargeUnsafeStorage, useStorage } from '~/composables/useStorage';
import { AllServices } from '~/shared/allServices';

export const getCookies = async (service: keyof AllServices, cookieKeys?: Array<string>) => {
  const storage: Storage = useLargeUnsafeStorage();
  const cookies = await storage.get<Cookie[]>(`services/${service}/cookies`, []);

  if (cookieKeys) {
    return cookies.filter((cookie) => cookieKeys.includes(cookie.name));
  }

  return cookies;
};

export const setCookies = (service: keyof AllServices, cookies: Cookie[]) => {
  const storage: Storage = useLargeUnsafeStorage();
  return storage.set(`services/${service}/cookies`, deduplicateCookies(cookies));
};

export const setToken = (service: keyof AllServices, token: any) => {
  const storage: Storage = useLargeUnsafeStorage();
  return storage.set(`services/${service}/api`, token);
};

export const mergeCookies = (oldCookies: Cookie[], newCookies: Cookie[]) => {
  const cookies = [...oldCookies];

  newCookies.forEach((cookie) => {
    const index = cookies.findIndex((c) => c.name === cookie.name);
    if (index === -1) {
      cookies.push(cookie);
    } else {
      cookies[index] = cookie;
    }
  });

  return cookies;
};

export const deduplicateCookies = (cookies: Cookie[]) => {
  return cookies.reduceRight((acc, cookie) => {
    const index = acc.findIndex((c) => c.name === cookie.name);
    if (index === -1) {
      acc.push(cookie);
    } else {
      acc[index] = cookie;
    }
    return acc;
  }, [] as Cookie[]);
};

const cookieToString = (cookie: Cookie) => {
  return `${cookie.name}=${cookie.value}`;
};

export const cookiesToString = (cookies: Cookie[] = []) => {
  return cookies.map(cookieToString).join('; ');
};

export const parseCookieString = (cookieString: string) => {
  cookieString = cookieString.replace(/Mon,|Tue,|Wed,|Thu,|Fri,|Sat,|Sun,/gi, (match) => {
    return match.slice(0, 3) + '!!';
  });

  return cookieString.split(',').map((str) => {
    const sections = str.split(';');
    const cookie: Partial<Cookie> = {};
    const [name, value] = sections[0].split('=');

    cookie.name = name.trim();
    // maybe urldecode
    cookie.value = value.trim();

    const parsed: Record<string, string> = {};

    sections.slice(1).forEach((section) => {
      const [key, value] = section.split('=');
      parsed[key.trim().toLowerCase()] = value?.trim() ?? 'true';
    });

    cookie.domain = parsed.domain;
    cookie.expires = parsed.expires ? new Date(parsed.expires.replace('!!', ',')).getTime() : undefined;

    if (parsed['max-age']) {
      cookie.expires = Date.now() + Number(parsed['max-age']) * 1000;
    }

    cookie.httpOnly = parsed['http-only'] === 'true';
    cookie.path = parsed.path;
    cookie.sameSite = parsed['same-site'] as 'Strict' | 'Lax' | 'None' | undefined;
    cookie.secure = parsed.secure === 'true';

    return cookie as Cookie;
  });
};

export const deviceCookiesToCookies = (cookies: Cookies) => {
  const cooks: Cookie[] = Object.values(cookies).map(
    (c) =>
      ({
        ...c,
        sameSite: 'None',
        expires: c.expires ? Number(c.expires) : Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60),
      } as Cookie),
  );

  return cooks;
};
