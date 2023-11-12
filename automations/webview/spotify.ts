const LOGIN_URL = 'https://accounts.spotify.com/login?continue=https%3A%2F%2Fwww.spotify.com%2Faccount%2Foverview%2F';
const REGISTER_URL = 'https://www.spotify.com/de/account/signup/account';
// const CONNECT_URL = 'https://www.spotify.com/account/';
const REACTIVATE_URL = 'https://www.spotify.com/de/account/signup/plan/';

// https://www.spotify.com/de/api/account/v1/datalayer/
// {
// 	"isTrialUser": false,
// 	"currentPlan": "family_premium_v2",
// 	"isRecurring": true,
// 	"daysLeft": 26,
// 	"accountAgeDays": 3296,
// 	"isSubAccount": false
// }

// https://www.spotify.com/de/api/account/v2/plan/
// {
// 	"cta": {
// 		"label": "Abo ändern",
// 		"href": "/de/account/subscription/change/",
// 		"gaData": {
// 			"category": "Account Pages",
// 			"action": "Subscription Widget CTA clicked",
// 			"label": "change plan"
// 		},
// 		"kind": null,
// 		"disabled": false
// 	},
// 	"secondCta": {
// 		"label": "Abo kündigen",
// 		"href": "/de/account/cancel/",
// 		"gaData": {
// 			"category": "Account Pages",
// 			"action": "Subscription Widget CTA clicked",
// 			"label": "cancel premium"
// 		},
// 		"kind": null,
// 		"disabled": false
// 	},
// 	"plan": {
// 		"description": null,
// 		"benefits": [
// 			"Bis zu 6 Premium oder Kids Konten",
// 			"Unangemessene Musik blockieren",
// 			"Zugriff auf Spotify Kids",
// 			"Jederzeit kündbar"
// 		],
// 		"name": "Premium Family",
// 		"overline": null,
// 		"infoHref": "https://support.spotify.com/de/article/start-or-join-family-plan/",
// 		"infoLabel": "Mehr Infos zu deinem Abo",
// 		"note": null,
// 		"expiryDate": null,
// 		"brandingV2": {
// 			"encoreColorSetName": "premiumFamily",
// 			"fallbackEncoreColorSetName": "premiumFallback",
// 			"mainBrandingHexColor": "#A5BBD1"
// 		}
// 	},
// 	"title": "Dein Abo",
// 	"note": null,
// 	"freeModule": null,
// 	"paymentInfo": {
// 		"title": "Zahlung",
// 		"billingInfo": "Du erhältst deine nächste Rechnung in Höhe von <b class=\"recurring-price\">17,99 €</b> am <b class=\"recurring-date\">08.12.23</b>.",
// 		"note": null,
// 		"paymentMethod": {
// 			"name": "Visa-Karte mit folgenden letzten Ziffern: 4507",
// 			"icon": "<svg viewBox=\"0 0 350 250\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path fill=\"#F8F8F8\" d=\"M320 250H30c-16.6 0-30-13.4-30-30V30C0 13.4 13.4 0 30 0h290c16.6 0 30 13.4 30 30v190c0 16.6-13.4 30-30 30z\"/>\n    <path fill=\"#E7E7E7\" d=\"M320 10c11 0 20 9 20 20v190c0 11-9 20-20 20H30c-11 0-20-9-20-20V30c0-11 9-20 20-20h290m0-10H30C13.4 0 0 13.4 0 30v190c0 16.6 13.4 30 30 30h290c16.6 0 30-13.4 30-30V30c0-16.6-13.4-30-30-30z\"/>\n    <path fill=\"#0F2496\" d=\"M146.9 82.1l-18.4 85.4h22.2l18.4-85.4h-22.2zm143 0H271c-4.2 0-7.9 2.5-9.4 6.2l-33.4 79.2h23.3l4.6-12.8h28.5l2.7 12.8h20.6l-18-85.4zm-27.3 55.1l11.6-32 6.7 32h-18.3zM114 82.1l-23.1 58.1-9.4-49.4c-1.2-5.6-5.4-8.8-10.3-8.8H33.6l-.5 2.5c7.8 1.7 16.5 4.4 21.9 7.2 3.2 1.9 4.2 3.4 5.2 7.6l17.7 68.3h23.4l36.1-85.4H114v-.1zm84.3 23.8c0-3 3-6.4 9.4-7.1 3.2-.3 12-.7 21.9 3.9l3.9-18.2c-5.4-1.9-12.3-3.7-20.7-3.7-21.9 0-37.4 11.6-37.6 28.3-.2 12.3 11.1 19.2 19.4 23.3 8.6 4.2 11.6 6.9 11.5 10.6 0 5.7-6.9 8.3-13.3 8.4-11.1.2-17.7-3-22.8-5.4l-4 18.7c5.2 2.4 14.8 4.4 24.8 4.6 23.4 0 38.6-11.5 38.8-29.2-.2-22.9-31.5-24.3-31.3-34.2z\" />\n</svg>\n",
// 			"expiry": "02/2028",
// 			"paymentExpires": "Läuft ab am:",
// 			"uppercase": false
// 		},
// 		"updateCta": {
// 			"label": "Aktualisieren",
// 			"href": "/de/account/subscription/update/?callbackUrl=%2Fde%2Faccount%2Foverview%2F",
// 			"gaData": {
// 				"category": "Account Pages",
// 				"action": "Update Payment Method",
// 				"label": "account-overview"
// 			},
// 			"kind": null,
// 			"disabled": false
// 		},
// 		"footer": null
// 	},
// 	"resubscriptionData": false
// }

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
    const data = document.cookie.includes('sp_dc');
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
      
      const email = document.getElementById('login-username');
      const password = document.getElementById('login-password');
      const button = document.getElementById('login-button');

      email.value = '${data.email}';
      email.dispatchEvent(new Event('input', { bubbles: true }));

      password.value = '${data.password}';
      password.dispatchEvent(new Event('input', { bubbles: true }));

      button.click();
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
    .map((c) => strToCookie(c, { domain: 'spotify.com', path: '/' }))
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

    const data = document.getElementById('app')

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
    return storage.get<{ email: string; password: string }>(`services/spotify/login`);
  },
  getCookies: () => getCookies('spotify', ['sp_dc']),
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
    return storage.get<{ email: string; password: string }>(`services/spotify/login`);
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
    return storage.get<{ email: string; password: string }>(`services/spotify/login`);
  },
  getCookies: () => getCookies('spotify', ['CBS_COM']),
};
