export let parse: (html: string, code: string) => Promise<ParseResult>;
export type ParseResult = { type: 'result'; result: any } | { type: 'error'; data: string };

export const setParse = (fn: typeof parse) => {
  parse = fn;
};
