import { z } from 'zod';

const rtlSubscriptionsSchema = z.object({
  startDate: z.string(),
  productName: z.string(),
  productSubscriptions: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      contractType: z.string(),
      paymentBearerType: z.object({}),
      startDate: z.string(),
      nextBillingDate: z.string(),
      cancellationDate: z.string().nullable(),
    }),
  ),
  nextBillingDate: z.string(),
  nextBillingPreviewAmount: z.object({
    amountPayable: z.number(),
    totalGross: z.number(),
    billingDate: z.object({}),
  }),
  statusKey: z.string(),
  customerStatusKey: z.string(),
  userCanTransition: z.boolean(),
  userCanCancelSubscription: z.boolean(),
  userCanRevertCancellation: z.boolean(),
  userCanRedeemCouponCode: z.boolean(),
  userCanDeletePaymentMethod: z.boolean(),
  userIsInTrialPhase: z.boolean(),
  userCanRedeemPrepaidCard: z.boolean(),
  userCanPayWithDebit: z.boolean(),
  userCanInheritPaymentBearer: z.boolean(),
  userCanBeRetained: z.boolean(),
  userCanChangeToDebit: z.boolean(),
  cancellationEffectivenessDate: z.string(),
  billingPeriod: z.object({
    unit: z.string(),
    quantity: z.number(),
  }),
  hasDiscount: z.boolean(),
  writtenOff: z.boolean(),
  isNewCustomer: z.boolean(),
  eligibleForCreditTypes: z.array(z.unknown()),
});

export type RTLSubscriptions = z.infer<typeof rtlSubscriptionsSchema>;
