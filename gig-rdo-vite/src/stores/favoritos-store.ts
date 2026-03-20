import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritosState {
  codparcs: number[];
  toggle: (codparc: number) => void;
  isFavorito: (codparc: number) => boolean;
  clear: () => void;
}

export const useFavoritosStore = create<FavoritosState>()(
  persist(
    (set, get) => ({
      codparcs: [],
      toggle: (codparc) =>
        set((s) => ({
          codparcs: s.codparcs.includes(codparc)
            ? s.codparcs.filter((c) => c !== codparc)
            : [...s.codparcs, codparc],
        })),
      isFavorito: (codparc) => get().codparcs.includes(codparc),
      clear: () => set({ codparcs: [] }),
    }),
    { name: 'rdo-favoritos' },
  ),
);
