import { useQuery } from '@tanstack/react-query';

import {
  fetchPatrimonioBemDetalhe,
  fetchPatrimonioBemMobilizacao,
  fetchPatrimonioBemLocalizacao,
  fetchPatrimonioBemDocumentos,
  fetchPatrimonioBemOs,
  fetchPatrimonioBemDepreciacao,
  fetchPatrimonioBemComissionamento,
} from '@/api/patrimonio';

export function usePatrimonioBemDetalhe(codbem: string, codprod?: number) {
  return useQuery({
    queryKey: ['patrimonio', 'bem', codbem, codprod],
    queryFn: () => fetchPatrimonioBemDetalhe(codbem, codprod),
    enabled: !!codbem,
    staleTime: 60 * 1000,
  });
}

export function usePatrimonioBemMobilizacao(codbem: string) {
  return useQuery({
    queryKey: ['patrimonio', 'bem', codbem, 'mobilizacao'],
    queryFn: () => fetchPatrimonioBemMobilizacao(codbem),
    enabled: !!codbem,
    staleTime: 60 * 1000,
  });
}

export function usePatrimonioBemLocalizacao(codbem: string) {
  return useQuery({
    queryKey: ['patrimonio', 'bem', codbem, 'localizacao'],
    queryFn: () => fetchPatrimonioBemLocalizacao(codbem),
    enabled: !!codbem,
    staleTime: 60 * 1000,
  });
}

export function usePatrimonioBemDocumentos(codbem: string) {
  return useQuery({
    queryKey: ['patrimonio', 'bem', codbem, 'documentos'],
    queryFn: () => fetchPatrimonioBemDocumentos(codbem),
    enabled: !!codbem,
    staleTime: 60 * 1000,
  });
}

export function usePatrimonioBemOs(codbem: string) {
  return useQuery({
    queryKey: ['patrimonio', 'bem', codbem, 'os'],
    queryFn: () => fetchPatrimonioBemOs(codbem),
    enabled: !!codbem,
    staleTime: 60 * 1000,
  });
}

export function usePatrimonioBemDepreciacao(codbem: string, codprod?: number) {
  return useQuery({
    queryKey: ['patrimonio', 'bem', codbem, 'depreciacao', codprod],
    queryFn: () => fetchPatrimonioBemDepreciacao(codbem, codprod),
    enabled: !!codbem,
    staleTime: 60 * 1000,
  });
}

export function usePatrimonioBemComissionamento(codbem: string) {
  return useQuery({
    queryKey: ['patrimonio', 'bem', codbem, 'comissionamento'],
    queryFn: () => fetchPatrimonioBemComissionamento(codbem),
    enabled: !!codbem,
    staleTime: 60 * 1000,
  });
}
