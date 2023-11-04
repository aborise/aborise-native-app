import WebView from 'react-native-webview';
import { Err, Ok, Result } from '~/shared/Result';
import { strToCookie } from '~/shared/helpers';
import { ReactContext, UserContext } from '../api/utils/netflix.types';
import { FlowReturn } from '../playwright/setup/Runner';
import { extractAmount, extractDate } from '../playwright/strings';
import { getCookies } from '../api/helpers/cookie';
import { Response } from '~/app/details/[id]/genericWebView';
import { Cookie } from 'playwright-core';
import { Awaitable } from '~/shared/typeHelpers';

type WebViewConfig = {
  url: string;
  sanityCheck: () => string;
  targetUrl?: string;
  targetCondition?: () => string;
  dataExtractor: () => string;
  getCookies: () => Awaitable<Cookie[]>;
  dataConverter: (data: any) => Result<FlowReturn, { data: any }>;
};

const generateMembershipCheck = (membershipStatus: UserContext['membershipStatus'], type: Response['type']) => {
  return /* javascript */ `
    // try {
      const data = window.netflix.reactContext.models.userInfo.data.membershipStatus === '${membershipStatus}';
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data }));
    // } catch (e) {
    //   window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', data: e.message }));
    // }
    true;
  `;
};

const generateLocationCheck = (type: Response['type'], pathName: string, negative = false) => {
  return /* javascript */ `
    // try {
      {
      const data = document.location.pathname === '${pathName}';
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
      // } catch (e) {
        //   window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', data: e.message }));
        // }
      }
      true;
  `;
};

const checkAnonymous = (type: Response['type']) => generateMembershipCheck.bind(null, 'ANONYMOUS', type);
const checkCurrentMember = (type: Response['type']) => generateMembershipCheck.bind(null, 'CURRENT_MEMBER', type);
const checkFormerMember = (type: Response['type']) => generateMembershipCheck.bind(null, 'FORMER_MEMBER', type);
/** pathName e.g. /browse */
const checkLocation = (type: Response['type'], pathName: string) => generateLocationCheck.bind(null, type, pathName);
const negativeCheckLocation = (type: Response['type'], pathName: string) =>
  generateLocationCheck.bind(null, type, pathName, true);

const dataConverter = (data: {
  signupContext: ReactContext['models']['signupContext']['data'];
  userInfo: UserContext;
  cookies: string;
}): Result<FlowReturn, { data: any }> => {
  if (data.userInfo.membershipStatus === 'ANONYMOUS') {
    return Err({ data });
  }

  const cookies = data.cookies.split(';').map(strToCookie);
  let flowReturn: FlowReturn['data'];

  if (data.userInfo.membershipStatus === 'CURRENT_MEMBER') {
    if (data.signupContext.flow.fields.nextBillingDate) {
      flowReturn = {
        membershipStatus: 'active',
        billingCycle: 'monthly',
        membershipPlan: data.signupContext.flow.fields.currentPlan.fields.localizedPlanName.value,
        nextPaymentDate: extractDate(data.signupContext.flow.fields.nextBillingDate.value),
        nextPaymentPrice: extractAmount(data.signupContext.flow.fields.currentPlan.fields.planPrice.value),
        lastSyncedAt: new Date().toISOString(),
      };
    } else {
      flowReturn = {
        membershipStatus: 'canceled',
        expiresAt: extractDate(data.signupContext.flow.fields.periodEndDate.value),
        lastSyncedAt: new Date().toISOString(),
      };
    }
  } else if (data.userInfo.membershipStatus === 'NEVER_MEMBER') {
    flowReturn = {
      membershipStatus: 'preactive',
      lastSyncedAt: new Date().toISOString(),
    };
  } else {
    flowReturn = {
      membershipStatus: 'inactive',
      lastSyncedAt: new Date().toISOString(),
    };
  }

  return Ok({
    cookies,
    data: flowReturn,
  });
};

const dataExtractor = () => {
  return /* javascript */ `(function() {
    const { signupContext, userInfo } = window.netflix.reactContext.models;
    const cookies = document.cookie;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'condition', { signupContext: signupContext.data, userInfo: userInfo.data, cookies } }));
    true;
  })();
  true;`;
};

// const MEMBERSHIP_STATUS_MAP = {
//   CURRENT_MEMBER: 'active',
//   ANONYMOUS: 'inactive',
//   FORMER_MEMBER: 'inactive',
//   NEVER_MEMBER: 'preactive',
// };

export const register: WebViewConfig = {
  url: 'https://www.netflix.com/signup',
  sanityCheck: checkAnonymous('sanity'),
  targetCondition: () => negativeCheckLocation('sanity', '/browse')() + checkCurrentMember('condition')(),
  dataExtractor,
  dataConverter,
  getCookies: () => {
    // Make sure user doesnt see cookie banner
    return [strToCookie('hasSeenCookieDisclosure=true')];
  },
};

export const reactivate: WebViewConfig = {
  url: 'https://www.netflix.com/signup/planform',
  sanityCheck: checkFormerMember('sanity'),
  targetCondition: () => negativeCheckLocation('sanity', '/browse')() + checkCurrentMember('condition')(),
  dataExtractor,
  dataConverter,
  getCookies: () => {
    return getCookies('netflix', ['NetflixId', 'SecureNetflixId', 'flwssn', 'nfvdid']);
  },
};
