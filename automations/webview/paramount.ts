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
import { Cookie } from 'playwright-core';
import { UserData, userDataSchema } from './validators/paramount_userData';

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

// available keys: ["entitlement","isLoggedIn","displayName","regID","profile","svod","statusCode","isSubscriber","isThirdParty","isExSubscriber","isSuspended","isGhost","isMVPDAuthZ","isMVPDAuthZExSub","isActive","isPartnerSubscription","isReseller","isRecurly","isLC","isCF","isCompUser","isRegistered","isOptimum","isUnsupportedVendor","isMonthlyPlan","isAnnualPlan","canEdit","provideNativeDeviceSubSettingsLink","needsUpdate","edu","isMVPD","userRegistrationCountry","isUserRegionOnSunset","tags","mvpdDispute"]
const dataConverter = (data: { cookies: string; userData: UserData }): Result<FlowReturn, { data: any }> => {
  const cookies = data.cookies
    .split(';')
    .map((c) => strToCookie(c, { domain: 'paramountplus.com', path: '/' }))
    .filter((c) => c.name === 'CBS_COM');

  if (data.userData.isExSubscriber) {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'inactive' as const,
        lastSyncedAt: new Date().toISOString(),
      },
    });
  }

  if (data.userData.isSubscriber) {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'active' as const,
        membershipPlan: 'basic',
        lastSyncedAt: new Date().toISOString(),
        nextPaymentPrice: { integer: 1, decimal: 99 },
        nextPaymentDate: new Date().toISOString(),
        billingCycle: 'monthly' as const,
      },
    });
  }

  return Err({ data: data.userData });
};

const dataExtractor = () => {
  return javascript`
    const cookies = document.cookie;
    const userData = document.getElementById('app').__vue__.$store.state.user;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { cookies, userData } }));
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
