import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getPermissoesResumo,
  getPermissoesTelas,
  getPermissoesTelaDetalhes,
  getPermissoesGrupos,
  getPermissoesGrupoDetalhes,
  getPermissoesUsuarios,
  getPermissoesUsuarioDetalhes,
  getPermissoesConflitos,
} from '@/api/permissoes';
import type { TelaListParams, UsuarioListParams } from '@/types/permissoes-types';

export function usePermissoesResumo() {
  return useQuery({
    queryKey: ['permissoes', 'resumo'],
    queryFn: getPermissoesResumo,
    staleTime: 60 * 1000,
  });
}

export function usePermissoesTelas(params: TelaListParams) {
  return useQuery({
    queryKey: ['permissoes', 'telas', params],
    queryFn: () => getPermissoesTelas(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function usePermissoesTelaDetalhes(idacesso: string | null) {
  return useQuery({
    queryKey: ['permissoes', 'tela', idacesso],
    queryFn: () => getPermissoesTelaDetalhes(idacesso!),
    enabled: !!idacesso,
    staleTime: 30 * 1000,
  });
}

export function usePermissoesGrupos() {
  return useQuery({
    queryKey: ['permissoes', 'grupos'],
    queryFn: getPermissoesGrupos,
    staleTime: 60 * 1000,
  });
}

export function usePermissoesGrupoDetalhes(codgrupo: number | null) {
  return useQuery({
    queryKey: ['permissoes', 'grupo', codgrupo],
    queryFn: () => getPermissoesGrupoDetalhes(codgrupo!),
    enabled: !!codgrupo,
    staleTime: 30 * 1000,
  });
}

export function usePermissoesUsuarios(params: UsuarioListParams) {
  return useQuery({
    queryKey: ['permissoes', 'usuarios', params],
    queryFn: () => getPermissoesUsuarios(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function usePermissoesUsuarioDetalhes(codusu: number | null) {
  return useQuery({
    queryKey: ['permissoes', 'usuario', codusu],
    queryFn: () => getPermissoesUsuarioDetalhes(codusu!),
    enabled: !!codusu,
    staleTime: 30 * 1000,
  });
}

export function usePermissoesConflitos() {
  return useQuery({
    queryKey: ['permissoes', 'conflitos'],
    queryFn: getPermissoesConflitos,
    staleTime: 60 * 1000,
  });
}
