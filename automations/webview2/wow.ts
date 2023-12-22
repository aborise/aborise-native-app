const LOGIN_URL = 'https://www.wowtv.de/login';
export const REGISTER_URL = 'https://www.wowtv.de/waehle-dein-abo';

import { useI18n } from '~/composables/useI18n';
import { useStorage } from '~/composables/useStorage';
import { AutomationScript } from '~/shared/Page';
import { Err, Ok } from '~/shared/Result';
import { strToCookie } from '~/shared/helpers';
import { parseCookieString } from '../api/helpers/cookie';
import { WebViewConfig2 } from '../webview/webview.helpers';

const { t } = useI18n();

const connectScript: AutomationScript = async (page) => {
  const storage = useStorage('local');
  const auth = await storage.get(`services/wow/login`);

  await page.evaluate(() => {
    'use webview';
    localStorage.clear();
    localStorage.setItem(
      '_sp_local_state',
      '{"gdpr":{"mmsCookies":["_sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbKKRmbkgRgGtbE6MUqpIGZeaU4OkF0CVlBdi1tCKRYAmuD4I1IAAAA%3D"],"propertyId":28958,"messageId":962289}}',
    );
    localStorage.setItem('_sp_non_keyed_local_state', '{"gdpr":{"_sp_v1_data":"758050","_sp_v1_p":"556"}}');
    localStorage.setItem(
      '_sp_user_consent_28958',
      '{"gdpr":{"authId":null,"uuid":"e436359f-02ec-4283-ac1d-ddecc580040f_26","getMessageAlways":false,"applies":true,"actions":[],"euconsent":"CP2-3MAP2-3MAAGABCENAdEgAAAAAAAAAAYgAAAAAAAA.YAAAAAAAAAAA","grants":{"5ed7aacce94c6e0529a5e0c9":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5ebe70ceb8e05c43d547d7b4":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5f0599438a84ff0d66945688":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"641195f0c5540a06fa55618b":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5ec796b4320b5a4efd764e0f":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5ec6cb97b8e05c4a1f6784da":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5ed7abf0ff8816054eab882c":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5f2cb1d937d0572dd437ef4a":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5f044c668fd0ca106349d134":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5f058a4fe5f9fc0ff5ce36a2":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"63e0d35bd50657048f23a758":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5f0f3855bb50d16d300d30fa":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5f0f39014effda6e8bbd2006":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"6552335762f3940636cbbbb0":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5f75a2fae0e63f6e428cf4e7":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5ea2d4894e5aa15059fde8a0":{"vendorGrant":true,"purposeGrants":{"63c6d0de1dd36205b833ee3a":true}},"5ed7a9a9e0e22001da9d52ad":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false,"63c6d0de1dd36205b833ee4b":false}},"5ed79ad0af6fbe05caad4cbc":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false,"63c6d0de1dd36205b833ee4b":false}},"61f3db47293cdf751b5fbede":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false}},"5ee7add94c24944fdb5c5ac6":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false}},"5f0598aa6b78be87efa0801e":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false}},"612e105ea228634520722604":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false}},"5ed90dbc45250c5626fca053":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false}},"5ec515cab8e05c6bd60edc5f":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false}},"5ed7a92c8c242d01c4a1405e":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee46":false}},"5ed7aaa433af3005da894828":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee4b":false}},"5ed8c49c4b8ce4571c7ad801":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee4b":false,"63c6d0de1dd36205b833ee51":false}},"5e7e5243b8e05c48537f6068":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee4b":false}},"62470f577e1e3605d5bc0b8a":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee4b":false,"63c6d0de1dd36205b833ee51":false}},"5ed7a9968c242d01c4a14072":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ed7a9bb4ae82701a2e897a3":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5e542b3a4cd8884eb41b5a6c":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5fd22f3af764f72811d2c6f6":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ecb6f83b8e05c4a1f6784e8":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ebcb42c67d77b31d59836a8":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5e716fc09a0b5040d575080f":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"637be8a3a6865c0526b55e45":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5f7ee507a236ca2b6e39fba9":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5e7e1298b8e05c4854221be9":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5eeb16b365004f2a9518f5ff":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ed7ab7707a3240564038e96":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5e7786abf443bb795772efee":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5f15727991f62f6e6acf5059":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ed7ab900ce88c059af5c759":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ecd382ef5a206719df3b5d4":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5e839a38b8e05c4e491e738e":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ee9d901b34fff2f4f9cc8a7":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5f6b542ab8e05c0ce121786c":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5f2096829052593c14fbb00e":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"614c848fc21846068da28de2":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ed7a94659f6e704b17b0621":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5e7e5243b8e05c4e491e7378":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ee9d8b69791f92972ddb2e2":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5fe1db28e1860427c95c6249":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ed7a97d11619305e5ce087a":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5e7f6927b8e05c4e491e7380":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"618d345d50cf0c06e32c74b7":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5e8f6704b8e05c1c467daacd":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"6001520b535e2a28bf7d60bc":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"5ee9d8cef07b062ee4be1aa6":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}},"657b09e5b57f3005ce4bd271":{"vendorGrant":false,"purposeGrants":{"63c6d0de1dd36205b833ee51":false}}},"addtlConsent":"1~","customVendorsResponse":{"consentedVendors":[],"consentedPurposes":[],"legIntPurposes":[]},"dateCreated":"2023-12-18T21:34:25.661Z","expirationDate":"2024-06-15T21:34:25.660Z","consentStatus":{"rejectedAny":true,"rejectedLI":false,"consentedAll":false,"granularStatus":{"vendorConsent":"NONE","vendorLegInt":"EMPTY_VL","purposeConsent":"NONE","purposeLegInt":"EMPTY_VL","previousOptInAll":false,"defaultConsent":false},"hasConsentData":true,"consentedToAny":false},"categories":[],"legIntCategories":[],"vendors":[],"legIntVendors":[],"specialFeatures":[]},"version":1}',
    );
    location.reload();
  });

  const loginFormFound = await page.waitForCondition(
    () => {
      'use webview';
      return !!document.querySelector('input[name="userIdentifier"]');
    },
    {},
    10000,
  );

  let timeout = 10000;
  if (!loginFormFound) {
    timeout = 1000 * 60 * 60 * 24;
    page.reveal();
    page.statusMessage(t('at-the-moment-automatic-login-is-unavailable-please-enter-your-credentials-manually'));
  } else {
    await Promise.all([
      page.locator('input[name="userIdentifier"]').fill(auth!.email),
      page.locator('input[name="password"]').fill(auth!.password),
    ]);

    console.log('inputs filled');

    await page.locator('[data-testid="sign-in-form__submit"]').click();

    // await wait();

    if (await page.locator('.password-field__error').exists(500)) {
      console.log('Login failed');
      return Err({ message: t('login-failed-please-check-your-credentials') });
    }
  }

  const cookiesFound = await page.waitForCondition(
    () => {
      'use webview';
      return document.cookie.includes('skyCEsidismesso01') && document.cookie.includes('personaId');
    },
    {},
    timeout,
  );

  if (!cookiesFound) {
    return Err({ message: t('login-failed-please-try-again') });
  }

  const cookieStr = await page.evaluate(() => {
    'use webview';
    return document.cookie;
  });

  const cookies = cookieStr
    .split(';')
    .flatMap((cookie) => strToCookie(cookie))
    .filter((c) => c.name === 'skyCEsidismesso01' || c.name === 'personaId');
  const authToken = cookies.find((c) => c.name === 'skyCEsidismesso01')!.value;
  const personaId = cookies.find((c) => c.name === 'personaId')!.value;

  if (cookies.length !== 2) {
    return Err({ message: t('login-failed-please-check-your-credentials') });
  }

  return Ok({ cookies, token: { expires: new Date(0).getTime(), authToken, personaId } });
};

