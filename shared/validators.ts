import z from 'zod';

export const registerRequestValidator = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  creditCard: z
    .object({
      name: z.string(),
      number: z.string().min(16).max(16),
      expiration: z.string().regex(/^\d{2}\/\d{2}$/),
      cvv: z.string().min(3).max(3),
    })
    .optional(),
  type: z.string(),
  uid: z.string().optional(),
});

export const answerRequestValidator = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    key: z.string(),
    value: z.string(),
    requestId: z.string(),
  }),
  z.object({
    status: z.literal('cancel'),
    key: z.string(),
    requestId: z.string(),
  }),
]);

export type RegisterRequest = z.infer<typeof registerRequestValidator>;
export type AnswerRequest = z.infer<typeof answerRequestValidator>;

export const ServiceSchema = z.object({
  id: z.string(), // unique id
  title: z.string(),
  logo: z.string().url(),
  description: z.string(),
  auth: z.string().array(),
  optionalDataKeys: z.array(z.string()),
  // not optional in the future
  availablePlans: z.array(z.string()).optional(),
  availableBillingCycles: z.array(z.string()).optional(),
  // billingStrategy: z.enum(['monthly', 'fixed_day', 'variable']),
  optional: z.array(
    z.object({
      key: z.string(),
      value: z.any(),
    }),
  ),

  // This will be later replaced by an openapi schema
  actions: z.array(
    z.discriminatedUnion('type', [
      z.object({
        name: z.string(),
        type: z.literal('api'),
        details: z.object({
          dataKeys: z.array(z.string()),
          url: z.string(),
        }),
      }),
      z.object({
        name: z.string(),
        type: z.literal('manual'),
      }),
    ]),
  ),
});

export type Service = z.infer<typeof ServiceSchema>;
