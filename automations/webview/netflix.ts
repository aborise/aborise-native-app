import { Response } from '~/app/details/[id]/genericWebView';
import { Err, Ok, Result } from '~/shared/Result';
import { strToCookie } from '~/shared/helpers';
import { getCookies } from '../api/helpers/cookie';
import { ReactContext, UserContext } from '../api/utils/netflix.types';
import { ActionReturn } from '../helpers/helpers';
import { extractAmount, extractDate } from '../helpers/strings';
import { WebViewConfig, javascript } from './webview.helpers';

const generateMembershipCheck = (status: UserContext['status'][], type: Response['type']) => {
  return javascript`
    const data = [${status
      .map((s) => `'${s}'`)
      .join(',')}].includes(window.netflix.reactContext.models.userInfo.data.status)
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data }));
  `;
};

const generateLocationCheck = (type: Response['type'], pathName: string, negative = false) => {
  return javascript`
    const data = document.location.pathname === '${pathName}';
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
  `;
};

const checkAnonymous = (type: Response['type']) => generateMembershipCheck.bind(null, ['ANONYMOUS'], type);
const checkCurrentMember = (type: Response['type']) => generateMembershipCheck.bind(null, ['CURRENT_MEMBER'], type);
const checkFormerMember = (type: Response['type']) => generateMembershipCheck.bind(null, ['FORMER_MEMBER'], type);
const checkNeverOrFormerMember = (type: Response['type']) =>
  generateMembershipCheck.bind(null, ['NEVER_MEMBER', 'FORMER_MEMBER'], type);
/** pathName e.g. /browse */
const checkLocation = (type: Response['type'], pathName: string) => generateLocationCheck.bind(null, type, pathName);
const negativeCheckLocation = (type: Response['type'], pathName: string) =>
  generateLocationCheck.bind(null, type, pathName, true);

const dataConverter = (data: {
  signupContext: ReactContext['models']['signupContext']['data'];
  userInfo: UserContext;
  cookies: string;
}): Result<ActionReturn, { data: any }> => {
  if (data.userInfo.status === 'ANONYMOUS') {
    return Err({ data });
  }

  const cookies = data.cookies.split(';').map((c) => strToCookie(c, { domain: '.netflix.com', path: '/' }));
  let ActionReturn: ActionReturn['data'];

  if (data.userInfo.status === 'CURRENT_MEMBER') {
    if (data.signupContext.flow.fields.nextBillingDate) {
      ActionReturn = {
        status: 'active',
        billingCycle: 'monthly',
        planName: data.signupContext.flow.fields.currentPlan.fields.localizedPlanName.value,
        nextPaymentDate: extractDate(data.signupContext.flow.fields.nextBillingDate.value)!,
        planPrice: extractAmount(data.signupContext.flow.fields.currentPlan.fields.planPrice.value)!,
        lastSyncedAt: new Date().toISOString(),
      };
    } else {
      ActionReturn = {
        status: 'canceled',
        expiresAt: extractDate(data.signupContext.flow.fields.periodEndDate.value),
        lastSyncedAt: new Date().toISOString(),
        planPrice: extractAmount(data.signupContext.flow.fields.currentPlan.fields.planPrice.value),
        billingCycle: 'monthly',
        planName: data.signupContext.flow.fields.currentPlan.fields.localizedPlanName.value,
      };
    }
  } else if (data.userInfo.status === 'NEVER_MEMBER') {
    ActionReturn = {
      status: 'preactive',
      lastSyncedAt: new Date().toISOString(),
    };
  } else {
    ActionReturn = {
      status: 'inactive',
      lastSyncedAt: new Date().toISOString(),
    };
  }

  return Ok({
    cookies,
    data: ActionReturn,
  });
};

const dataExtractor = () => {
  return javascript`
    const { signupContext, userInfo } = window.netflix.reactContext.models;
    const cookies = document.cookie;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { signupContext: signupContext.data, userInfo: userInfo.data, cookies } }));
  `;
};

// const MEMBERSHIP_STATUS_MAP = {
//   CURRENT_MEMBER: 'active',
//   ANONYMOUS: 'inactive',
//   FORMER_MEMBER: 'inactive',
//   NEVER_MEMBER: 'preactive',
// };

export const register: WebViewConfig = {
  url: 'https://www.netflix.com/signup',
  sanityCheck: () => negativeCheckLocation('sanity', '/browse')() + checkAnonymous('sanity')(),
  targetCondition: checkCurrentMember('condition'),
  dataExtractor,
  dataConverter,
  getCookies: () => {
    // Make sure user doesnt see cookie banner
    return [strToCookie('hasSeenCookieDisclosure=true')];
  },
};

export const reactivate: WebViewConfig = {
  url: 'https://www.netflix.com/signup/planform',
  sanityCheck: () => negativeCheckLocation('sanity', '/browse')() + checkNeverOrFormerMember('sanity')(),
  targetCondition: checkCurrentMember('condition'),
  dataExtractor,
  dataConverter,
  getCookies: () => {
    return getCookies('netflix', ['NetflixId', 'SecureNetflixId', 'flwssn', 'nfvdid']).then((c) =>
      c.concat(strToCookie('hasSeenCookieDisclosure=true')),
    );
  },
};