export const connect: WebViewConfig2 = {
  url: LOGIN_URL,
  getCookies: () =>
    parseCookieString(
      'OXdL266b=A7uG1n6MAQAASPx4BmaprFeWKK-NaFlZfZTQo78EN6Zytex9uBwslKnHTV4VAVCHD9Dhpi7ywH8C6TJdQ4cC6Q|1|0|bd455f1d693e588ce527ab3c9b22206d930316fd; bm_mi=FA51888278ADD02AEB8912B5C82CC231~YAAQJPAWAnt5W2WMAQAAeJDWfhY+X/D4Dm396P7r1pjYWO5BL+LpFUepx86/X+Vjr48tgpy6ds3p9/UGS2BWcGI8Op/2Hd86OKD+g0yQMX9B9p57IysVzaOrNJZHhMULdHM8XGTEnrVZ/5ONdM9XnAIX+EkJlW+6akSPfUzGGPLZt58NrdRYJljPX70atmdWtbV9lgxcDKlwPPvZ4M3wr0ZCTmt67D01hhY+IS/uAV4e/AT8EVyPm4qoG++TVnDU4JJTPT0st5MQ/fFOAXCFA3gHAK0akeXYJ1hA35l2/VB0JxTK9w//Zh5JAZygsA==~1; bm_sv=8BB6A19FB0576EF0B653E7B3B6F6C461~YAAQJPAWAkJ8W2WMAQAA6dHWfha6X0vBFW+op7URXVEDh6wrePBZqqArZcB9W6B12LYrzACMAeUr/V80VICN6waslEvBRvt1qkMWEBvryWLGb62eOJOdRYl5S7JXdS9SoFZ+Pz81LvrV28Cc8oaxZp18bO3NhLTXhSABnuYg+/kDi4JS2vSf8wAUniLwp1bxe6fmJC0W87xmpe8ETiKvtZOD6XaYI/WegbSIxnDQXzlFw0THoFJNZdT9dYYL/g==~1; euconsent-v2=CP2-3MAP2-3MAAGABCENAdEgAAAAAAAAAAYgAAAAAAAA.YAAAAAAAAAAA; consentUUID=cbfeca6a-649b-428f-8c2a-4c5f5875d894_26; consentDate=2023-12-18T21:31:01.599Z; allow_dy_tracking=false',
    ),
  script: connectScript,
};
