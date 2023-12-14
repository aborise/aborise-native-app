import z from 'zod';

export const actions = ['connect', 'cancel', 'resume', 'reactivate', 'register'] as const;
export const states = ['active', 'canceled', 'inactive', 'preactive'] as const;

export type Action = (typeof actions)[number];
export type State = (typeof states)[number];

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
  appleId: z.string(),
  googleId: z.string(),
  schema: z.string().nullable(),
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
        states: z.enum(states).array(),
      }),
      z.object({
        name: z.enum(actions),
        type: z.literal('manual'),
        webView: z.boolean().or(z.literal('v2')).optional(),
        states: z.enum(states).array(),
      }),
    ]),
  ),
});

export type Service = z.infer<typeof ServiceSchema>;
