import { Page } from 'playwright-core';
import { z } from 'zod';

// TODO: This function can error if none of the elements are found
// But maybe thats a good thing because you expect one of them to be found
export const raceElements = async (page: Page, elements: Array<string>, timeout = 10000) => {
  return Promise.race(
    elements.map((el) =>
      page
        .locator(el)
        .first()
        .waitFor({ timeout })
        .then(() => el),
    ),
  );
};

export const raceUrls = async (page: Page, urls: Array<string | RegExp>, timeout = 10000) => {
  return Promise.race(urls.map((url) => page.waitForURL(url, { timeout }).then(() => url)));
};

export const membershipStatus = ['active', 'canceled', 'inactive'] as const;
export type MembershipStatus = (typeof membershipStatus)[number];
export const billingCycle = ['monthly', 'yearly'] as const;
export type BillingCycle = (typeof billingCycle)[number];

const FlowResultDataActiveSchema = z.object({
  membershipStatus: z.literal('active'),
  membershipPlan: z.string().nullable(),
  nextPaymentPrice: z.object({ integer: z.number(), decimal: z.number() }).nullable(),
  nextPaymentDate: z.string().datetime().nullable(),
  billingCycle: z.enum(['monthly', 'yearly']),
  lastSyncedAt: z.string().datetime().optional(),
});

export type FlowResultActive = z.infer<typeof FlowResultDataActiveSchema>;

const FlowResultDataCanceledSchema = z.object({
  membershipStatus: z.literal('canceled'),
  expiresAt: z.string().datetime().nullable(),
  lastSyncedAt: z.string().datetime().optional(),
  nextPaymentPrice: z.object({ integer: z.number(), decimal: z.number() }).nullable(),
  billingCycle: z.enum(['monthly', 'yearly']),
  membershipPlan: z.string().nullable(),
});

export type FlowResultCanceled = z.infer<typeof FlowResultDataCanceledSchema>;

const FlowResultDataInactiveSchema = z.object({
  membershipStatus: z.literal('inactive'),
  lastSyncedAt: z.string().datetime().optional(),
});

export type FlowResultInactive = z.infer<typeof FlowResultDataInactiveSchema>;

const FlowResultDataPreactiveSchema = z.object({
  membershipStatus: z.literal('preactive'),
  lastSyncedAt: z.string().datetime().optional(),
});

export type FlowResultPreactive = z.infer<typeof FlowResultDataPreactiveSchema>;

export const FlowResultSchema = z.discriminatedUnion('membershipStatus', [
  FlowResultDataActiveSchema,
  FlowResultDataCanceledSchema,
  FlowResultDataInactiveSchema,
  FlowResultDataPreactiveSchema,
]);

export type FlowResult = z.infer<typeof FlowResultSchema>;
