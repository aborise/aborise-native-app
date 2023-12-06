export type Awaitable<T> = T | Promise<T>;
export type InstanceToPlain<T> = T extends { toObject: () => infer U } ? U : T;

export const objectKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[];
export const objectValues = <T extends object>(obj: T) => Object.values(obj) as T[keyof T][];
export const objectEntries = <T extends object>(obj: T) => Object.entries(obj) as [keyof T, T[keyof T]][];
export const objectMap = <T extends object, U>(obj: T, fn: (value: T[keyof T], key: keyof T, obj: T) => U) =>
  Object.fromEntries(objectEntries(obj).map(([k, v]) => [k, fn(v, k, obj)]));
