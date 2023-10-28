import { Page } from 'playwright-core';
import { raceElements } from './helpers';
import { run } from './setup/setup';
import { extractAmount, extractDate, t } from './strings';

const LOGIN_ERR = '[data-uia="error-message-container"]';
const LOGIN_OK = '[data-uia="account-content"]';
const NEXT_BILLING_DATE = '[data-uia="nextBillingDate-item"]';
const PERIOD_END_DATE = '[data-uia="periodEndDate-item"]';

const loginHelper = async ({ page, info }: { page: Page; info: Record<string, string> }) => {
  const { email, password } = info;

  if (await page.locator('.inputError').first().isVisible()) {
    return t('loginFailed');
  }
  await page.locator('[data-uia="login-field"]').fill(email);
  await page.locator('[data-uia="password-field"]').fill(password);
  await page.locator('[data-uia="login-submit-button"]').click();

  if ((await raceElements(page, [LOGIN_ERR, LOGIN_OK])) === LOGIN_ERR) {
    return t('loginFailed');
  }
};

const logoutHelper = async ({ page }: { page: Page }) => {
  await page.hover('.profile-selector');
  await page.locator('[data-uia="profiles-sign-out-link"]').click();
  await page.locator('[data-uia="continue-logout"]').click();
  // await page.goto('https://www.netflix.com/signout');
  // await page.locator('[data-uia="continue-logout"]').click();
};

const planSelectorHelper = async ({ page }: { page: Page }) => {
  await page.locator('[data-uia="see-all-plans-button"]').click();
  // Standart with ads: data-uia="plan-grid-plan-selector+input-text_1_stream_name"
  // Basic: data-uia="plan-grid-plan-selector+label-text_1_stream_name"
  // Standard: data-uia="plan-grid-plan-selector+label-text_2_stream_name"
  // Premiun data-uia="plan-grid-plan-selector+label-text_4_stream_name"
  await page.locator('[data-uia="cta-plan-selection"]').click();
};

const paymentHelper = async ({ page, info }: { page: Page; info: Record<string, string> }) => {
  const { firstName, lastName, creditCardNumber, creditCardExpirationMonth, creditCardExpirationYear, creditCardCvv } =
    info;
  // INFO: Credit card expiration date format: MM/YY
  // const paymentMethods = ['creditOrDebitOption', 'deDebitOption', 'dcbOption', 'paypalOption', 'giftOption'] as const;
  // Debit card (IBAN): data-uia="payment-choice+deDebitOption"
  // Mobile: data-uia="payment-choice+dcbOption"
  // PayPal: data-uia="payment-choice+paypalOption"
  // Gift card: data-uia="payment-choice+giftOption"
  // type PaymentMethod = (typeof paymentMethods)[number];
  // const paymentMethod: PaymentMethod = 'creditOrDebitOption';

  await page.locator('[data-uia="payment-choice+creditOrDebitOption"]').click();
  await page.locator('[data-uia="field-creditCardNumber"]').fill(creditCardNumber);
  await page
    .locator('[data-uia="field-creditExpirationMonth"]')
    .fill(`${creditCardExpirationMonth}/${creditCardExpirationYear}`);
  await page.locator('[data-uia="field-creditCardSecurityCode"]').fill(creditCardCvv);
  await page.locator('[data-uia="field-firstName"]').fill(firstName);
  await page.locator('[data-uia="field-lastName"]').fill(lastName);
  await page.locator('[data-uia="field-consents+rightOfWithdrawal"]').click();
  await page.locator('[data-uia="action-submit-payment"]').click();
};

