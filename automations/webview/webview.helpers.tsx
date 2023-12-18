import { Cookie } from 'playwright-core';
import { Result } from '~/shared/Result';
import { Awaitable } from '~/shared/typeHelpers';
import { ActionReturn } from '../helpers/helpers';
import React from 'react';
import { SizableText } from 'tamagui';
import { AutomationScript } from '~/shared/Page';

export type WebViewConfig = {
  url: string;
  status?: () => React.JSX.Element;
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

export type WebViewConfig2 = {
  url: string;
  status?: () => React.JSX.Element;
  getCookies: () => Awaitable<Cookie[]>;
  getHeaders?: () => Awaitable<Record<string, string>>;
  script: AutomationScript;
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
})();
true;
`;
};

export const standardConnectMessage = () => (
  <SizableText size="$4" fontWeight={'bold'}>
    We're trying to log you in automatically. If this takes longer than expected, please continue the login process
    manually.
  </SizableText>
);

export const wait = (t = 60 * 1000 * 30) => new Promise((resolve) => setTimeout(resolve, t));
