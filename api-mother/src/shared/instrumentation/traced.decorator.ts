import { trace, SpanStatusCode } from '@opentelemetry/api';

/**
 * @Traced() - Method decorator that wraps execution with an OTel active span.
 *
 * Usage:
 *   @Traced('MyGuard.canActivate')
 *   async canActivate(context: ExecutionContext): Promise<boolean> { ... }
 *
 * If spanName is omitted, defaults to ClassName.methodName.
 */
export function Traced(spanName?: string) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
    const name = spanName ?? `${(target as { constructor: { name: string } }).constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const tracer = trace.getTracer('sankhya-db-gateway', '1.0.0');

      return tracer.startActiveSpan(name, async (span) => {
        span.setAttribute('component', (target as { constructor: { name: string } }).constructor.name);
        span.setAttribute('method', propertyKey);

        try {
          const result = await originalMethod.apply(this, args);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message,
          });
          throw error;
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}
