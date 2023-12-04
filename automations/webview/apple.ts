const LOGIN_URL = 'https://tv.apple.com/';
// const REGISTER_URL = 'https://www.paramountplus.com/de/account/signup/account';
// const CONNECT_URL = 'https://www.paramountplus.com/account/';
// const REACTIVATE_URL = 'https://www.paramountplus.com/de/account/signup/plan/';

import CookieManager from '@react-native-cookies/cookies';
import { Response } from '~/app/details/[id]/genericWebView';
import { useStorage } from '~/composables/useStorage';
import { Err, Ok, Result } from '~/shared/Result';
import { getUserId } from '~/shared/ensureDataLoaded';
import { aboFetch } from '../api/helpers/client';
import { deviceCookiesToCookies, getCookies } from '../api/helpers/cookie';
import { ActionReturn } from '../helpers/helpers';
import { WebViewConfig, javascript, standardConnectMessage } from './webview.helpers';

const checkLoggedIn = (type: Response['type'], negative = false) => {
  return javascript`
    const data = document.cookie.includes('media-user-token=');
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
  `;
};

// const checkStatus = (type: Response['type'], status: AccountData['user']['statusCode'][]) => {
//   return javascript`
//     const app = document.getElementById('app')
//     const account = document.getElementById('account-app');
//     let data;
//     if (app) {
//       data = { user: app.__vue__.$store.state.user };
//     }

//     if (account) {
//       data = account.__vue__.$store.state.serverData;
//     }

//     data = [${status.map((s) => `'${s}'`).join(',')}].includes(data.user.statusCode);

//     window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data }));
//   `;
// };

// const generateLocationCheck = (type: Response['type'], pathName: string, negative = false) => {
//   return javascript`
//     const data = document.location.pathname === '${pathName}';
//     window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
//   `;
// };

const fillInEmailAndPw = () => {
  return (data: Record<string, unknown> = {}) => {
    if (!data.email || !data.password) return undefined;
    return javascript`
      document.querySelector(".nav-header__user-controls button.commerce-button").click()
      
      setTimeout(() => {
        const iframe = document.querySelector("#ck-modal iframe");
        if (!iframe.loading) {
          return fillEmailAndClick();
        }
        iframe.addEventListener("load", fillEmailAndClick);
      }, 1000);
      
      function fillEmailAndClick() {
        const iframe = document.querySelector("#ck-modal iframe");
      
        const checkHasEmail = setInterval(() => {
          const email = iframe.contentDocument.getElementById("accountName");
          if (email) {
            clearInterval(checkHasEmail);
            fillEmail();
          }
        }, 100)
      
        function fillEmail() {
          const email = iframe.contentDocument.getElementById("accountName");
      
          email.value = '${data.email}';
          email.dispatchEvent(new Event("input", { bubbles: true }));
      
          setTimeout(() => {
            iframe.contentDocument.querySelector('[data-test="layout-onboarding-auth-button"]').click();
          }, 1000);
        }
      
      }
      
      // function fillPasswordAndClick() {
      //   const outerIframe = document.querySelector("#ck-modal iframe");
      //   const innerIframe = outerIframe.contentDocument.getElementById("aid-auth-widget-iFrame");
      //   const password = innerIframe.contentDocument.getElementById("password_text_field");
      //   password.value = '${data.password}';
      //   password.dispatchEvent(new Event("input", { bubbles: true }));
      // }
      
    `;
  };
};

const dataConverter = async (data: { token: string }): Promise<Result<ActionReturn, { data: any }>> => {
  //   const cookies = data.cookies
  //     .split(';')
  //     .map((c) => strToCookie(c, { domain: '.apple.com', path: '/' }))
  //     .filter((c) => c.name === 'media-user-token');

  const cookies = deviceCookiesToCookies(await CookieManager.get('https://tv.apple.com', true));

  const mediaToken = cookies.find((c) => c.name === 'media-user-token');

  const result = await aboFetch<{
    data: [{ id: 'me'; type: 'accounts'; href: '/v1/me/account'; attributes: { restrictions: {} } }];
    meta: { subscription: { active: false; storefront: 'de' } };
  }>({
    url: 'https://amp-api.music.apple.com/v1/me/account?meta=subscription',
    method: 'GET',
    cookies,
    headers: {
      Origin: 'https://tv.apple.com',
      authorization: `Bearer ${data.token}`,
      'media-user-token': mediaToken?.value,
    },
  });

  if (result.err) {
    return Err({ data: result.val });
  }

  if (!result.val.data.meta.subscription.active) {
    return Ok({
      cookies,
      data: [],
    } satisfies ActionReturn);
  } else {
    return Ok({
      cookies,
      data: [
        {
          status: 'active',
          billingCycle: 'monthly',
          planName: 'Unknown',
          nextPaymentDate: new Date().toISOString(),
          planPrice: 0,
        },
      ],
    } satisfies ActionReturn);
  }

  //   return Err({ data: result.val });
};

const dataExtractor = () => {
  return javascript`
    const meta = document.querySelector('meta[name="web-tv-app/config/environment"]').getAttribute("content");
    const config = JSON.parse(decodeURIComponent(meta));
    const token = config.MEDIA_API.token;

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { token } }));
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
    return storage.get<{ email: string; password: string }>(`services/apple/login`);
  },
  getCookies: () => getCookies('apple', ['media-user-token']),
  status: standardConnectMessage,
};

// export const register: WebViewConfig = {
//   url: REGISTER_URL,
//   sanityCheck: () => checkLoggedIn('sanity', true),
//   targetCondition: () => checkLoggedIn('condition'),
//   dataExtractor,
//   dataConverter,
//   otherCode: [fillInEmailAndPw()],
//   getAuth: () => {
//     const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
//     return storage.get<{ email: string; password: string }>(`services/apple/login`);
//   },
//   getCookies: () => [],
// };

// export const reactivate: WebViewConfig = {
//   url: REACTIVATE_URL,
//   sanityCheck: () => checkStatus('sanity', ['exsub', 'reg']),
//   targetCondition: () => checkStatus('condition', ['sub']),
//   dataExtractor,
//   dataConverter,
//   otherCode: [fillInEmailAndPw()],
//   getAuth: () => {
//     const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
//     return storage.get<{ email: string; password: string }>(`services/apple/login`);
//   },
//   getCookies: () => getCookies('apple', ['media-user-token']),
// };
