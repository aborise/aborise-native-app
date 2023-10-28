import { Page } from 'playwright-core';
import { Err } from '~/shared/Result';
import { BillingCycle, raceElements } from './helpers';
import { run } from './setup/setup';
import { extractAmount, extractDate, t } from './strings';
import dayjs from 'dayjs';

const PW_ID = '#loginPassword';
const EMAIL_ERR = '[data-gv2containerkey="modalContainer"]';
const OTP_ID = '[data-gv2elementkey="enterPasscode"]';
const OTP_ERR = '.form-input-digit padding--right-2 padding--left-2 is-invalid';
const PW_ERR = '[data-testid="text-input-error"]';
const PROFILE_SELECTION = '[data-testid="profiles-wrapper"]';
const LOGIN = '#loginEmail';
const PROFILE = '[data-testid="profile-avatar-0"]';

const loginHelper = async ({ page, info, ask }: { page: Page; info: Record<string, string>; ask: any }) => {
  const { email, password } = info;
  if (await page.locator('#onetrust-banner-sdk').isVisible()) {
    await page.locator('#onetrust-reject-all-handler').click();
  }
  await page.locator('[data-gv2elementkey="email"]').fill(email);
  await page.getByTestId('login-continue-button').click();

  const checkMail = await raceElements(page, [EMAIL_ERR, PW_ID, OTP_ID]);

  if (checkMail === EMAIL_ERR) {
    return t('loginFailed');
  }

  if (checkMail === PW_ID) {
    await page.getByPlaceholder('Password').fill(password);
    await page.getByTestId('password-continue-login').click();

    if ((await raceElements(page, [PW_ERR, PROFILE_SELECTION])) === PW_ERR) {
      return t('loginFailed');
    }
  } else if (checkMail === OTP_ID) {
    const otp: string = await ask(t('otpPrompt'));
    await Promise.all(
      otp.split('').map(async (x, index) => {
        await page.getByTestId(`digit-${index}`).type(x);
      }),
    );
    await page.getByTestId('enter-passcode-submit-button').click();

    if ((await raceElements(page, [OTP_ERR, PROFILE_SELECTION])) === OTP_ERR) {
      return t('otpFailed');
    }
  }
};

const logoutHelper = async ({ page }: { page: Page }) => {
  await page.getByTestId('account-dropdown-list').hover();
  await page.getByText('Log Out').click();
};

const paymentHelper = async ({ page, info }: { page: Page; info: Record<string, string> }) => {
  const { firstName, lastName, creditCardNumber, creditCardExpirationMonth, creditCardExpirationYear, creditCardCvv } =
    info;
  await page.getByTestId('toggle-month').click();
  // await page.getByTestId('toggle-year').click();
  await page.getByTestId('credit-radio-icon').click();
  // await page.getByTestId('klarna-radio-icon').click();
  // await page.getByTestId('paypal-radio-icon').click();
  await page.locator('[data-gv2elementkey="name_on_card"]').fill(`${firstName} ${lastName}`);
  await page.locator('[data-gv2elementkey="card_number"]').fill(creditCardNumber);
  await page.locator('[data-gv2elementkey="mm_yy"]').fill(`${creditCardExpirationMonth}/${creditCardExpirationYear}`);
  await page.locator('[data-gv2elementkey="cvv"]').fill(creditCardCvv);
  await page.getByTestId('credit-submit-button').click();
  await page.getByTestId('review-subscription-credit-submit-button').click();
  // // TODO: banking individual credit card 3D secure process
  // await page.frameLocator('[data-testid="challengeFrame"]').frameLocator('iframe[name="cardinal-stepUpIframe-1693928667705"]').getByLabel('DE_Password input').fill('440852');
  // await page.frameLocator('[data-testid="challengeFrame"]').frameLocator('iframe[name="cardinal-stepUpIframe-1693928667705"]').getByLabel('Überprüfen').click();
  // await page.frameLocator('[data-testid="challengeFrame"]').frameLocator('iframe[name="cardinal-stepUpIframe-1693928667705"]').getByLabel('DE_One time password input').click();
  // await page.frameLocator('[data-testid="challengeFrame"]').frameLocator('iframe[name="cardinal-stepUpIframe-1693928667705"]').getByLabel('DE_One time password input').fill('633193');
  // await page.frameLocator('[data-testid="challengeFrame"]').frameLocator('iframe[name="cardinal-stepUpIframe-1693928667705"]').getByLabel('Überprüfen').click();
  // await page.frameLocator('[data-testid="challengeFrame"]').frameLocator('iframe[name="cardinal-stepUpIframe-1693928667705"]').getByLabel('Zurück zum Händler').click();
  await page.getByTestId('purchase-success-confirm-button').click();
};

