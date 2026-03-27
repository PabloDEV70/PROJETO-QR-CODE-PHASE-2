// === Login Components (Organisms) ===
export * from './components/login';

// === Molecules ===
export { EmptyState } from './components/molecules/empty-state';
export { LoadingState } from './components/molecules/loading-state';
export { SearchInput } from './components/molecules/search-input';

// === Organisms ===
export { Modal } from './components/organisms/modal';
export { useModal as useModalDialog } from './components/organisms/modal';

// === Composables ===
export * from './composables';

// === Stores ===
export { createAuthStore } from './stores/auth-store';
export type { AuthState, AuthStore } from './stores/auth-store';
export { createThemeStore } from './stores/theme-store';
export type { ThemeState, ThemeStore } from './stores/theme-store';

// === Theme ===
export { lightTheme, darkTheme } from './theme';

// === API Client ===
export { createApiInterceptors } from './api/client';
export type { ApiClientConfig } from './api/client';

// === Types ===
export type {
  DatabaseEnv,
  AuthUser,
  StandardLoginPayload,
  ColaboradorLoginPayload,
  LoginResponse,
  MeResponse,
} from './types/auth-types';
