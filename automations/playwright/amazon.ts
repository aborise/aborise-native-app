import { Page } from 'playwright-core';
import { raceElements } from './helpers';
import { run } from './setup/setup';
import { extractAmount, extractDate, t } from './strings';

const OTP_ID = '#auth-mfa-otpcode';
const PW_ID = '#ap_password';
const TWOFA_ID = '';
// const LOGOUT_ID = '#nav-item-signout';
const LOGIN = '[data-nav-ref="nav_ya_signin"]';
const ACCOUNT = '[data-nav-ref="nav_youraccount_btn"]';
const PRIME = '#primeDetailPage';

const loginHelper = async ({ page, info, ask }: { page: Page; info: Record<string, string>; ask: any }) => {
  const { email, password } = info;
  await page.locator('[data-nav-role="signin"]').first().click();
  await page.locator('#ap_email').first().fill(email);
  await page.locator('#continue').first().click();
  if (!(await page.locator(PW_ID).isVisible())) {
    return t('loginFailed');
  }
  await page.locator('#ap_password').fill(password);
  await page.locator('#signInSubmit').click();

  const checkLogin = await raceElements(page, [PW_ID, OTP_ID, TWOFA_ID]);

  if (checkLogin === PW_ID) {
    return t('loginFailed');
  }
  // if ((await raceElements(page, [PW_ID, OTP_ID])) === PW_ID) {
  //   return t('loginFailed');
  // }
  if (checkLogin === OTP_ID) {
    const otp = await ask(t('otpPrompt'));
    await page.locator(OTP_ID).fill(otp);
    await page.locator('#auth-signin-button').click();
    if ((await raceElements(page, [PRIME, OTP_ID])) === OTP_ID) {
      return t('otpFailed');
    }
  } else if (checkLogin === TWOFA_ID) {
    await ask(t('twofaPrompt'));
    await page.locator(PRIME).waitFor({ timeout: 60 * 1000 });
  }
};

export const connect = run(async ({ page, info, ask, Ok, Err }) => {
  await page.goto('https://www.amazon.de/amazonprime');

  if ((await raceElements(page, [LOGIN, ACCOUNT])) === LOGIN) {
    const loginResult = await loginHelper({ page, info, ask });
    if (loginResult) {
      return Err(loginResult);
    }
  }

  const cookies = await page.context().cookies();

  if (await page.locator('#prime-header-CTA').isVisible()) {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'inactive',
      },
    });
  }

  await page.locator('.mcx-nav__toggle').click();
  const nextPaymentPrice = await page
    .locator('.mcx-menu__list')
    .locator('li')
    .nth(1)
    .locator('.mcx-menu-item__heading')
    .innerText();
  const nextPaymentDate = await page
    .locator('.mcx-menu__list')
    .locator('li')
    .nth(2)
    .locator('.mcx-menu-item__heading')
    .innerText();
  // FIXME: extract "jährlich" or "monatlich" from price

  const billingCycle = 'yearly';
  // await page.locator('#nav-hamburger-menu').click();
  // await page.locator('#hmenu-content').locator('li').nth(37).click();

  return Ok({
    cookies,
    data: {
      membershipStatus: 'active' as const,
      membershipPlan: null,
      nextPaymentPrice: extractAmount(nextPaymentPrice),
      nextPaymentDate: extractDate(nextPaymentDate) ?? nextPaymentDate,
      billingCycle,
    },
  });
});

// OTP Password Reset
// id="authportal-main-section"
// Auwahl E-MAil oder Handy: data-a-input-name="OTPChallengeOptions" first()!!
// Button = id="a-autoid-0"
// Nächste Seite OTP_Eingabe:
// Formular: id="verification-code-form"
// Input: id="cvf-input-code"
