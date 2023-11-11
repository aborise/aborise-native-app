const LOGIN_URL =
  'https://www.amazon.de/-/en/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.de%2F%3Fref_%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=deflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0';
// const REGISTER_URL = 'https://www.paramountplus.com/de/account/signup/account';
const PRIME_URL = 'https://www.amazon.de/gp/primecentral?language=en_GB';
const primePlanSelector =
  '.widgetMCXAccountManagementWidgetSlot nav .mcx-nav__menu li:nth-child(1) .mcx-menu-item__heading';
const primeRenewalDateSelector =
  '.widgetMCXAccountManagementWidgetSlot nav .mcx-nav__menu li:nth-child(2) .mcx-menu-item__heading';

import { Response } from '~/app/details/[id]/genericWebView';
import { useStorage } from '~/composables/useStorage';
import { Err, Ok, Result } from '~/shared/Result';
import { getUserId } from '~/shared/ensureDataLoaded';
import { strToCookie } from '~/shared/helpers';
import { getCookies } from '../api/helpers/cookie';
import { FlowReturn } from '../playwright/setup/Runner';
import { extractAmount, extractDate } from '../playwright/strings';
import { WebViewConfig, javascript } from './webview.helpers';

const checkLoggedIn = (type: Response['type'], negative = false) => {
  return javascript`
    const mobile = !!document.getElementById('nav-greeting-name');
    const data = mobile || Array.from(document.querySelectorAll('[data-nav-ref]')).map(c => c.getAttribute('data-nav-ref')).includes('nav_youraccount_btn')
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
  `;
};

const generateLocationCheck = (type: Response['type'], pathName: string, negative = false) => {
  return javascript`
    const data = document.location.pathname === '${pathName}';
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
  `;
};

const hasPrimeCheck = (type: Response['type'], negative = false) => {
  return javascript`
    const data = !!(document.querySelector('a[href*="nav_AccountFlyout_prime"') ?? document.querySelector('a[href*="navm_accountmenu_prime"'))
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
  `;
};

const fillInEmailAndPw = () => {
  return (data: Record<string, unknown> = {}) => {
    if (!data.email || !data.password) return undefined;
    return javascript`
      if (!document.location.pathname.endsWith('/signin')) return
      
      const email = document.getElementById('ap_email_login') ?? document.getElementById('ap_email')
      const password = document.getElementById('ap_password')

      if (email) {
        email.value = '${data.email}';
        email.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (password) {
        password.value = '${data.password}';
        password.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `;
  };
};

const planRegex = /(\w+) (\w+) (\d+\.\d+)/;
const renewalDateRegex = /(\d+) (\w+) (\d{4})/;

const dataConverter = (data: {
  cookies: string;
  hasPrime: boolean;
  plan: string; // Annual EUR 89.90
  renewalDate: string; // 01 May 2024
}): Result<FlowReturn, { data: any }> => {
  const cookies = data.cookies
    .split(';')
    .map((c) => strToCookie(c, { domain: 'paramountplus.com', path: '/' }))
    .filter((c) => c.name === 'CBS_COM');

  if (!data.hasPrime) {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'inactive' as const,
        lastSyncedAt: new Date().toISOString(),
      },
    });
  }

  const planMatch = data.plan.match(planRegex);
  const renewalDateMatch = data.renewalDate.match(renewalDateRegex);

  if (!planMatch || !renewalDateMatch) {
    return Err({ data: { message: 'Could not parse plan or renewal date' } });
  }

  const plan = planMatch[1].toLowerCase() as 'monthly' | 'annual';
  const price = extractAmount(planMatch[3]);
  const renewalDate = extractDate(data.renewalDate);

  return Ok({
    data: {
      membershipStatus: 'active' as const,
      membershipPlan: plan,
      lastSyncedAt: new Date().toISOString(),
      nextPaymentPrice: price,
      nextPaymentDate: renewalDate,
      billingCycle: (plan === 'monthly' ? 'monthly' : 'yearly') as 'monthly' | 'yearly',
    },
    cookies,
  });
};

const dataExtractor = () => {
  return javascript`
    const cookies = document.cookie;
    const hasPrime = !!(document.querySelector('a[href*="nav_AccountFlyout_prime"') ?? document.querySelector('a[href*="navm_accountmenu_prime"')) // Array.from(document.querySelectorAll('[data-csa-c-content-id]')).map(c => c.getAttribute('data-csa-c-content-id')).includes('nav_cs_prime_video');
    
    if (hasPrime) {
      try {
        const doc = await fetch('${PRIME_URL}', {
          credentials: 'include',
          method: 'GET',
        })
        .then((res) => res.text())
        .then((text) => new DOMParser().parseFromString(text, 'text/html'))
  
        const plan = doc.querySelector('${primePlanSelector}').textContent;
        const renewalDate = doc.querySelector('${primeRenewalDateSelector}').textContent;

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { cookies, hasPrime, plan, renewalDate } }));
        return
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', data: e.message }));
      }
    }
    
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { cookies, hasPrime } }));
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
    return storage.get<{ email: string; password: string }>(`services/amazon/login`);
  },
  getCookies: () => getCookies('amazon'),
};

export const cancel: WebViewConfig = {
  url: PRIME_URL,
  sanityCheck: () => checkLoggedIn('sanity') + hasPrimeCheck('sanity'),
  targetCondition: () => hasPrimeCheck('condition', true),
  dataExtractor,
  dataConverter,
  otherCode: [fillInEmailAndPw()],
  getAuth: () => {
    const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
    return storage.get<{ email: string; password: string }>(`services/amazon/login`);
  },
  getCookies: () => getCookies('amazon'),
};

export const resume: WebViewConfig = {
  url: PRIME_URL,
  sanityCheck: () => checkLoggedIn('sanity') + hasPrimeCheck('sanity', true),
  targetCondition: () => hasPrimeCheck('condition'),
  dataExtractor,
  dataConverter,
  otherCode: [fillInEmailAndPw()],
  getAuth: () => {
    const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
    return storage.get<{ email: string; password: string }>(`services/amazon/login`);
  },
  getCookies: () => getCookies('amazon'),
};