export const connect = run(async ({ page, info, Ok, Err, ask }) => {
  await page.goto('https://www.disneyplus.com/login');
  if ((await raceElements(page, [LOGIN, PROFILE])) === LOGIN) {
    const loginResult = await loginHelper({ page, info, ask });
    if (loginResult) {
      return Err(loginResult);
    }
  }
  const cookies = await page.context().cookies();

  if (await page.getByTestId('standard-offer-container').isVisible()) {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'inactive',
        lastSyncedAt: new Date().toISOString(),
      },
    });
  }

  await page.getByTestId('profile-avatar-0').click();
  await page.getByTestId('account-dropdown-list').hover();
  await page.getByTestId('dropdown-option-3-account').click();

  if (await page.getByTestId('modal-primary-button').isVisible()) {
    await page.getByTestId('modal-primary-button').click();
    await page.getByTestId('section-card-accountsubscriptions').locator('div').nth(2).click();
    const expiresAt = await page.getByTestId('last-payment-date').innerText();
    return Ok({
      cookies,
      data: {
        membershipStatus: 'canceled',
        expiresAt: extractDate(expiresAt) ?? expiresAt,
        lastSyncedAt: new Date().toISOString(),
      },
    });
  }

  await page.getByTestId('section-card-accountsubscriptions').locator('div').nth(2).click();
  const nextPaymentPrice = await page.getByTestId('last-payment-price').innerText();
  const nextPaymentDate = await page.getByTestId('last-payment-date').innerText();
  const isMonthly = await page.getByTestId('upgrade-to-annual-link').isVisible();
  const billingCycle: BillingCycle = isMonthly ? 'monthly' : 'yearly';

  await logoutHelper({ page });

  return Ok({
    cookies,
    data: {
      membershipStatus: 'active',
      membershipPlan: null,
      nextPaymentPrice: extractAmount(nextPaymentPrice),
      nextPaymentDate: extractDate(nextPaymentDate) ?? nextPaymentDate,
      billingCycle,
      lastSyncedAt: new Date().toISOString(),
    },
  });
});

export const resume = run(async ({ page, info, Ok, ask }) => {
  await page.goto('https://www.disneyplus.com/login');
  if ((await raceElements(page, [LOGIN, PROFILE])) === LOGIN) {
    const loginResult = await loginHelper({ page, info, ask });
    if (loginResult) {
      return Err(loginResult);
    }
  }

  if (await page.getByTestId('standard-offer-container').isVisible()) {
    return Err(t('resumeFailedInactive'));
  }
  await page.getByTestId('profile-avatar-0').click();
  await page.getByTestId('account-dropdown-list').hover();
  await page.getByTestId('dropdown-option-3-account').click();

  if (!(await page.getByTestId('modal-primary-button').isVisible())) {
    return Err(t('resumeFailedActive'));
  }

  await page.getByTestId('modal-primary-button').click();
  await page.getByTestId('restart-subscription-button').click();
  await page.getByTestId('restart-modal-button').click();

  await page.getByTestId('section-card-accountsubscriptions').locator('div').nth(2).click();

  const nextPaymentDate = await page.getByTestId('last-payment-date').innerText();
  const nextPaymentPrice = await page.getByTestId('last-payment-price').innerText();
  const isMonthly = await page.getByTestId('upgrade-to-annual-link').isVisible();
  const billingCycle: BillingCycle = isMonthly ? 'monthly' : 'yearly';

  const cookies = await page.context().cookies();
  await logoutHelper({ page });
  // lastpaymentdate sollte +1 Monat ausgegeben werden
  return Ok({
    cookies,
    data: {
      membershipStatus: 'active',
      membershipPlan: null,
      nextPaymentPrice: extractAmount(nextPaymentPrice),
      nextPaymentDate: dayjs(extractDate(nextPaymentDate)).add(1, 'month').toISOString() ?? nextPaymentDate,
      billingCycle,
      lastSyncedAt: new Date().toISOString(),
    },
  });
});

