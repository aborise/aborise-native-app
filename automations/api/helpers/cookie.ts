import { getDatabase, ref, get, set } from "firebase/database";
import { AllServices } from "~/shared/allServices";
import type { Cookie } from "playwright-core";
import { useFirebaseApp } from "~/composables/useFirebase";
import { Storage, useStorage } from "~/composables/useStorage";

export const getCookies = async (
  service: keyof AllServices,
  cookieKeys?: Array<string>,
  storage: Storage = useStorage("local")
) => {
  const cookies = await storage.get<Cookie[]>(
    `services/${service}/cookies`,
    []
  );

  if (cookieKeys) {
    return cookies.filter((cookie) => cookieKeys.includes(cookie.name));
  }

  return cookies;
};

export const setCookies = (
  service: keyof AllServices,
  cookies: Cookie[],
  storage: Storage = useStorage("local")
) => {
  return storage.set(
    `services/${service}/cookies`,
    deduplicateCookies(cookies)
  );
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
  return cookies.map(cookieToString).join("; ");
};
