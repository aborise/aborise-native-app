import { Session } from '../helpers/client';
import { stringToDocument } from '../helpers/strings';
import { ApiData, Credentials, LoginPayload, PAGE_ITEMS_API_URL, ReactContext } from './netflix.types';

// This function also exists in the browser but is deprecated. Hence, we use our own implementation.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/unescape
var hex2 = /^[\da-f]{2}$/i;
var hex4 = /^[\da-f]{4}$/i;
export function unescape(string: string) {
  var str = String(string);
  var result = '';
  var length = str.length;
  var index = 0;
  var chr, part;
  while (index < length) {
    chr = str.charAt(index++);
    if (chr === '%') {
      if (str.charAt(index) === 'u') {
        part = str.slice(index + 1, index + 5);
        if (hex4.exec(part)) {
          result += String.fromCharCode(parseInt(part, 16));
          index += 5;
          continue;
        }
      } else {
        part = str.slice(index, index + 2);
        if (hex2.exec(part)) {
          result += String.fromCharCode(parseInt(part, 16));
          index += 2;
          continue;
        }
      }
    }
    result += chr;
  }
  return result;
}

export const extractReactContext = (document: Document): ReactContext => {
  // const javascript = document.evaluate(
  //   '//script[contains(text(), "netflix.reactContext = ")]',
  //   document,
  //   null,
  //   2
  // ).stringValue;

  const scripts = Array.from(document.getElementsByTagName('script'));
  const targetScript = scripts.find((script) => script.textContent!.includes('netflix.reactContext = '));

  try {
    const javascript = targetScript!.textContent!;
    let jsonString = javascript.slice(javascript.indexOf('netflix.reactContext = ') + 23);

    // escape backslashes
    jsonString = jsonString.replace(/\\x/g, '%').replace(/\\u/g, '%u').slice(0, -1);

    return JSON.parse(unescape(jsonString)) as ReactContext;
  } catch (e) {
    console.error('Error parsing react context', document.body.innerHTML);
    throw e;
  }
};

export const getReactContext = (client: Session, uid: string) => {
  return client
    .fetch<string>({
      url: `https://www.netflix.com/YourAccount`,
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
        Host: 'www.netflix.com',
        Referer: 'https://www.netflix.com/browse',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
        Connection: 'keep-alive',
      },
      cookieKeys: ['nfvdid', 'flwssn', 'SecureNetflixId', 'NetflixId'],
      service: 'netflix',
      user: uid,
    })
    .map(({ data }) => stringToDocument(data))
    .map((document) => extractReactContext(document));
};

export const getReactContextWithCookies = (
  client: Session,
  uid: string,
  url: string = 'https://www.netflix.com/YourAccount',
) => {
  return client
    .fetch<string>({
      url: url,
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
        Host: 'www.netflix.com',
        Referer: 'https://www.netflix.com/browse',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
        Connection: 'keep-alive',
      },
      cookieKeys: ['nfvdid', 'flwssn', 'SecureNetflixId', 'NetflixId'],
      service: 'netflix',
      user: uid,
    })
    .map(async ({ data, cookies }) => ({
      data: await stringToDocument(data),
      cookies,
    }))
    .map(({ data: document, cookies }) => ({
      cookies,
      data: extractReactContext(document),
    }));
};

export const getApiData = async (reactContext: ReactContext | Promise<ReactContext>): Promise<ApiData> => {
  const json = await reactContext;
  const apiData = {} as unknown as ApiData;

  for (const key in PAGE_ITEMS_API_URL) {
    const k = key as keyof typeof PAGE_ITEMS_API_URL;
    apiData[k] = PAGE_ITEMS_API_URL[k](json);
  }

  return apiData;
};

export const checkMembershipStatus = (membershipStatus: string): void => {
  if (membershipStatus !== 'CURRENT_MEMBER') {
    throw new Error(`User membership status is ${membershipStatus}`);
  }
};

export const getLoginPayload = async (
  credentials: Credentials,
  authUrl: string,
  _reactContext: ReactContext,
): Promise<LoginPayload> => {
  // const countryId = reactContext.models.loginContext.data.geo.requestCountry.id;
  // const countryCodes = reactContext.models.countryCodes.data.codes;
  // const siteKey = reactContext.models.loginContext.data.flow.fields.recaptchaSitekey.value;
  // let countryCode = '';
  // try {
  //   countryCode = '+' + countryCodes.find((dictItem) => dictItem.id === countryId)?.code;
  // } catch (error) {
  //   console.error(error);
  // }

  // const Captcha = await import('2captcha-ts');
  // // A new 'solver' instance with your API key
  // const solver = new Captcha.Solver('05cf4a22eefb49f3936d5da76b5912b9');

  // console.log('solving captcha...');

  // // Example reCAPTCHA Website
  // const response = await solver.recaptcha({
  //   pageurl: 'https://www.netflix.com/de/login',
  //   googlekey: siteKey,
  //   min_score: 0.9,
  //   enterprise: 1,
  //   version: 'v3',
  //   action: 'login',
  // });

  // console.log('captcha solved!');

  // 25/08/2020 since a few days there are login problems, by returning the "incorrect password" error even
  //   when it is correct, it seems that setting 'rememberMe' to 'false' increases a bit the probabilities of success
  return {
    userLoginId: credentials.email,
    password: credentials.password,
    // rememberMe: 'false',
    flow: 'websiteSignUp',
    mode: 'login',
    action: 'loginAction',
    withFields:
      'rememberMe,nextPage,userLoginId,password,countryCode,countryIsoCode,recaptchaResponseToken,recaptchaError,recaptchaResponseTime',
    authURL: authUrl,
    nextPage: '',
    showPassword: '',
    countryCode: '+49',
    countryIsoCode: 'DE',
    recaptchaResponseToken: '', //response.data,
    // recaptchaResponseTime: 10,
    recaptchaError: 'LOAD_TIMED_OUT',
    cancelType: '',
    cancelReason: '',
  };
};
