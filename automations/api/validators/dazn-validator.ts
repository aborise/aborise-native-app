import { z } from 'zod';

// {
//   Result: 'SignedInInactive',
//   AuthToken: {
//     Token: '{access_token}',
//     TokenType: 'UserAccount',
//     IsRefreshable: true,
//     Expires: '2023-11-18T12:29:10.000Z',
//     CurrentTime: '2023-11-18T10:29:10.000Z',
//   },
// };

const daznLoginSchema = z.object({
  Result: z.enum(['SignedIn', 'SignedInInactive']),
  AuthToken: z.object({
    Token: z.string(),
    TokenType: z.enum(['UserAccount']),
    IsRefreshable: z.boolean(),
    Expires: z.string(),
    CurrentTime: z.string(),
  }),
});

export type DaznLogin = z.infer<typeof daznLoginSchema>;

// [
//   {
//     status: 'Active',
//     id: '8a1295998bdd5e19018be23c6ad45df9',
//     subscriptionName: 'A-S9b77462a938d78a0f7ff8dd47ee4edd1',
//     startDate: '2023-11-18T11:41:31.000Z',
//     latestSubscriptionStartDate: '2023-11-18T11:41:32.000Z',
//     contractEndsOn: '2024-08-01T00:00:00.000Z',
//     paymentMethod: {
//       type: 'CreditCardReferenceTransaction',
//       details: {
//         creditCardMaskNumber: '************7896',
//         creditCardExpirationMonth: '8',
//         creditCardType: 'MasterCard',
//         creditCardExpirationYear: '2027',
//         recurringDetailReference: 'KNN8NP9HQ6CS3VW3',
//       },
//     },
//     nextPaymentDate: '2023-11-26T11:41:32.000Z',
//     freeTrialEndDate: '2023-11-25T11:41:32.000Z',
//     cancellableOnDate: '2023-11-18',
//     cancelledDate: null,
//     proRatedDays: 0,
//     activePass: { currency: 'EUR', price: 44.99, period: 'Annual', subscriptionTerm: 'TERMED' },
//     canCancelKeep: true,
//     pauseEndDate: null,
//     inProgress: 'NONE',
//     crossGradeCreatedDate: null,
//     zipCode: null,
//     requestRenewal: 'true',
//     productGroup: 'NFL',
//     numFreeTrialPeriods: '7',
//     freeTrialPeriodsType: 'days',
//     pauseWindowStartDate: '2023-11-27',
//     pauseWindowEndDate: '2024-01-25',
//     tiers: { currentPlan: { id: 'tier_nfl_pro', name: 'NFL Annual Season Pass DE' } },
//   },
// ];

const a = {
  activePass: { currency: 'EUR', period: 'Annual', price: 44.99, subscriptionTerm: 'TERMED' },
  canCancelKeep: false,
  cancellableOnDate: '2023-11-18',
  cancelledDate: '2023-11-18',
  contractEndsOn: '2023-11-18T00:00:00.000Z',
  crossGradeCreatedDate: null,
  freeTrialEndDate: '2023-11-25T13:58:27.000Z',
  freeTrialPeriodsType: 'days',
  id: '8a128ab18bdd4257018be2b9c4eb00fb',
  inProgress: 'NONE',
  latestSubscriptionStartDate: '2023-11-18T13:58:27.000Z',
  nextPaymentDate: '2023-11-26T13:58:27.000Z',
  numFreeTrialPeriods: '7',
  pauseEndDate: null,
  pauseWindowEndDate: '2024-01-25',
  pauseWindowStartDate: '2023-11-27',
  paymentMethod: {
    details: {
      creditCardExpirationMonth: '8',
      creditCardExpirationYear: '2027',
      creditCardMaskNumber: '************7896',
      creditCardType: 'MasterCard',
      recurringDetailReference: 'KNN8NP9HQ6CS3VW3',
    },
    type: 'CreditCardReferenceTransaction',
  },
  proRatedDays: 0,
  productGroup: 'NFL',
  requestRenewal: 'true',
  startDate: '2023-11-18T11:41:31.000Z',
  status: 'Cancelled',
  subscriptionName: 'A-S9b77462a938d78a0f7ff8dd47ee4edd1',
  zipCode: null,
};

// zod validator for the object above:
const daznSubscriptionSchema = z.array(
  z.object({
    status: z.enum(['Active', 'Cancelled']),
    startDate: z.string(),
    latestSubscriptionStartDate: z.string(),
    contractEndsOn: z.string(),
    paymentMethod: z.object({
      type: z.enum(['CreditCardReferenceTransaction']),
      details: z.object({
        creditCardMaskNumber: z.string(),
        creditCardExpirationMonth: z.string(),
        creditCardExpirationYear: z.string(),
        recurringDetailReference: z.string(),
      }),
    }),
    nextPaymentDate: z.string(),
    freeTrialEndDate: z.string(),
    cancellableOnDate: z.string(),
    cancelledDate: z.string().nullable(),
    proRatedDays: z.number(),
    activePass: z.object({
      currency: z.string(),
      price: z.number(),
      period: z.enum(['Annual']),
      subscriptionTerm: z.enum(['TERMED']),
    }),
    canCancelKeep: z.boolean(),
    pauseEndDate: z.string().nullable(),
    inProgress: z.enum(['NONE', 'SUBSCRIPTION_CANCEL']),
    crossGradeCreatedDate: z.string().nullable(),
    zipCode: z.string().nullable(),
    requestRenewal: z.string(),
    productGroup: z.string(),
    numFreeTrialPeriods: z.string(),
    freeTrialPeriodsType: z.string(),
    pauseWindowStartDate: z.string(),
    pauseWindowEndDate: z.string(),
    tiers: z
      .object({
        currentPlan: z.object({
          id: z.string(),
          name: z.string(),
        }),
      })
      .optional(),
  }),
);

export type DaznSubscription = z.infer<typeof daznSubscriptionSchema>;
