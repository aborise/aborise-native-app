const LOGIN_URL = 'https://www.paramountplus.com/account/signin/?redirectUrl=%2Faccount%2F';
const REGISTER_URL = 'https://www.paramountplus.com/de/account/signup/account';
const CONNECT_URL = 'https://www.paramountplus.com/account/';

import { Response } from '~/app/details/[id]/genericWebView';
import { useStorage } from '~/composables/useStorage';
import { Err, Ok, Result } from '~/shared/Result';
import { getUserId } from '~/shared/ensureDataLoaded';
import { strToCookie } from '~/shared/helpers';
import { getCookies } from '../api/helpers/cookie';
import { ReactContext, UserContext } from '../api/utils/netflix.types';
import { FlowReturn } from '../playwright/setup/Runner';
import { extractAmount, extractDate, timeZoneToUtc } from '../playwright/strings';
import { WebViewConfig, javascript } from './webview.helpers';
import { Cookie } from 'playwright-core';
import { AccountData, Plan, UserData, userDataSchema } from './validators/paramount_userData';

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

const dataConverter = (data: {
  cookies: string;
  accountData: AccountData;
  plan: Plan | undefined;
}): Result<FlowReturn, { data: any }> => {
  const cookies = data.cookies
    .split(';')
    .map((c) => strToCookie(c, { domain: 'paramountplus.com', path: '/' }))
    .filter((c) => c.name === 'CBS_COM');

  const { user, currentSubscription } = data.accountData;

  if (user.statusCode === 'reg') {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'preactive' as const,
        lastSyncedAt: new Date().toISOString(),
      },
    });
  }

  if (user.isExSubscriber) {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'inactive' as const,
        lastSyncedAt: new Date().toISOString(),
      },
    });
  }

  if (user.isSubscriber) {
    const nextPaymentPrice = currentSubscription.plan_bill_amount * currentSubscription.currency_subunits;

    if (currentSubscription.cancel_date) {
      const expiresAt = timeZoneToUtc(
        currentSubscription.sub_end_date.date,
        currentSubscription.sub_end_date.timezone,
      ).toISOString();

      return Ok({
        cookies,
        data: {
          membershipStatus: 'canceled' as const,
          membershipPlan: data.plan?.planTier ?? 'standard',
          lastSyncedAt: new Date().toISOString(),
          expiresAt,
          nextPaymentPrice,
          billingCycle: ((data.plan?.planType ?? 'monthly') === 'monthly' ? 'monthly' : 'yearly') as
            | 'monthly'
            | 'yearly',
        },
      });
    }

    const nextPaymentDate = timeZoneToUtc(
      currentSubscription.next_bill_date.date,
      currentSubscription.next_bill_date.timezone,
    ).toISOString();

    return Ok({
      cookies,
      data: {
        membershipStatus: 'active' as const,
        membershipPlan: 'basic',
        lastSyncedAt: new Date().toISOString(),
        nextPaymentPrice,
        nextPaymentDate: nextPaymentDate,
        billingCycle: 'monthly' as const,
      },
    });
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
  getCookies: async () => {
    const cookies = await getCookies('paramount', ['CBS_COM']);

    const cookieBanner: Cookie = {
      name: 'OptanonConsent',
      value:
        'isIABGlobal=false&datestamp=Thu+Nov+09+2023+15%3A32%3A27+GMT%2B0000+(Greenwich+Mean+Time)&version=6.30.0&hosts=&consentId=590d5518-38f4-4796-b128-42c164de9a30&interactionCount=1&landingPath=NotLandingPage&groups=1%3A1%2C2%3A0%2C3%3A0%2C4%3A0%2C5%3A0&geolocation=DE%3BMV&AwaitingReconsent=false',
      domain: 'paramountplus.com',
      path: '/',
      expires: new Date().getTime() / 1000 + 60 * 60 * 24 * 7,
      httpOnly: false,
      sameSite: 'None',
      secure: false,
    };

    return [
      ...cookies,
      cookieBanner,
      // strToCookie(`OptanonAlertBoxClosed=${new Date().toISOString()}`, { domain: 'paramountplus.com', path: '/' }),
    ];
  },
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
