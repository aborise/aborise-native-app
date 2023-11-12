export let parse: <T>(html: string, code: string) => Promise<ParseResult<T>>;
export type ParseResult<T> = { type: 'result'; result: T } | { type: 'error'; data: string };

export const setParse = (fn: typeof parse) => {
  parse = fn;
};
