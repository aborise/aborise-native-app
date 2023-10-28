import { ZodSchema, z } from "zod";
import { services } from "../allServices";

// interface BaseQueueItem {
//   type: 'connect' | (string & {});
//   user: string;
//   service: keyof AllServices;
//   // direction: 'in' | 'out';
//   createdAt: number;
//   updatedAt: number;
//   queueId: string;
// }

// interface BaseQueueItemOk extends BaseQueueItem {
//   status: 'done';
// }

// interface QueueItemPending extends BaseQueueItem {
//   status: 'pending';
//   // encryptionKey
//   key: string;
// }

// interface QueueItemError extends BaseQueueItem {
//   status: 'error';
//   error: string;
//   stack: string;
// }

// interface QueueItemAsk extends BaseQueueItem {
//   status: 'ask';
//   ask: string;
//   requestId: string;
// }

// interface QueueItemAnswer extends BaseQueueItem {
//   status: 'answer';
//   answer: string;
//   requestId: string;
// }

// export type AllStatusQueueItems =
//   | BaseQueueItemOk
//   | QueueItemPending
//   | QueueItemError
//   | QueueItemAsk
//   | QueueItemAnswer;

type SpreadArray<T extends any[]> = [T[0], ...T];

// Create zod schemas that mimic the types above
const BaseQueueItemSchema = z.object({
  type: z.string(),
  user: z.string(),
  service: z.enum(
    Object.keys(services) as SpreadArray<(keyof typeof services)[]>
  ),
  queueId: z.string(),
  forceFlow: z.boolean().optional(),
  debug: z.unknown().optional(),
  debugHistory: z.array(z.unknown()).optional(),
});

export type BaseQueueItem = z.infer<typeof BaseQueueItemSchema>;

const QueueItemDoneSchema = BaseQueueItemSchema.extend({
  status: z.literal("done"),
  userStatus: z.string() as ZodSchema<`${string}-done`>,
  result: z.any(),
});

export type QueueItemDone = z.infer<typeof QueueItemDoneSchema>;

const QueueItemPendingSchema = BaseQueueItemSchema.extend({
  status: z.literal("pending"),
  pw: z.string(),
  userStatus: z.string() as ZodSchema<`${string}-pending`>,
});

export type QueueItemPending = z.infer<typeof QueueItemPendingSchema>;

const QueueItemErrorSchema = BaseQueueItemSchema.extend({
  status: z.literal("error"),
  error: z.string(),
  stack: z.string(),
  userStatus: z.string() as ZodSchema<`${string}-error`>,
  apiError: z.unknown().optional(),
  apiHistory: z.array(z.unknown()).nullable().optional(),
});

export type QueueItemError = z.infer<typeof QueueItemErrorSchema>;

const QueueItemAskSchema = BaseQueueItemSchema.extend({
  status: z.literal("ask"),
  key: z.string(),
  relatedItemId: z.string(),
  userStatus: z.string() as ZodSchema<`${string}-ask`>,
});

export type QueueItemAsk = z.infer<typeof QueueItemAskSchema>;

const QueueItemAnswerSchema = BaseQueueItemSchema.extend({
  status: z.literal("answer"),
  answer: z.string(),
  key: z.string(),
  relatedItemId: z.string(),
  userStatus: z.string() as ZodSchema<`${string}-answer`>,
});

export type QueueItemAnswer = z.infer<typeof QueueItemAnswerSchema>;

const QueueItemCancelSchema = BaseQueueItemSchema.extend({
  status: z.literal("canceled"),
  key: z.string(),
  relatedItemId: z.string(),
  userStatus: z.string() as ZodSchema<`${string}-canceled`>,
});

export type QueueItemCancel = z.infer<typeof QueueItemCancelSchema>;

export const QueueItemSchema = z.discriminatedUnion("status", [
  QueueItemDoneSchema,
  QueueItemPendingSchema,
  QueueItemErrorSchema,
  QueueItemAskSchema,
  QueueItemAnswerSchema,
  QueueItemCancelSchema,
]);

export type QueueItem = z.infer<typeof QueueItemSchema>;
