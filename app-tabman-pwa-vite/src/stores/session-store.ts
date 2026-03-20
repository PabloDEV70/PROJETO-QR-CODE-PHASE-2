import { create } from 'zustand';

interface SessionState {
  activeCodparc: number | null;
  activeNome: string | null;
  startSession: (codparc: number, nome: string) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  activeCodparc: null,
  activeNome: null,

  startSession: (codparc, nome) =>
    set({ activeCodparc: codparc, activeNome: nome }),

  endSession: () =>
    set({ activeCodparc: null, activeNome: null }),
}));
