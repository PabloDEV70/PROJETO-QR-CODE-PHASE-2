import { create } from 'zustand';

interface PainelState {
  departmentFilter: number | null;
  scrollSpeed: number;
  isPaused: boolean;
  searchTerm: string;
  setDepartmentFilter: (coddep: number | null) => void;
  setScrollSpeed: (speed: number) => void;
  setIsPaused: (paused: boolean) => void;
  setSearchTerm: (term: string) => void;
}

export const usePainelStore = create<PainelState>()((set) => ({
  departmentFilter: null,
  scrollSpeed: 1,
  isPaused: false,
  searchTerm: '',
  setDepartmentFilter: (departmentFilter) => set({ departmentFilter }),
  setScrollSpeed: (scrollSpeed) => set({ scrollSpeed }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
}));
