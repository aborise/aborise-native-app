import { Page } from "playwright-core";
import { run } from "./setup/setup";
import { extractAmount, extractDate, t } from "./strings";

const loginUrl = "https://www.spotify.com/account/manage-your-plan/";
const logoutUrl = "https://spotify.com/logout";

const loginHelper = async ({
  page,
  info,
}: {
  page: Page;
  info: Record<string, string>;
}) => {
  const { email, password } = info;

  await page.getByTestId("login-username").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-button").click();
  if (await page.locator('[data-encore-id="banner"]').isVisible()) {
    return t("loginFailed");
  }
  if (await page.locator("#onetrust-accept-btn-handler").isVisible()) {
    await page.locator("#onetrust-accept-btn-handler").click();
  }
};

export const connect = run(async ({ page, info, Err, Ok }) => {
  await page.goto(loginUrl);
  if (await page.getByTestId("login-username").isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }

  const cookies = await page.context().cookies();

  if (await page.getByTestId("resubscription-renew-premium").isVisible()) {
    const expiresAt = await page.locator(".recurring-date").innerText();
    return Ok({
      cookies,
      data: {
        membershipStatus: "canceled",
        expiresAt: extractDate(expiresAt) ?? expiresAt,
      },
    });
  }

  const membershipPlan = await page.getByTestId("Plan Header").innerText();
  const nextPaymentPrice = await page.locator(".recurring-price").innerText();
  const nextPaymentDate = await page.locator(".recurring-date").innerText();

  await page.goto(logoutUrl);

  return Ok({
    cookies,
    data: {
      membershipStatus: "active",
      membershipPlan,
      nextPaymentPrice: extractAmount(nextPaymentPrice),
      nextPaymentDate: extractDate(nextPaymentDate) ?? nextPaymentDate,
      billingCycle: "monthly",
    },
  });
});

export const cancel = run(async ({ page, info, Err, Ok }) => {
  await page.goto(loginUrl);
  if (await page.getByTestId("login-username").isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }
  if (await page.getByTestId("resubscription-renew-premium").isVisible()) {
    return Err(t("cancelFailed"));
  }
  const expiresAt = await page.locator(".recurring-date").innerText();

  await page.locator('[data-ga-label="cancel premium"]').click();
  await page.getByTestId("submit-button").click();
  await page.locator('[data-encore-id="buttonTertiary"]').click();

  const cookies = await page.context().cookies();
  await page.goto(logoutUrl);

  return Ok({
    cookies,
    data: {
      membershipStatus: "canceled",
      expiresAt: extractDate(expiresAt) ?? expiresAt,
    },
  });
});

export const resume = run(async ({ page, info, Err, Ok }) => {
  await page.goto(loginUrl);
  if (await page.getByTestId("login-username").isVisible()) {
    const loginResult = await loginHelper({ page, info });
    if (loginResult) {
      return Err(loginResult);
    }
  }

  if (!(await page.getByTestId("resubscription-renew-premium").isVisible())) {
    return Err(t("resumeFailedActive"));
  }
  await page.getByTestId("resubscription-renew-premium").first().click();
  await page.getByTestId("resubscription-modal-renew-now").first().click();

  const membershipPlan = await page.getByTestId("Plan Header").innerText();
  const nextPaymentPrice = await page.locator(".recurring-price").innerText();
  const nextPaymentDate = await page.locator(".recurring-date").innerText();

  const cookies = await page.context().cookies();
  await page.goto(logoutUrl);

  return Ok({
    cookies,
    data: {
      membershipStatus: "active",
      membershipPlan,
      nextPaymentPrice: extractAmount(nextPaymentPrice),
      nextPaymentDate: extractDate(nextPaymentDate) ?? nextPaymentDate,
      billingCycle: "monthly",
    },
  });
});
// await page.locator('[data-value="cards"]').isVisible(); // this is visible when new payment method is needed
