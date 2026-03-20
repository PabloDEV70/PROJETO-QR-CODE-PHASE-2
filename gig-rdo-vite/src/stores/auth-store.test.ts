import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useAuthStore.setState({
      user: null,
      database: 'PROD',
      isAuthenticated: false,
    });
  });

  it('starts with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.database).toBe('PROD');
  });

  it('setUser sets user and authenticates', () => {
    useAuthStore.getState().setUser({
      token: 'test-token',
      type: 'standard',
      username: 'admin',
    });
    const state = useAuthStore.getState();
    expect(state.user).toEqual({
      token: 'test-token',
      type: 'standard',
      username: 'admin',
    });
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout clears user and deauthenticates', () => {
    useAuthStore.getState().setUser({
      token: 'test-token',
      type: 'standard',
    });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setDatabase changes database environment', () => {
    useAuthStore.getState().setDatabase('TESTE');
    expect(useAuthStore.getState().database).toBe('TESTE');
  });

  it('setDatabase to TREINA works', () => {
    useAuthStore.getState().setDatabase('TREINA');
    expect(useAuthStore.getState().database).toBe('TREINA');
  });
});
