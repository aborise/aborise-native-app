import { Response } from '~/app/details/[id]/genericWebView';
import { useStorage } from '~/composables/useStorage';
import { AutomationScript, EvaluatedScript } from '~/shared/Page';
import { Err, Ok, Result } from '~/shared/Result';
import { getUserId } from '~/shared/ensureDataLoaded';
import { ActionError, ActionReturn } from '../helpers/helpers';
import { WebViewConfig2, javascript, standardConnectMessage } from '../webview/webview.helpers';
import { useI18n } from '~/composables/useI18n';

const LOGIN_URL = 'https://my.plus.rtl.de/account';
const { t } = useI18n();

const checkLoggedIn = (type: Response['type'], negative = false) => {
  return javascript`
    const data = location.host === 'my.plus.rtl.de' && location.pathname === '/account';
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
    `;
};

type RTLExtractor = {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_expires_in: number;
  refresh_token: string;
  client_id: 'rtlplus-web';
};

const dataConverter = (data: RTLExtractor): Result<ActionReturn, ActionError> => {
  const { access_token, refresh_token, client_id, expires_in, refresh_expires_in } = data;

  return Ok({
    token: {
      access_token,
      refresh_token,
      client_id,
      expires: Date.now() + expires_in * 1000,
      refresh_expires: Date.now() + refresh_expires_in * 1000,
    },
  });
};

const rtlConnectScript: AutomationScript = async (page) => {
  const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
  const { email, password } = await storage.get(`services/rtl/login`);

  const checkLogin: EvaluatedScript<boolean> = () => {
    'use webview';
    return (
      location.host === 'my.plus.rtl.de' &&
      location.pathname === '/account' &&
      // @ts-expect-error
      !!JSON.parse(localStorage['0-rtlplus-ffc'])?.authnResult
    );
  };

  const isLoggedIn = () => page.waitForCondition(checkLogin, undefined, 1000);

  const getData = () => {
    return page.evaluate((window) => {
      'use webview';
      // @ts-expect-error
      const { access_token, expires_in, id_token, refresh_expires_in, refresh_token } = JSON.parse(
        localStorage['0-rtlplus-ffc'],
      ).authnResult;
      const client_id = 'rtlplus-web';

      return { access_token, expires_in, id_token, refresh_expires_in, refresh_token, client_id } as const;
    });
  };

  if (await isLoggedIn()) {
    console.log('already logged in');
    // return dataConverter(await getData());
    // we cannot be sure that the correct user is logged in. Therefore we clear the local storage and reload the page
    // this will logout the user and force him to login again
    await page.evaluate((window) => {
      'use webview';
      localStorage.clear();
      location.reload();
    });
  }

  const ensureLoginPage = await page.waitForCondition((window, document) => {
    'use webview';
    return document.location.host === 'auth.rtl.de';
  });

  let timeout = 3000;
  if (!ensureLoginPage) {
    timeout = 1000 * 60 * 60 * 24;
    page.statusMessage(t('at-the-moment-automatic-login-is-unavailable-please-enter-your-credentials-manually'));
    page.reveal();
  } else {
    await Promise.all([
      page.locator('input[name="username"]').fill(email),
      page.locator('input[name="password"]').fill(password),
    ]);

    await page.locator('button[type="submit"]').click();

    const correctLogin = await page.waitForCondition(
      (window, document) => {
        'use webview';
        return document.location.host !== 'auth.rtl.de';
      },
      undefined,
      1000,
    );

    if (!correctLogin) {
      return Err({ message: t('login-failed-please-check-your-credentials') });
    }
  }

  await page.waitForCondition(checkLogin, undefined, timeout);

  return dataConverter(await getData());
};

export const connect: WebViewConfig2 = {
  url: LOGIN_URL,
  getCookies: () => [],
  script: rtlConnectScript,
};
