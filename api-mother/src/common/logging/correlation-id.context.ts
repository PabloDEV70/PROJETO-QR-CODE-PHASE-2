import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  correlationId: string;
  database?: string;
  method?: string;
  path?: string;
  ip?: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

export function getCorrelationId(): string {
  return getRequestContext()?.correlationId ?? 'NO_CORRELATION_ID';
}
