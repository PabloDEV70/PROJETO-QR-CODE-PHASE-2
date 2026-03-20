import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GistState {
  githubToken: string | null;
  recentGistIds: string[];
  setGithubToken: (token: string | null) => void;
  addRecentGist: (id: string) => void;
}

export const useGistStore = create<GistState>()(
  persist(
    (set) => ({
      githubToken: null,
      recentGistIds: [],
      setGithubToken: (githubToken) => set({ githubToken }),
      addRecentGist: (id) =>
        set((state) => ({
          recentGistIds: [id, ...state.recentGistIds.filter((g) => g !== id)].slice(0, 20),
        })),
    }),
    {
      name: 'gig-rdo-gist',
      partialize: (state) => ({
        githubToken: state.githubToken,
        recentGistIds: state.recentGistIds,
      }),
    },
  ),
);
