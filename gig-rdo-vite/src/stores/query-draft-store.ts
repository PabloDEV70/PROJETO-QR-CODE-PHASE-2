import { create } from 'zustand';

interface QueryDraftState {
  draftSql: string | null;
  setDraft: (sql: string) => void;
  clearDraft: () => void;
}

export const useQueryDraftStore = create<QueryDraftState>()((set) => ({
  draftSql: null,
  setDraft: (sql) => set({ draftSql: sql }),
  clearDraft: () => set({ draftSql: null }),
}));
