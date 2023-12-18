import { useStorage } from '~/composables/useStorage';
import { AutomationScript } from '~/shared/Page';
import { Err, Ok } from '~/shared/Result';
import { WebViewConfig2, standardConnectMessage, wait } from '../webview/webview.helpers';

const LOGIN_URL = 'https://www.joyn.de/mein-account';

const joinConnectScript: AutomationScript = async (page) => {
  const { email, password } = await useStorage('local').get('services/joyn/login');

  const getTokenResult = async () => {
    const tokenConfig = await page.evaluate(() => {
      'use webview';
      const tokenConfig = JSON.parse(localStorage.getItem('token')!);
      const { access_token, refresh_token } = tokenConfig as { access_token: string; refresh_token: string };
      const client_id = JSON.parse(localStorage.getItem('ajs_anonymous_id')!) as string;
      return { access_token, refresh_token, client_id };
    });

    return Ok({
      token: {
        ...tokenConfig,
        expires: Date.now() + 3600000,
      },
    });
  };

  const isCorrectUserLoggedIn = () => {
    return page.evaluate(
      (window, __, { email }) => {
        'use webview';

        window.localStorage.clear();
        document.location.reload();
        return false;

        const me = JSON.parse(localStorage.getItem('meQuery') ?? 'null') as { account: any; profile: any };
        console.log('me', me);
        if (!!me?.account) {
          if (me.profile.email === email) {
            return true;
          }
        } else {
          window.localStorage.clear();
          document.location.reload();
        }

        return false;
      },
      { email },
    );
  };

  if (await isCorrectUserLoggedIn()) {
    console.log('correct user already logged in');
    return getTokenResult();
  }

  // wait for user to be redirected to the login page.
  // If it doesnt happen in 5s, we assume it failed and give control to the user
  const result = await page.waitForCondition(
    (window, document) => {
      'use webview';
      return document.location.host === 'signin.7pass.de';
    },
    {},
    5000,
  );

  let timeout = 0;
  if (!result) {
    console.log('not on signin.7pass.de');
    page.statusMessage("We couln't log you in automatically. Please login manually.");
    page.reveal();

    // give the user enough time to login manually
    timeout = 1000 * 60 * 60 * 24;
  } else {
    // TOOD: Check if email is already filled in and NO input and ensure that it is the CORRECT mail!!!
    if (await page.locator('input[name="email"]').exists(1000)) {
      await page.locator('input[name="email"]').fill(email);
      page.locator('button[type="submit"]').click();
    } else {
      if (await page.locator('.email-badge-value').exists(1000)) {
        const emailBadgeValue = await page.locator('.email-badge-value').textContent();
        if (emailBadgeValue !== email) {
          await page.locator('.email-badge-value + div').click();
          await page.locator('input[name="email"]').fill(email);
          page.locator('button[type="submit"]').click();
          // await page.locator('button[type="submit"]').click();
        }
      }
    }

    if (!(await page.locator('input[name="password"]').exists(1000))) {
      return Err({ message: 'Login Failed. Please check your credentials!' });
    }

    await page.locator('input[name="password"]').fill(password);
    const wait2 = page.waitForNavigation(5000);
    await page.locator('button[type="submit"]').click();
    try {
      await wait2;
    } catch (e) {
      return Err({ message: 'Login Failed. Please check your credentials!' });
    }
  }

  await page.waitForCondition(
    () => {
      'use webview';
      // @ts-expect-error
      return !!JSON.parse(localStorage.getItem('meQuery') ?? 'null')?.account;
    },
    {},
    timeout,
  );

  return getTokenResult();
};

export const connect: WebViewConfig2 = {
  url: LOGIN_URL,
  getCookies: () => [], // getCookies('joyn'),
  status: standardConnectMessage,
  script: joinConnectScript,
};
