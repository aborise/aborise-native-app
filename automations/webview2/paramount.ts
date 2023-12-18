const LOGIN_URL = 'https://www.paramountplus.com/account/signin/?redirectUrl=%2Faccount%2F';
const REGISTER_URL = 'https://www.paramountplus.com/de/account/signup/account';
// const CONNECT_URL = 'https://www.paramountplus.com/account/';
const REACTIVATE_URL = 'https://www.paramountplus.com/de/account/signup/plan/';

import { useStorage } from '~/composables/useStorage';
import { AutomationScript } from '~/shared/Page';
import { Err, Ok, Result } from '~/shared/Result';
import { getUserId } from '~/shared/ensureDataLoaded';
import { strToCookie } from '~/shared/helpers';
import { ActionError, ActionReturn } from '../helpers/helpers';
import { timeZoneToUtc } from '../helpers/strings';
import { AccountData, Plan } from '../webview/validators/paramount_userData';
import { WebViewConfig2, standardConnectMessage } from '../webview/webview.helpers';

type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

const dataConverter = (data: {
  cookies: string;
  accountData: AccountData;
  plan: Plan | undefined;
}): Result<ActionReturn, ActionError> => {
  const cookies = data.cookies
    .split(';')
    .map((c) => strToCookie(c, { domain: 'paramountplus.com', path: '/' }))
    .filter((c) => c.name === 'CBS_COM');

  const { user, currentSubscription } = data.accountData;

  if (user.statusCode === 'reg') {
    return Ok({
      cookies,
      data: [],
    } satisfies ActionReturn);
  }

  if (user.isExSubscriber) {
    return Ok({
      cookies,
      data: [],
    } satisfies ActionReturn);
  }

  if (user.isSubscriber) {
    const planPrice = currentSubscription.plan_bill_amount * currentSubscription.currency_subunits;

    if (currentSubscription.cancel_date) {
      const expiresAt = timeZoneToUtc(
        currentSubscription.sub_end_date.date,
        currentSubscription.sub_end_date.timezone,
      ).toISOString();

      return Ok({
        cookies,
        data: [
          {
            status: 'canceled',
            planName: data.plan?.planTier ?? 'standard',
            expiresAt,
            planPrice,
            billingCycle: (data.plan?.planType ?? 'monthly') === 'monthly' ? 'monthly' : 'annual',
          },
        ],
      } satisfies ActionReturn);
    }

    const nextPaymentDate = timeZoneToUtc(
      currentSubscription.next_bill_date.date,
      currentSubscription.next_bill_date.timezone,
    ).toISOString();

    return Ok({
      cookies,
      data: [
        {
          status: 'active',
          planName: 'basic',
          planPrice,
          nextPaymentDate: nextPaymentDate,
          billingCycle: 'monthly',
        },
      ],
    } satisfies ActionReturn);
  }

  return Err({ data: user, message: 'Login failed' });
};

type VueAppHostElement = HTMLElement & {
  __vue__: { $store: { state: { user: AccountData['user']; serverData: AccountData; plan: Plan } } };
};

const paramountConnectScript: AutomationScript = async (page) => {
  const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
  const { email, password } = await storage.get(`services/paramount/login`);

  await Promise.all([page.locator('#email').fill(email), page.locator('#password').fill(password)]);

  await page.locator('#sign-in-form button').click();

  const isLoggedIn = await page.waitForCondition((window, document) => {
    'use webview';
    const app = document.getElementById('app') as unknown as VueAppHostElement;

    const account = document.getElementById('account-app') as unknown as VueAppHostElement;
    let accountData: AccountData;
    if (app) {
      // @ts-expect-error
      accountData = { user: app.__vue__.$store.state.user };
    }

    if (account) {
      accountData = account.__vue__.$store.state.serverData;
    }

    // @ts-expect-error
    return accountData?.user?.isLoggedIn;
  });

  if (!isLoggedIn) {
    return Err({ message: 'Login failed. Check your credentials.' });
  }

  const result = await page.evaluate((window, document) => {
    'use webview';
    const cookies = document.cookie;

    const app = document.getElementById('app') as unknown as VueAppHostElement;

    const account = document.getElementById('account-app') as unknown as VueAppHostElement;
    let accountData: AccountData;
    let plan;
    if (app) {
      // @ts-expect-error
      accountData = { user: app.__vue__.$store.state.user };
    }

    if (account) {
      accountData = account.__vue__.$store.state.serverData;
      plan = account.__vue__.$store.state.plan;
    }

    // @ts-expect-error
    return { cookies, accountData, plan };
  });

  return dataConverter(result);
};

export const connect: WebViewConfig2 = {
  url: LOGIN_URL,
  getCookies: () => [], //getCookies('paramount', ['CBS_COM']),
  script: paramountConnectScript,
};
