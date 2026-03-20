import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listSankhyaGists, getGist, createGist, updateGist, deleteGist, validateGithubToken,
} from '@/api/github-gist-api';
import { useGistStore } from '@/stores/gist-store';

function useToken() {
  return useGistStore((s) => s.githubToken);
}

export function useGistList() {
  const token = useToken();
  return useQuery({
    queryKey: ['gists', 'list'],
    queryFn: () => listSankhyaGists(token!),
    enabled: !!token,
    staleTime: 2 * 60_000,
  });
}

export function useGistDetail(id: string | null) {
  const token = useToken();
  return useQuery({
    queryKey: ['gists', 'detail', id],
    queryFn: () => getGist(token!, id!),
    enabled: !!token && !!id,
    staleTime: 5 * 60_000,
  });
}

export function useCreateGist() {
  const token = useToken();
  const qc = useQueryClient();
  const addRecent = useGistStore((s) => s.addRecentGist);
  return useMutation({
    mutationFn: (p: { name: string; sql: string; description?: string }) =>
      createGist(token!, p.name, p.sql, p.description),
    onSuccess: (data) => {
      addRecent(data.id);
      qc.invalidateQueries({ queryKey: ['gists', 'list'] });
    },
  });
}

export function useUpdateGist() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; sql: string; filename: string }) =>
      updateGist(token!, p.id, p.sql, p.filename),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['gists', 'detail', vars.id] });
      qc.invalidateQueries({ queryKey: ['gists', 'list'] });
    },
  });
}

export function useDeleteGist() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGist(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gists', 'list'] }),
  });
}

export function useValidateGithubToken() {
  return useMutation({
    mutationFn: (token: string) => validateGithubToken(token),
  });
}
