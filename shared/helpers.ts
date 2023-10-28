import type { Cookie } from "playwright-core";
import { parse, serialize } from "cookie-es";
import alluuid from "react-native-uuid";

export const getStorageKey = (service: string, key: string) => {
  return `${service}-${key}`;
};

export const strToCookie = (cookieStr: string) => {
  const parsed = parse(cookieStr);
  const name = Object.keys(parsed)[0];
  const value = parsed[name];

  const cookie: Cookie = {
    name,
    value,
    domain: parsed.Domain,
    path: parsed.Path,
    expires: parsed.Expires
      ? new Date(parsed.Expires).getTime() / 1000
      : parsed.MaxAge
      ? Date.now() / 1000 + Number(parsed.MaxAge)
      : 0,
    httpOnly: !!parsed.HttpOnly,
    secure: !!parsed.Secure,
    sameSite: parsed.SameSite as "Strict" | "Lax" | "None",
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
    sameSite:
      (cookie.sameSite?.toLowerCase() as "strict" | "lax" | "none") ?? "none",
  });
};

export const uuid = () => alluuid.v4() as string;
