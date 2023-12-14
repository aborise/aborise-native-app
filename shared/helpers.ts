import { parse, serialize } from 'cookie-es';
import { router } from 'expo-router';
import type { Cookie } from 'playwright-core';
import alluuid from 'react-native-uuid';
import { Service } from './validators';
import UXCam from 'react-native-ux-cam';

export const getStorageKey = (service: string, key: string) => {
  return `${service}-${key}`;
};

export const strToCookie = (cookieStr: string, fallback: Partial<Cookie> = {}) => {
  const parsed = parse(cookieStr);
  const name = Object.keys(parsed)[0];
  const value = parsed[name];

  const cookie: Cookie = {
    name,
    value,
    domain: parsed.Domain ?? fallback.domain,
    path: parsed.Path ?? fallback.path,
    expires: parsed.Expires
      ? new Date(parsed.Expires).getTime() / 1000
      : parsed.MaxAge
      ? Math.floor(Date.now() / 1000 + Number(parsed.MaxAge))
      : fallback.expires ?? Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7),
    httpOnly: !!parsed.HttpOnly,
    secure: parsed.Secure ? true : fallback.secure ?? false,
    sameSite: (parsed.SameSite as 'Strict' | 'Lax' | 'None') ?? fallback.sameSite,
  };

  return cookie;
};

export const cookieToStr = (cookie: Cookie) => {
  return serialize(cookie.name, cookie.value, {
    domain: cookie.domain,
    path: cookie.path,
    expires: new Date(cookie.expires * 1000),
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: (cookie.sameSite?.toLowerCase() as 'strict' | 'lax' | 'none') ?? 'none',
  });
};

export const uuid = () => alluuid.v4() as string;

export const getActionDefinition = (service: Service, action: string) => {
  return service.actions.find((a) => a.name === action)!;
};

export const shouldLog = () => {
  return process.env.EXPO_PUBLIC_DISABLE_LOGGING !== 'true';
};

export const logEvent = (event: string, data: any) => {
  if (shouldLog()) {
    UXCam.logEvent(event, data);
  }
};

export const tagScreen = (screen: string) => {
  if (shouldLog()) {
    UXCam.tagScreenName(screen);
  }
};
