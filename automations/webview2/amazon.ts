const LOGIN_URL =
  'https://www.amazon.de/-/en/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.de%2F%3Fref_%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=deflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0';
export const PRIME_URL = 'https://www.amazon.de/gp/primecentral?language=en_GB';
export const primePlanSelector =
  '.widgetMCXAccountManagementWidgetSlot nav .mcx-nav__menu li:nth-child(1) .mcx-menu-item__heading';
export const primeRenewalDateSelector =
  '.widgetMCXAccountManagementWidgetSlot nav .mcx-nav__menu li:nth-child(2) .mcx-menu-item__heading';

import { useI18n } from '~/composables/useI18n';
import { useStorage } from '~/composables/useStorage';
import { AutomationScript } from '~/shared/Page';
import { Err, Ok } from '~/shared/Result';
import { ActionReturn } from '../helpers/helpers';
import { extractAmount, extractDate } from '../helpers/strings';
import { WebViewConfig2 } from '../webview/webview.helpers';

const { t } = useI18n();

const planRegex = /(\w+) (\w+) (\d+\.\d+)/;
const renewalDateRegex = /(\d+) (\w+) (\d{4})/;
const connectScript: AutomationScript = async (page) => {
  const storage = useStorage('local');
  const auth = await storage.get(`services/amazon/login`);

  await Promise.all([
    page.locator('input[name="email"]').fill(auth!.email),
    page.locator('input[name="password"]').fill(auth!.password),
  ]);

  const wait1 = page.waitForNavigation(10000, 'complete');

  await page.locator('#signInSubmit').click();

  await wait1;

  if (await page.locator('#auth-error-message-box').exists()) {
    return Err({ message: t('login-failed-please-check-your-credentials') });
  }

  // spam guard
  while (await page.locator('#otp_submit_form').exists(500)) {
    const text = await page.locator('#channelDetailsForOtp').textContent(0);
    const alerts = await page
      .locator('#verifyAlerts')
      .textContent(0)
      .catch(() => '');

    const otp = await page.prompt({ text: `${alerts}${alerts ? '\n' : ''}${text}`, title: 'Enter OTP' });

    if (otp === null) {
      console.log('OTP not provided');
      return Err({ message: t('no-otp-provided-please-try-again') });
    }

    await page.locator('#input-box-otp').fill(otp);
    const wait2 = page.waitForNavigation(10000, 'complete');
    await page.locator('#cvf-submit-otp-button input[type="submit"]').click();
    await wait2;
  }

  // 2fa
  while (await page.locator('#auth-mfa-otpcode').exists(500)) {
    const text = t('please-enter-your-one-time-password-otp');

    const otp = await page.prompt({ text: text, title: 'Enter OTP' });

    if (otp === null) {
      return Err({ message: t('no-otp-provided-please-try-again') });
    }

    await page.locator('#auth-mfa-otpcode').fill(otp);
    const wait3 = page.waitForNavigation(10000, 'complete');
    await page.locator('#auth-signin-button').click();
    await wait3;

    if (await page.locator('#auth-error-message-box').exists(0)) {
      return Err({ message: t('wrong-otp-please-try-again') });
    }
  }

  // await new Promise((resolve) => {});

  if (page.url.includes('https://www.amazon.de/ap/forgotpassword/reverification')) {
    page.statusMessage('Please verify your password.');
    page.reveal();
    return Err({ message: t('please-verify-your-password') });
  }

  const data = await page.fetch(
    PRIME_URL,
    (doc, { primePlanSelector, primeRenewalDateSelector }) => {
      'use webview';
      const plan = doc.querySelector(primePlanSelector)?.textContent;
      const renewalDate = doc.querySelector(primeRenewalDateSelector)?.textContent;
      return {
        plan,
        renewalDate,
      };
    },
    {
      primePlanSelector,
      primeRenewalDateSelector,
    },
  );

  if (!data.plan || !data.renewalDate) {
    return Ok({
      data: [],
    });
  }

  const planMatch = data.plan!.match(planRegex);
  const renewalDateMatch = data.renewalDate!.match(renewalDateRegex);

  if (!planMatch || !renewalDateMatch) {
    return Err({ message: t('unable-to-get-plan-details-or-renewal-date-please-try-again') });
  }

  const plan = planMatch[1].toLowerCase() as 'monthly' | 'annual';
  const price = extractAmount(planMatch[3]);
  const renewalDate = extractDate(data.renewalDate);

  return Ok({
    data: [
      {
        status: 'active',
        planName: plan,
        planPrice: price ?? 0,
        nextPaymentDate: renewalDate ?? new Date().toISOString(),
        billingCycle: plan,
      },
    ],
  } satisfies ActionReturn);
};

export const connect: WebViewConfig2 = {
  url: PRIME_URL,
  getCookies: () => [], //getCookies('amazon'),
  getHeaders: () => ({
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br',
    'Alt-Used': 'www.amazon.de',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
  }),
  script: connectScript,
};
