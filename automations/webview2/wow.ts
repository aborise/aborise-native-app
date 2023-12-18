const LOGIN_URL = 'https://www.wowtv.de/login';
export const REGISTER_URL = 'https://www.wowtv.de/waehle-dein-abo';

import { useStorage } from '~/composables/useStorage';
import { AutomationScript } from '~/shared/Page';
import { Err, Ok } from '~/shared/Result';
import { ActionReturn } from '../helpers/helpers';
import { extractAmount, extractDate } from '../helpers/strings';
import { WebViewConfig2, standardConnectMessage } from '../webview/webview.helpers';

const connectScript: AutomationScript = async (page) => {
  const storage = useStorage('local');
  const auth = await storage.get(`services/wow/login`);

  await Promise.all([
    page.locator('input[name="userIdentifier"]').fill(auth!.email),
    page.locator('input[name="password"]').fill(auth!.password),
  ]);

  const wait = page.waitForNavigation();

  await page.locator('[data-testid="sign-in-form__submit"]').click();

  await wait;

  if (await page.locator('.password-field__error').exists(500)) {
    console.log('Login failed');
    return Err({ message: 'Login failed. Please chekc' });
  }
};

export const connect: WebViewConfig2 = {
  url: LOGIN_URL,
  getCookies: () => [],
  status: standardConnectMessage,
  script: connectScript,
};
