import axios from 'axios';
import type { Gist, GistCreatePayload } from '@/types/gist-types';

const GIST_PREFIX = '[sankhya-query]';

const gh = axios.create({ baseURL: 'https://api.github.com' });

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export async function listSankhyaGists(token: string): Promise<Gist[]> {
  const { data } = await gh.get<Gist[]>('/gists', {
    headers: headers(token),
    params: { per_page: 100 },
  });
  return data.filter((g) => g.description?.startsWith(GIST_PREFIX));
}

export async function getGist(token: string, id: string): Promise<Gist> {
  const { data } = await gh.get<Gist>(`/gists/${id}`, {
    headers: headers(token),
  });
  return data;
}

export async function createGist(
  token: string,
  name: string,
  sql: string,
  description?: string,
): Promise<Gist> {
  const filename = name.endsWith('.sql') ? name : `${name}.sql`;
  const payload: GistCreatePayload = {
    description: `${GIST_PREFIX} ${description || name}`,
    public: false,
    files: { [filename]: { content: sql } },
  };
  const { data } = await gh.post<Gist>('/gists', payload, {
    headers: headers(token),
  });
  return data;
}

export async function updateGist(
  token: string,
  id: string,
  sql: string,
  filename: string,
): Promise<Gist> {
  const { data } = await gh.patch<Gist>(
    `/gists/${id}`,
    { files: { [filename]: { content: sql } } },
    { headers: headers(token) },
  );
  return data;
}

export async function deleteGist(token: string, id: string): Promise<void> {
  await gh.delete(`/gists/${id}`, { headers: headers(token) });
}

export async function validateGithubToken(
  token: string,
): Promise<{ login: string; avatar_url: string }> {
  const { data } = await gh.get<{ login: string; avatar_url: string }>('/user', {
    headers: headers(token),
  });
  return data;
}
