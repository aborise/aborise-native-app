import { z } from 'zod';

// https://subs.joyn.de/abo/api/v1/config
const joynSubConfigSchema = z.object({
  webPaymentSettings: z.object({
    stripePublicAPIKey: z.string(),
    paypalClientId: z.string(),
    paypalPlans: z.object({
      HD_PLAN_ID: z.string(),
      PREMIUM_PLAN_ID: z.string(),
      PLUS_PLAN_ID: z.string(),
    }),
    canUseDirectDebit: z.boolean(),
    canUsePaypal: z.boolean(),
    useKlarnaCheckout: z.boolean(),
    useBillingAgreements: z.boolean(),
    allowedPaymentMethods: z.array(z.string()),
  }),
  hasActivePremium: z.boolean(),
  hasActivePlus: z.boolean(),
  hasActiveHD: z.boolean(),
  userEmail: z.string(),
  freeTrialUntil: z.string(),
  renewsOn: z.string(),
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      country: z.string(),
      price: z.number(),
      freeTrialMonths: z.number(),
      freeTrialUntil: z.string(),
      billingSummaryMessage: z.string(),
      confirmationText: z.string(),
      offerId: z.string(),
      freeTrialDays: z.number(),
    }),
  ),
  browseJoynLink: z.string(),
  themeColor: z.string(),
  joynId: z.string(),
  isAnonymous: z.boolean(),
  gender: z.string(),
  env: z.string(),
  accountsPath: z.string(),
  hasConfirmedEmail: z.boolean(),
});

export type JoynSubConfig = z.infer<typeof joynSubConfigSchema>;

const joynSubscriptionsSchema = z.array(
  z.object({
    id: z.string(),
    product: z.string(),
    productId: z.string(),
    provider: z.object({
      name: z.string(),
      token: z.string(),
      details: z.object({
        vendor: z.string(),
        indicator: z.string(),
        expiry: z.string(),
      }),
    }),
    voucher: z.string(),
    userDetails: z.object({
      cardholder: z.string(),
      agreeterms: z.boolean(),
    }),
    state: z.object({
      state: z.string(),
      started: z.string(),
      expiresOn: z.string(),
      renewOn: z.string(),
      renewsOn: z.number(),
      freeTrialUntil: z.string(),
      currentPrice: z.number(),
      renewalPrice: z.number(),
      canCancelWeb: z.boolean(),
      canReactivateWeb: z.boolean(),
      isActive: z.boolean(),
      canChangePayment: z.boolean(),
      paymentState: z.string(),
      isPaused: z.boolean(),
    }),
    type: z.string(),
    config: z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      country: z.string(),
      price: z.number(),
      freeTrialMonths: z.number(),
      freeTrialUntil: z.string(),
      billingSummaryMessage: z.string(),
      confirmationText: z.string(),
      offerId: z.string(),
      freeTrialDays: z.number(),
    }),
    noBilling: z.boolean(),
    isMaxdome12MonthContract: z.boolean(),
    isMaxdomeBBO: z.boolean(),
    isForceMigratedFromMaxdome: z.boolean(),
    partnerName: z.string(),
  }),
);

export type JoynSubscriptions = z.infer<typeof joynSubscriptionsSchema>;
