import { useMemo, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useThemeStore } from '@/stores/theme-store';
import { lightTheme, darkTheme } from '@/theme/theme-config';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { NotificationProvider } from '@/components/shared/notification-provider';
import { parseApiError } from '@/types/api-error';
import { useNotificationStore } from '@/stores/notification-store';
import { useRefreshMe } from '@/hooks/use-refresh-me';

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
  useRefreshMe();

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
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            {children}
          </LocalizationProvider>
          <NotificationProvider />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
