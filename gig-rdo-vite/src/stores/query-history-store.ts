import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QueryHistoryEntry {
  id: string;
  sql: string;
  tableName: string;
  rowCount: number;
  execTimeMs: number;
  executedAt: string;
}

const SYSTEM_RE =
  /\b(INFORMATION_SCHEMA|sys\.|sysobjects|syscolumns|sysindexes|master\.|tempdb\.|msdb\.|model\.)/i;

const MAX_ENTRIES = 50;

interface QueryHistoryState {
  entries: QueryHistoryEntry[];
  addEntry: (entry: Omit<QueryHistoryEntry, 'id' | 'executedAt'>) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
}

export function isSystemQuery(sql: string): boolean {
  return SYSTEM_RE.test(sql);
}

export const useQueryHistoryStore = create<QueryHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => {
          const newEntry: QueryHistoryEntry = {
            ...entry,
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            executedAt: new Date().toISOString(),
          };
          const deduped = state.entries.filter((e) => e.sql.trim() !== entry.sql.trim());
          return { entries: [newEntry, ...deduped].slice(0, MAX_ENTRIES) };
        }),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
      clearAll: () => set({ entries: [] }),
    }),
    {
      name: 'gig-rdo-query-history',
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);
