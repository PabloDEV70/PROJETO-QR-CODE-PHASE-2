import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { theme } from '@/theme/theme-config';
import { NotificationProvider } from '@/components/shared/notification-provider';
import { useNotificationStore } from '@/stores/notification-store';
import { router } from '@/app/router';

function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Erro desconhecido';
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      useNotificationStore.getState().addToast('error', parseErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      useNotificationStore.getState().addToast('error', parseErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {},
  },
});

export function AppProvider() {
  return (
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
            body: { overscrollBehaviorY: 'contain' },
          }}
        />
        <RouterProvider router={router} />
        <NotificationProvider />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
