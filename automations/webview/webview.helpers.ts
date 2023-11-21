import { Cookie } from 'playwright-core';
import { Result } from '~/shared/Result';
import { Awaitable } from '~/shared/typeHelpers';
import { ActionReturn } from '../helpers/helpers';

export type WebViewConfig = {
  url: string;
  sanityCheck: () => string;
  targetUrl?: string;
  targetCondition?: () => string;
  dataExtractor: () => string;
  getCookies: () => Awaitable<Cookie[]>;
  dataConverter: (data: any) => Awaitable<Result<ActionReturn, { data: any }>>;
  getAuth?: () => Awaitable<{ email: string; password: string } | null>;
  getHeaders?: () => Awaitable<Record<string, string>>;
  otherCode?: Array<(data: Record<string, unknown>) => string | undefined>;
};

export const javascript = (strings: TemplateStringsArray, ...values: any[]) => {
  const str = strings.reduce((acc, curr, i) => {
    return acc + curr + (values[i] ?? '');
  }, '');

  // wrap with iife and try/catch and return true to prevent errors
  return /* javascript */ `
;(async function() {
  try {
${str}
  } catch (e) {
    console.error(e);
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', data: e.message }));
  }
  return true;
})();
`;
};
