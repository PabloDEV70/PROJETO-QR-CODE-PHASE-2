import { useMemo, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useThemeStore } from '@/stores/theme-store';
import { lightTheme, darkTheme } from '@shared/ui-lib';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { NotificationProvider } from '@/components/shared/notification-provider';
import { parseApiError } from '@/types/api-error';
import { useNotificationStore } from '@/stores/notification-store';

function handleQueryError(error: unknown) {
  const parsed = parseApiError(error);
  if (parsed.status === 401) return;
  useNotificationStore.getState().addToast('error', parsed.message);
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleQueryError }),
  mutationCache: new MutationCache({ onError: handleQueryError }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const mode = useThemeStore((s) => s.mode);
  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              '@font-face': {
                fontFamily: 'STOP',
                src: "url('/fonts/StopFont.woff2') format('woff2'), url('/fonts/StopFont.ttf') format('truetype')",
                fontWeight: 400,
                fontStyle: 'normal',
                fontDisplay: 'swap',
              },
            }}
          />
          {children}
          <NotificationProvider />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