export const cancel = run(async ({ page, info, Ok, ask }) => {
  await page.goto('https://www.disneyplus.com/login');
  if ((await raceElements(page, [LOGIN, PROFILE])) === LOGIN) {
    const loginResult = await loginHelper({ page, info, ask });
    if (loginResult) {
      return Err(loginResult);
    }
  }
  if (await page.getByTestId('standard-offer-container').isVisible()) {
    return Err(t('cancelFailed'));
    // await restart({ page, info, Ok, Err });
  }
  await page.getByTestId('profile-avatar-0').click();
  await page.getByTestId('account-dropdown-list').hover();
  await page.getByTestId('dropdown-option-3-account').click();

  if (await page.getByTestId('modal-primary-button').isVisible()) {
    return Err(t('cancelFailed'));
  }

  await page.getByTestId('section-card-accountsubscriptions').locator('div').nth(2).click();
  await page.getByTestId('subscription-details-cancel-subscription').click();
  await page.getByTestId('Other').check();
  await page.getByTestId('cancel-submit').click();
  await page.getByTestId('complete-cancellation-button').click();
  await page.getByTestId('cancellationConfirmationGoToHomeLink').click;
  await page.getByTestId('account-dropdown-list').hover();
  await page.getByTestId('dropdown-option-3-account').click();
  await page.getByTestId('modal-primary-button').click();
  await page.getByTestId('section-card-accountsubscriptions').locator('div').nth(2).click();

  const expiresAt = await page.getByTestId('last-payment-date').innerText();
  const cookies = await page.context().cookies();

  await logoutHelper({ page });

  return Ok({
    cookies,
    data: {
      membershipStatus: 'canceled',
      expiresAt: dayjs(extractDate(expiresAt)).add(1, 'month').toISOString() ?? expiresAt,
      lastSyncedAt: new Date().toISOString(),
    },
  });
});

export const restart = run(async ({ page, info, Ok }) => {
  await page.getByTestId('complete-purchase-cta').click();
  await page.getByTestId('subscriber-agreement-continue').click();

  await paymentHelper({ page, info });
  const cookies = await page.context().cookies();
  await logoutHelper({ page });
  return Ok({
    cookies,
    lastSyncedAt: new Date().toISOString(),
  });
});

export const register = run(async ({ page, info, Ok, Err }) => {
  const { email, password } = info;

  await page.goto('https://www.disneyplus.com/sign-up');
  await page.locator('#onetrust-reject-all-handler').click();
  await page.locator('[data-gv2elementkey="email"]').fill(email);
  await page.getByTestId('signup-continue-button').click();

  if (!(await page.locator('.loginPassword').isVisible())) {
    const error = 'Account already exists. Try to connect your existing account or enter a new email address.';
    return Err(error);
  }

  await page.getByTestId('subscriber-agreement-continue').click();
  await page.locator('[data-gv2elementkey="password"]').fill(password);
  await page.getByTestId('password-continue-login').click();

  await paymentHelper({ page, info });

  const cookies = await page.context().cookies();

  await logoutHelper({ page });

  return Ok({
    cookies,
    lastSyncedAt: new Date().toISOString(),
  });
});
