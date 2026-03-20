import type { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export function parseApiError(err: unknown): ApiError {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const data = err.response?.data as Record<string, unknown> | undefined;
    return {
      status,
      code: (data?.code as string) ?? `HTTP_${status || 'NETWORK'}`,
      message:
        (data?.message as string) ??
        (data?.error as string) ??
        err.message ??
        'Erro desconhecido',
      details: data?.details,
    };
  }
  if (err instanceof Error) {
    return { status: 0, code: 'CLIENT_ERROR', message: err.message };
  }
  return { status: 0, code: 'UNKNOWN', message: String(err) };
}

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'isAxiosError' in err &&
    (err as AxiosError).isAxiosError === true
  );
}