export const connect = run(async ({ page, info, Ok, Err }) => {
  await page.goto('https://www.netflix.com/YourAccount');
  if (await page.locator('[data-uia="login-field"]').isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }

  const cookies = await page.context().cookies();

  // TODO: Add membership inactive if condition

  const result = await raceElements(page, [NEXT_BILLING_DATE, PERIOD_END_DATE]);
  if (result === PERIOD_END_DATE) {
    const expiresAt = await page.locator(PERIOD_END_DATE).innerText();
    return Ok({
      cookies,
      data: {
        membershipStatus: 'canceled',
        expiresAt: extractDate(expiresAt) ?? expiresAt,
      },
    });
  }

  await page.goto('https://www.netflix.com/BillingActivity');
  const nextPaymentDate = await page.locator('[data-uia="streaming-next-cycle"]').innerText();
  const membershipPlan = await page.locator('[data-uia="plan-name"]').innerText();
  const nextPaymentPrice = await page.locator('[data-uia="plan-total-amount"]').innerText();

  // const window: JSHandle = await page.evaluateHandle(() => window);
  // const reactContext = await page.evaluate((window) => {
  //   return window.netflix.reactContext;
  // }, window);

  await logoutHelper({ page });

  return Ok({
    cookies,
    data: {
      membershipStatus: 'active',
      membershipPlan,
      nextPaymentPrice: extractAmount(nextPaymentPrice),
      nextPaymentDate: extractDate(nextPaymentDate) ?? nextPaymentDate,
      billingCycle: 'monthly',
      // reactContext,
    },
  });
});

export const cancel = run(async ({ page, info, Ok, Err }) => {
  await page.goto('https://www.netflix.com/YourAccount');
  if (await page.locator('[data-uia="login-field"]').isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }

  // TODO: Add membership inactive if condition
  if (await page.locator(PERIOD_END_DATE).isVisible()) {
    return Err(t('cancelFailed'));
  }

  await page.locator('[data-uia="action-cancel-plan"]').click();
  await page.locator('[data-uia="action-finish-cancellation"]').click();
  await page.locator('[data-uia="label+OTHER"]').click();
  await page.locator('[data-uia="action-submit-survey"]').click();

  const expiresAt = await page.locator(PERIOD_END_DATE).innerText();

  const cookies = await page.context().cookies();

  await logoutHelper({ page });

  return Ok({
    cookies,
    data: {
      membershipStatus: 'canceled',
      expiresAt: extractDate(expiresAt) ?? expiresAt,
    },
  });
});

export const resume = run(async ({ page, info, Ok, Err }) => {
  await page.goto('https://www.netflix.com/YourAccount');
  if (await page.locator('[data-uia="login-field"]').isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }
  // TODO: Add membership inactive if condition
  if (await page.locator(NEXT_BILLING_DATE).isVisible()) {
    return Err(t('resumeFailedActive'));
  }

  await page.locator('[data-uia="action-cancel-plan"]').click();
  await page.goto('https://www.netflix.com/BillingActivity');
  const nextPaymentDate = await page.locator('[data-uia="streaming-next-cycle"]').innerText();
  const nextPaymentPrice = await page.locator('[data-uia="plan-total-amount"]').innerText();
  const membershipPlan = await page.locator('[data-uia="plan-name"]').innerText();

  const cookies = await page.context().cookies();
  await logoutHelper({ page });

  return Ok({
    cookies,
    data: {
      membershipStatus: 'active',
      membershipPlan,
      nextPaymentPrice: extractAmount(nextPaymentPrice),
      nextPaymentDate: extractDate(nextPaymentDate) ?? nextPaymentDate,
      billingCycle: 'monthly',
    },
  });
});

export const register = run(async ({ page, info, Ok, Err }) => {
  const { email, password } = info;
  await page.goto('https://www.netflix.com/');

  await page.locator('[data-uia="field-email"]').fill(email);
  await page.locator('[data-uia="nmhp-card-cta+hero_fuji"]').click();

  if (!(await page.locator('[data-uia="login-page-container"]').isVisible())) {
    return Err(t('registerFailed'));
  }

  await page.locator('[data-uia="cta-continue-registration"]').click();
  await page.locator('[data-uia="field-password"]').fill(password);
  await page.locator('[data-uia="cta-registration"]').click();
  await page.locator('[data-uia="continue-button"]').click();

  await planSelectorHelper({ page });
  await paymentHelper({ page, info });

  const cookies = await page.context().cookies();

  await logoutHelper({ page });

  return Ok({ cookies });
});
