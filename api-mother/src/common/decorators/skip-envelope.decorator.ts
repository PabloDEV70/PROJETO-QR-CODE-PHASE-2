import { SetMetadata } from '@nestjs/common';

export const SKIP_ENVELOPE_KEY = 'skipEnvelope';

/**
 * Marks a controller method or class as envelope-exempt.
 * Routes decorated with @SkipEnvelope() bypass GlobalResponseInterceptor wrapping.
 *
 * Use for:
 * - @Res() routes that write directly to the Express response
 * - @HealthCheck() methods that terminus owns
 * - Any route deliberately returning a non-standard shape
 */
export const SkipEnvelope = () => SetMetadata(SKIP_ENVELOPE_KEY, true);
