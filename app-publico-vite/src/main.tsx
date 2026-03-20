import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { theme } from '@/app/theme';
import { router } from '@/app/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
