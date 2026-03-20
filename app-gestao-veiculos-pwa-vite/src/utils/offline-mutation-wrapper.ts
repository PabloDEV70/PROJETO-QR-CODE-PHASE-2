import { enqueue } from '@/utils/offline-queue';
import { useNotificationStore } from '@/stores/notification-store';

export type HttpMethod = 'post' | 'put' | 'delete' | 'patch';

export async function withOfflineQueue<T>(
  method: HttpMethod,
  url: string,
  data: unknown | undefined,
  onlineFn: () => Promise<T>,
): Promise<T | null> {
  if (navigator.onLine) {
    return onlineFn();
  }

  await enqueue({ method, url, data });
  useNotificationStore.getState().addToast(
    'info',
    'Salvo offline — sera sincronizado automaticamente',
  );
  return null;
}
