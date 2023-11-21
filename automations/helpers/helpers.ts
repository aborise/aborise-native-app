import { Cookie } from 'playwright-core';
import { z } from 'zod';
import { ApiError, ApiResponse } from '../api/helpers/client';

export type ActionReturn = {
  cookies?: Cookie[];
  data?: ActionResult;
  token?: any;
};

export type ApiResult = {
  history?: Array<ApiResponse<any> | ApiError>;
  data?: ActionReturn['data'];
};

export const status = ['active', 'canceled', 'inactive'] as const;
export type status = (typeof status)[number];
export const billingCycle = ['monthly', 'annual'] as const;
export type BillingCycle = (typeof billingCycle)[number];

const ActionResultActiveSchema = z.object({
  status: z.literal('active'),
  planName: z.string(),
  planPrice: z.number(),
  nextPaymentDate: z.string().datetime(),
  billingCycle: z.enum(billingCycle),
  lastSyncedAt: z.string().datetime(),
  productId: z.string().optional(),
});

export type ActionResultActive = z.infer<typeof ActionResultActiveSchema>;

const ActionResultCanceledSchema = z.object({
  status: z.literal('canceled'),
  expiresAt: z.string().datetime().nullable(),
  lastSyncedAt: z.string().datetime(),
  planPrice: z.number().nullable(),
  billingCycle: z.enum(billingCycle),
  planName: z.string(),
  productId: z.string().optional(),
});

export type ActionResultCanceled = z.infer<typeof ActionResultCanceledSchema>;

const ActionResultInactiveSchema = z.object({
  status: z.literal('inactive'),
  lastSyncedAt: z.string().datetime(),
});

export type ActionResultInactive = z.infer<typeof ActionResultInactiveSchema>;

const ActionResultPreactiveSchema = z.object({
  status: z.literal('preactive'),
  lastSyncedAt: z.string().datetime(),
});

export type ActioneResultPreactive = z.infer<typeof ActionResultPreactiveSchema>;

export const ActionResultSchema = z.discriminatedUnion('status', [
  ActionResultActiveSchema,
  ActionResultCanceledSchema,
  ActionResultInactiveSchema,
  ActionResultPreactiveSchema,
]);

export type ActionResult = z.infer<typeof ActionResultSchema>;
