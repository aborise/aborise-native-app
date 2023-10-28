import { Page } from 'playwright-core';
import { run } from './setup/setup';
import { extractAmount, extractDate, t } from './strings';

const loginHelper = async ({ page, info }: { page: Page; info: Record<string, string> }) => {
  const { email, password } = info;

  if (await page.locator('#onetrust-reject-all-handler').isVisible()) {
    await page.locator('#onetrust-reject-all-handler').click();
  }
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#sign-in-form button').click();
  // TODO: sometimes the first click errors and we need to click again
  await page.locator('#sign-in-form button').click();

  if (await page.locator('.form-message error').isVisible()) {
    return t('loginFailed');
  }
};

const paymentHelper = async ({ page, info }: { page: Page; info: Record<string, string> }) => {
  const {
    firstName,
    lastName,
    streetAddress,
    postalCode,
    city,
    creditCardNumber,
    creditCardExpirationMonth,
    creditCardExpirationYear,
    creditCardCvv,
  } = info;
  await page.locator('#first_name').fill(firstName);
  await page.locator('#last_name').fill(lastName);
  await page.locator('#address1').fill(streetAddress);
  await page.locator('#postal_code').fill(postalCode);
  await page.locator('#city').fill(city);
  await page.locator('#cc-number').fill(creditCardNumber);
  await page.locator('#cc-expire-month').fill(creditCardExpirationMonth);
  await page.locator('#cc-expire-year').fill(creditCardExpirationYear);
  await page.locator('#cc-cvv').fill(creditCardCvv);
  await page.locator('.payment-layout__summary__submit').click();
};

export const connect = run(async ({ page, info, Err, Ok }) => {
  await page.goto('https://www.paramountplus.com/account/');
  if (await page.locator('#sign-in-form button').isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }

  await page.waitForTimeout(2000);

  const cookies = await page.context().cookies();

  if (await page.locator('.interstitial-steps-wrapper').isVisible()) {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'inactive',
      },
    });
  } else if (!(await page.locator('#section-subscription-and-billing').isVisible())) {
    return Ok({
      cookies,
      data: {
        membershipStatus: 'inactive',
      },
    });
  } else if (await page.locator('#resume-subscription').isVisible()) {
    const expiresAt = await page.locator('.row--alert__info').innerText();
    return Ok({
      cookies,
      data: {
        membershipStatus: 'canceled',
        expiresAt: extractDate(expiresAt) ?? expiresAt,
      },
    });
  } else {
    const membershipPlan = await page
      .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(1) div')
      .innerText();
    const nextPaymentPrice = await page
      .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(2) div')
      .innerText();
    const nextPaymentDate = await page
      .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(3) div')
      .innerText();

    await page.locator('[data-role="sign-out"]').click();

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
  }
});

export const cancel = run(async ({ page, info, Err, Ok }) => {
  await page.goto('https://www.paramountplus.com/account/');
  if (await page.locator('#sign-in-form button').isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }
  // TODO: test if statement below. (#section-subscription-and-billing not tested)
  if (await page.locator('.interstitial-steps-wrapper').isVisible()) {
    return Err(t('cancelFailed'));
  } else if (!(await page.locator('#section-subscription-and-billing').isVisible())) {
    return Err(t('cancelFailed'));
  } else if (await page.locator('#resume-subscription').isVisible()) {
    return Err(t('cancelFailed'));
  }

  await page.locator('[data-role="cancel-subscription"]').click();
  await page.locator('#account-sub-page--cancel button').first().click();
  await page.locator('#account-sub-page--cancel button').last().click();
  const expiresAt = await page.locator('.row--alert__info').innerText();
  const cookies = await page.context().cookies();
  await page.locator('[data-role="sign-out"]').click();

  return Ok({
    cookies,
    data: {
      membershipStatus: 'canceled',
      expiresAt: extractDate(expiresAt) ?? expiresAt,
    },
  });
});

export const resume = run(async ({ page, info, Err, Ok }) => {
  await page.goto('https://www.paramountplus.com/account/');
  if (await page.locator('#sign-in-form button').isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }
  if (!(await page.locator('#resume-subscription').isVisible())) {
    return Err(t('resumeFailedActive'));
  }
  await page.locator('#resume-subscription button').click();
  const membershipPlan = await page
    .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(1) div')
    .innerText();
  const nextPaymentPrice = await page
    .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(2) div')
    .innerText();
  const nextPaymentDate = await page
    .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(3) div')
    .innerText();
  const cookies = await page.context().cookies();
  await page.locator('[data-role="sign-out"]').click();

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

export const restart = run(async ({ page, info, Err, Ok }) => {
  await page.goto('https://www.paramountplus.com/account/');
  if (await page.locator('#sign-in-form button').isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }
  await page.locator('.interstitial-steps-wrapper').isVisible();
  await page.locator('.button').click();
  await page.locator('.button').click();
  await paymentHelper({ page, info });
  const membershipPlan = await page
    .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(1) div')
    .innerText();
  const nextPaymentPrice = await page
    .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(2) div')
    .innerText();
  const nextPaymentDate = await page
    .locator('[data-cy="section-subscription-and-billing"] > div:nth-child(2) > div:nth-child(3) div')
    .innerText();
  const cookies = await page.context().cookies();
  await page.locator('[data-role="sign-out"]').click();
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

export const register = run(async ({ page, info, Ok }) => {
  const { email, password } = info;
  await page.goto('https://www.paramountplus.com/signup/');
  await page.locator('#main-aa-container button').click();
  await page.locator('#fullName').fill('hallo');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('.cbs-checkbox__checkbox').check();
  return Ok({
    cookies: [],
  });
});
