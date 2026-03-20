import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      productive: string;
      nonproductive: string;
      danger: string;
      info: string;
      purple: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      productive?: string;
      nonproductive?: string;
      danger?: string;
      info?: string;
      purple?: string;
    };
  }
}

const fontFamily = '"Inter", system-ui, -apple-system, sans-serif';

const sharedTypography = {
  fontFamily,
  h3: { fontWeight: 700, letterSpacing: '-0.025em' },
  h4: { fontWeight: 600, letterSpacing: '-0.025em' },
  h5: { fontWeight: 700, letterSpacing: '-0.01em' },
  h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em' },
};

const sharedComponents = {
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        backgroundColor: 'transparent',
        color: 'inherit',
      },
    },
  },
  MuiToolbar: {
    styleOverrides: { root: { minHeight: 48 } },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 600,
        borderRadius: 4,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: { borderRadius: 4 },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 500, height: 24, borderRadius: 4 },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { borderRadius: 6 },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: { borderRadius: 2, height: 6 },
      bar: { borderRadius: 2 },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
    secondary: { main: '#546e7a', light: '#78909c', dark: '#37474f' },
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    success: { main: '#16a34a', light: '#f0fdf4' },
    warning: { main: '#ea580c', light: '#fff7ed' },
    error: { main: '#dc2626', light: '#fef2f2' },
    custom: {
      productive: '#16A34A',
      nonproductive: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      purple: '#8B5CF6',
    },
  },
  typography: sharedTypography,
  shape: { borderRadius: 4 },
  components: {
    ...sharedComponents,
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid rgba(0,0,0,0.08)' },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4ADE80', light: '#86efac', dark: '#22c55e' },
    secondary: { main: '#94a3b8', light: '#cbd5e1', dark: '#64748b' },
    background: { default: '#0A0A0A', paper: '#1A1A1A' },
    success: { main: '#4ADE80', light: '#14281a' },
    warning: { main: '#fb923c', light: '#1c1408' },
    error: { main: '#f87171', light: '#1c0808' },
    custom: {
      productive: '#4ADE80',
      nonproductive: '#FBBF24',
      danger: '#F87171',
      info: '#60A5FA',
      purple: '#A78BFA',
    },
  },
  typography: sharedTypography,
  shape: { borderRadius: 4 },
  components: {
    ...sharedComponents,
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
  },
});
