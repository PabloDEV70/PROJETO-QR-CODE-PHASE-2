import { createTheme } from '@mui/material/styles';

const fontFamily = '"Inter", "Roboto", "Helvetica", "Arial", sans-serif';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
    secondary: { main: '#546e7a', light: '#78909c', dark: '#37474f' },
    background: { default: '#f5f7f5', paper: '#ffffff' },
    success: { main: '#2e7d32', light: '#e8f5e9' },
    warning: { main: '#ed6c02', light: '#fff3e0' },
    error: { main: '#d32f2f', light: '#ffebee' },
  },
  typography: {
    fontFamily,
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundColor: '#ffffff', color: '#1e293b' } },
    },
    MuiToolbar: { styleOverrides: { root: { minHeight: 64 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, height: 26, borderRadius: 13 } } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid rgba(0,0,0,0.08)' } },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#66bb6a', light: '#81c784', dark: '#388e3c' },
    secondary: { main: '#90a4ae', light: '#b0bec5', dark: '#607d8b' },
    background: { default: '#0f1a0f', paper: '#1a2e1a' },
    success: { main: '#66bb6a', light: '#1b3a1b' },
    warning: { main: '#ffa726', light: '#3a2e1b' },
    error: { main: '#f44336', light: '#3a1b1b' },
  },
  typography: {
    fontFamily,
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundColor: '#1a2e1a', color: '#f1f5f9' } },
    },
    MuiToolbar: { styleOverrides: { root: { minHeight: 64 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, height: 26, borderRadius: 13 } } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)' },
      },
    },
  },
});
