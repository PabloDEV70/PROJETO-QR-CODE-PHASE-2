import { useQuery } from '@tanstack/react-query';
import {
  getFuncionarioPerfil,
  getFuncionarioPerfilSuper,
  buscarFuncionarios,
} from '@/api/funcionarios';

export function useFuncionarioPerfil(codparc: number | null | undefined) {
  const isValidCodparc = codparc !== null && codparc !== undefined && codparc > 0;
  return useQuery({
    queryKey: ['funcionario', 'perfil', codparc],
    queryFn: () => getFuncionarioPerfil(codparc!),
    enabled: isValidCodparc,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFuncionarioPerfilSuper(codparc: number | null | undefined) {
  const isValidCodparc = codparc !== null && codparc !== undefined && codparc > 0;
  return useQuery({
    queryKey: ['funcionario', 'perfil-super', codparc],
    queryFn: () => getFuncionarioPerfilSuper(codparc!),
    enabled: isValidCodparc,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBuscarFuncionarios(termo: string) {
  return useQuery({
    queryKey: ['funcionarios', 'buscar', termo],
    queryFn: () => buscarFuncionarios(termo),
    enabled: termo.length >= 2,
    staleTime: 60 * 1000,
  });
}
