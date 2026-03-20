import { apiClient } from '@/api/client';

export interface UsuarioSearch {
  codusu: number;
  nomeusu: string;
  email: string | null;
  codparc: number | null;
  nomeparc?: string;
  codemp: number | null;
  nomeempresa?: string;
  codfunc: number | null;
  codgrupo: number | null;
  nomegrupo?: string;
  ativo: 'S' | 'N';
}

export async function buscarUsuarios(
  termo: string,
  ativo: 'S' | 'N' = 'S',
): Promise<UsuarioSearch[]> {
  const { data } = await apiClient.get<UsuarioSearch[]>('/usuarios/search', {
    params: { q: termo, ativo },
  });
  return data;
}
