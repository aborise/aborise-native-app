export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

export type Prettify<T> = T extends Array<infer U>
  ? Array<Prettify<U>>
  : T extends Record<string, unknown>
  ? { [K in keyof T]: Prettify<T[K]> }
  : T;

export type ServiceIdFromServices<T> = T extends Record<string, { id: infer U }> ? U : never;
