import { z } from 'zod';

export const MetaSchema = z
  .object({
    rows: z.number().optional(),
    executionTimeMs: z.number().optional(),
    timestamp: z.string().optional(),
    count: z.number().optional(),
  })
  .passthrough();

export const ApiEnvelopeSchema = z.object({
  data: z.unknown(),
  success: z.boolean(),
  meta: MetaSchema,
});

export type ApiEnvelope<T = unknown> = {
  data: T;
  success: boolean;
  meta: z.infer<typeof MetaSchema>;
};
