const LOGIN_URL = 'https://www.paramountplus.com/account/signin/?redirectUrl=%2Faccount%2F';
const REGISTER_URL = 'https://www.paramountplus.com/de/account/signup/account';
// const CONNECT_URL = 'https://www.paramountplus.com/account/';
const REACTIVATE_URL = 'https://www.paramountplus.com/de/account/signup/plan/';

import { Response } from '~/app/details/[id]/genericWebView';
import { useStorage } from '~/composables/useStorage';
import { Err, Ok, Result } from '~/shared/Result';
import { getUserId } from '~/shared/ensureDataLoaded';
import { strToCookie } from '~/shared/helpers';
import { getCookies } from '../api/helpers/cookie';
import { ActionReturn, BillingCycle } from '../helpers/helpers';
import { timeZoneToUtc } from '../helpers/strings';
import { AccountData, Plan } from './validators/paramount_userData';
import { WebViewConfig, javascript } from './webview.helpers';

const checkLoggedIn = (type: Response['type'], negative = false) => {
  return javascript`
    const data = document.cookie.includes('CBS_COM=');
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
  `;
};

const checkStatus = (type: Response['type'], status: AccountData['user']['statusCode'][]) => {
  return javascript`
    const app = document.getElementById('app')
    const account = document.getElementById('account-app');
    let data;
    if (app) {
      data = { user: app.__vue__.$store.state.user };
    }

    if (account) {
      data = account.__vue__.$store.state.serverData;
    }

    data = [${status.map((s) => `'${s}'`).join(',')}].includes(data.user.statusCode);

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data }));
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

const dataConverter = (data: {
  cookies: string;
  accountData: AccountData;
  plan: Plan | undefined;
}): Result<ActionReturn, { data: any }> => {
  const cookies = data.cookies
    .split(';')
    .map((c) => strToCookie(c, { domain: 'paramountplus.com', path: '/' }))
    .filter((c) => c.name === 'CBS_COM');

  const { user, currentSubscription } = data.accountData;

  if (user.statusCode === 'reg') {
    return Ok({
      cookies,
      data: {
        status: 'preactive',
        lastSyncedAt: new Date().toISOString(),
      },
    } satisfies ActionReturn);
  }

  if (user.isExSubscriber) {
    return Ok({
      cookies,
      data: {
        status: 'inactive',
        lastSyncedAt: new Date().toISOString(),
      },
    } satisfies ActionReturn);
  }

  if (user.isSubscriber) {
    const planPrice = currentSubscription.plan_bill_amount * currentSubscription.currency_subunits;

    if (currentSubscription.cancel_date) {
      const expiresAt = timeZoneToUtc(
        currentSubscription.sub_end_date.date,
        currentSubscription.sub_end_date.timezone,
      ).toISOString();

      return Ok({
        cookies,
        data: {
          status: 'canceled',
          planName: data.plan?.planTier ?? 'standard',
          lastSyncedAt: new Date().toISOString(),
          expiresAt,
          planPrice,
          billingCycle: (data.plan?.planType ?? 'monthly') === 'monthly' ? 'monthly' : 'annual',
        },
      } satisfies ActionReturn);
    }

    const nextPaymentDate = timeZoneToUtc(
      currentSubscription.next_bill_date.date,
      currentSubscription.next_bill_date.timezone,
    ).toISOString();

    return Ok({
      cookies,
      data: {
        status: 'active',
        planName: 'basic',
        lastSyncedAt: new Date().toISOString(),
        planPrice,
        nextPaymentDate: nextPaymentDate,
        billingCycle: 'monthly',
      },
    } satisfies ActionReturn);
  }

  return Err({ data: user });
};

const dataExtractor = () => {
  return javascript`
    const cookies = document.cookie;

    const app = document.getElementById('app')
    const account = document.getElementById('account-app');
    let data;
    let plan;
    if (app) {
      data = { user: app.__vue__.$store.state.user };
    }

    if (account) {
      data = account.__vue__.$store.state.serverData;
      plan = account.__vue__.$store.state.plan;
    }

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { cookies, accountData: data, plan } }));
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
    return storage.get<{ email: string; password: string }>(`services/paramount/login`);
  },
  getCookies: () => getCookies('paramount', ['CBS_COM']),
  // getCookies: async () => {
  //   const cookies = await getCookies('paramount', ['CBS_COM']);

  //   const cookieBanner: Cookie = {
  //     name: 'OptanonConsent',
  //     value:
  //       'isIABGlobal=false&datestamp=Thu+Nov+09+2023+15%3A32%3A27+GMT%2B0000+(Greenwich+Mean+Time)&version=6.30.0&hosts=&consentId=590d5518-38f4-4796-b128-42c164de9a30&interactionCount=1&landingPath=NotLandingPage&groups=1%3A1%2C2%3A0%2C3%3A0%2C4%3A0%2C5%3A0&geolocation=DE%3BMV&AwaitingReconsent=false',
  //     domain: 'paramountplus.com',
  //     path: '/',
  //     expires: new Date().getTime() / 1000 + 60 * 60 * 24 * 7,
  //     httpOnly: false,
  //     sameSite: 'None',
  //     secure: false,
  //   };

  //   return [
  //     ...cookies,
  //     cookieBanner,
  //     // strToCookie(`OptanonAlertBoxClosed=${new Date().toISOString()}`, { domain: 'paramountplus.com', path: '/' }),
  //   ];
  // },
};

export const register: WebViewConfig = {
  url: REGISTER_URL,
  sanityCheck: () => checkLoggedIn('sanity', true),
  targetCondition: () => checkLoggedIn('condition'),
  dataExtractor,
  dataConverter,
  otherCode: [fillInEmailAndPw()],
  getAuth: () => {
    const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
    return storage.get<{ email: string; password: string }>(`services/paramount/login`);
  },
  getCookies: () => [],
};

export const reactivate: WebViewConfig = {
  url: REACTIVATE_URL,
  sanityCheck: () => checkStatus('sanity', ['exsub', 'reg']),
  targetCondition: () => checkStatus('condition', ['sub']),
  dataExtractor,
  dataConverter,
  otherCode: [fillInEmailAndPw()],
  getAuth: () => {
    const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
    return storage.get<{ email: string; password: string }>(`services/paramount/login`);
  },
  getCookies: () => getCookies('paramount', ['CBS_COM']),
};
