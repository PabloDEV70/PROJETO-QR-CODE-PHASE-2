import { create } from 'zustand';

interface ActiveFilters {
  dataInicio?: string;
  dataFim?: string;
  codparc?: number;
  departamento?: string;
}

interface UiState {
  sidebarCollapsed: boolean;
  activeFilters: ActiveFilters;
  toggleSidebar: () => void;
  setFilters: (filters: Partial<ActiveFilters>) => void;
  resetFilters: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  activeFilters: {},
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setFilters: (filters) =>
    set((state) => ({ activeFilters: { ...state.activeFilters, ...filters } })),
  resetFilters: () => set({ activeFilters: {} }),
}));
