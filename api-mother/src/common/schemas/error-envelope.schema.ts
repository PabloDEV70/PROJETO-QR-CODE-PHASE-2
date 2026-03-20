import { z } from 'zod';
import { GatewayErrorCode } from '../enums/gateway-error-code.enum';

export const ErrorDetailSchema = z.object({
  code: z.enum(GatewayErrorCode),
  message: z.string(),
  context: z.record(z.string(), z.unknown()).optional(),
});

export const ErrorEnvelopeSchema = z.object({
  data: z.null(),
  success: z.literal(false),
  error: ErrorDetailSchema,
  meta: z.object({ timestamp: z.string() }).passthrough(),
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
