import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DatabaseEnv, LoginResponse, MeResponse } from '@/types/auth-types';

interface DeviceState {
  token: string | null;
  refreshToken: string | null;
  database: DatabaseEnv;
  supervisorNome: string | null;
  supervisorCodparc: number | null;
  supervisorCodusu: number | null;
  isConfigured: boolean;
  preferredDepartamento: string | null;
  preferredScale: number;
  hiddenCodparcs: number[];
  tabletName: string;
  autoRefreshSeconds: number;
  showAfastados: boolean;
  gridColumns: number;

  configure: (login: LoginResponse, me: MeResponse, database: DatabaseEnv) => void;
  updateToken: (token: string) => void;
  setPreferredDepartamento: (dep: string | null) => void;
  setPreferredScale: (scale: number) => void;
  setHiddenCodparcs: (codparcs: number[]) => void;
  toggleHiddenCodparc: (codparc: number) => void;
  setTabletName: (name: string) => void;
  setAutoRefreshSeconds: (seconds: number) => void;
  setShowAfastados: (show: boolean) => void;
  setGridColumns: (cols: number) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  token: null,
  refreshToken: null,
  database: 'PROD' as DatabaseEnv,
  supervisorNome: null,
  supervisorCodparc: null,
  supervisorCodusu: null,
  isConfigured: false,
  preferredDepartamento: null as string | null,
  preferredScale: 100,
  hiddenCodparcs: [] as number[],
  tabletName: '',
  autoRefreshSeconds: 300,
  showAfastados: false,
  gridColumns: 0,
};

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      configure: (login, me, database) =>
        set({
          token: login.token,
          refreshToken: login.refreshToken ?? null,
          database,
          supervisorNome: me.nome,
          supervisorCodparc: me.codparc,
          supervisorCodusu: me.codusu,
          isConfigured: true,
        }),

      updateToken: (token) => set({ token }),

      setPreferredDepartamento: (dep) => set({ preferredDepartamento: dep }),

      setPreferredScale: (scale) => set({ preferredScale: Math.max(70, Math.min(150, scale)) }),

      setHiddenCodparcs: (codparcs) => set({ hiddenCodparcs: codparcs }),

      toggleHiddenCodparc: (codparc) => set((state) => {
        const hidden = state.hiddenCodparcs.includes(codparc)
          ? state.hiddenCodparcs.filter((c) => c !== codparc)
          : [...state.hiddenCodparcs, codparc];
        return { hiddenCodparcs: hidden };
      }),

      setTabletName: (name) => set({ tabletName: name }),

      setAutoRefreshSeconds: (seconds) => set({ autoRefreshSeconds: Math.max(30, Math.min(600, seconds)) }),

      setShowAfastados: (show) => set({ showAfastados: show }),

      setGridColumns: (cols) => set({ gridColumns: Math.max(0, Math.min(6, cols)) }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'tabman-device',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        database: state.database,
        supervisorNome: state.supervisorNome,
        supervisorCodparc: state.supervisorCodparc,
        supervisorCodusu: state.supervisorCodusu,
        isConfigured: state.isConfigured,
        preferredDepartamento: state.preferredDepartamento,
        preferredScale: state.preferredScale,
        hiddenCodparcs: state.hiddenCodparcs,
        tabletName: state.tabletName,
        autoRefreshSeconds: state.autoRefreshSeconds,
        showAfastados: state.showAfastados,
        gridColumns: state.gridColumns,
      }),
    },
  ),
);
