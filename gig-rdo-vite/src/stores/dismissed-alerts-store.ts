import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DismissedAlertsState {
  dismissedIds: string[];
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useDismissedAlertsStore = create<DismissedAlertsState>()(
  persist(
    (set) => ({
      dismissedIds: [],
      dismiss: (id) =>
        set((s) => ({
          dismissedIds: s.dismissedIds.includes(id)
            ? s.dismissedIds
            : [...s.dismissedIds, id],
        })),
      clear: () => set({ dismissedIds: [] }),
    }),
    { name: 'rdo-dismissed-alerts' },
  ),
);
