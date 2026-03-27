import { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useThemeStore } from '@/stores/theme-store';
import { lightTheme, darkTheme } from '@shared/ui-lib';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { NotificationProvider } from '@/components/shared/notification-provider';
import { parseApiError } from '@/types/api-error';
import { useNotificationStore } from '@/stores/notification-store';
import { useRefreshMe } from '@/hooks/use-refresh-me';
import { setOnFlushCallback } from '@/utils/offline-queue';
import { router } from '@/app/router';
import { getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useAuthStore } from '@/stores/auth-store';

function handleQueryError(error: unknown, query?: { meta?: Record<string, unknown> }) {
  if (query?.meta?.skipGlobalError) return;
  const parsed = parseApiError(error);
  if (parsed.status === 401) return;
  useNotificationStore.getState().addToast('error', parsed.message);
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error, query) => handleQueryError(error, query) }),
  mutationCache: new MutationCache({ onError: (error) => handleQueryError(error) }),
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: true, refetchOnReconnect: true, networkMode: 'offlineFirst' },
    mutations: { networkMode: 'offlineFirst' },
  },
});

setOnFlushCallback(() => { queryClient.invalidateQueries(); });

// Prefetch motivos on app start (if authenticated) so picker is instant
if (useAuthStore.getState().isAuthenticated) {
  queryClient.prefetchQuery({
    queryKey: ['motivos-ativos'],
    queryFn: getMotivosAtivos,
    staleTime: CACHE_TIMES.motivos.staleTime,
  });
}

function AppInner() {
  const mode = useThemeStore((s) => s.mode);
  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);
  useRefreshMe();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        '@font-face': { fontFamily: 'STOP', src: "url('/fonts/StopFont.woff2') format('woff2'), url('/fonts/StopFont.ttf') format('truetype')", fontWeight: 400, fontStyle: 'normal', fontDisplay: 'swap' },
        body: { overscrollBehaviorY: 'contain' },
      }} />
      <RouterProvider router={router} />
      <NotificationProvider />
    </ThemeProvider>
  );
}

export function AppProvider() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
