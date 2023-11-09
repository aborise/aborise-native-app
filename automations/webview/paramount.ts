const LOGIN_URL = 'https://www.paramountplus.com/account/signin/';
const REGISTER_URL = 'https://www.paramountplus.com/de/account/signup/account';

import { Response } from '~/app/details/[id]/genericWebView';
import { useStorage } from '~/composables/useStorage';
import { Err, Ok, Result } from '~/shared/Result';
import { getUserId } from '~/shared/ensureDataLoaded';
import { strToCookie } from '~/shared/helpers';
import { getCookies } from '../api/helpers/cookie';
import { ReactContext, UserContext } from '../api/utils/netflix.types';
import { FlowReturn } from '../playwright/setup/Runner';
import { extractAmount, extractDate } from '../playwright/strings';
import { WebViewConfig, javascript } from './webview.helpers';

const checkLoggedIn = (type: Response['type'], negative = false) => {
  return javascript`
    const data = document.cookie.includes('CBS_COM=');
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
  `;
};

const generateLocationCheck = (type: Response['type'], pathName: string, negative = false) => {
  return javascript`
    const data = document.location.pathname === '${pathName}';
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
  `;
};

const fillInEmailAndPw = () => {
  return (data: Record<string, unknown> = {}) => {
    if (!data.email || !data.password) return undefined;
    return javascript`
      if (!document.location.pathname.endsWith('account/signin/')) return
      const email = document.getElementById('email');
      const password = document.getElementById('password');

      // email.focus();
      email.value = '${data.email}';
      email.dispatchEvent(new Event('input', { bubbles: true }));
      // password.focus();
      password.value = '${data.password}';
      password.dispatchEvent(new Event('input', { bubbles: true }));
    `;
  };
};

const dataConverter = (data: { cookies: string }): Result<FlowReturn, { data: any }> => {
  const cookies = data.cookies
    .split(';')
    .map((c) => strToCookie(c, { domain: 'paramountplus.com', path: '/' }))
    .filter((c) => c.name === 'CBS_COM');

  return Ok({
    cookies,
    data: {
      membershipStatus: 'inactive',
      lastSyncedAt: new Date().toISOString(),
    },
  });
};

const dataExtractor = () => {
  return javascript`
    const cookies = document.cookie;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { cookies } }));
  `;
};

export const connect: WebViewConfig = {
  url: LOGIN_URL,
  sanityCheck: () => checkLoggedIn('sanity', true),
  targetCondition: () => checkLoggedIn('condition'),
  dataExtractor,
  dataConverter,
  otherCode: [fillInEmailAndPw()],
  getAuth: () => {
    const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
    return storage.get<{ email: string; password: string }>(`services/paramount/login`).then((data) => {
      console.log('getAuth:', data);
      return data;
    });
  },
  getCookies: () => {
    return getCookies('paramount', ['CBS_COM']);
  },
};
