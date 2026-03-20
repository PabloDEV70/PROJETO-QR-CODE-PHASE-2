import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  saveFuncionariosFilters,
  loadFuncionariosFilters,
  clearFuncionariosFilters,
} from '@/utils/funcionarios-filter-storage';
import type { ListarFuncionariosParams } from '@/types/funcionario-types';

export function useFuncionariosUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const didRestore = useRef(false);

  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    const saved = loadFuncionariosFilters();
    if (!saved) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, val] of Object.entries(saved)) {
        if (!next.has(key)) next.set(key, val);
      }
      return next;
    }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    saveFuncionariosFilters(searchParams);
  }, [searchParams]);

  const situacao = searchParams.get('situacao') || '1';
  const codemp = searchParams.get('codemp') || '';
  const coddep = searchParams.get('coddep') || '';
  const codcargo = searchParams.get('codcargo') || '';
  const codfuncao = searchParams.get('codfuncao') || '';
  const termo = searchParams.get('termo') || '';
  const dataInicio = searchParams.get('dataInicio') || '';
  const dataFim = searchParams.get('dataFim') || '';
  const tab = Number(searchParams.get('tab')) || 0;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 25;
  const orderBy = searchParams.get('orderBy') || 'nomeparc';
  const orderDir = (searchParams.get('orderDir') || 'ASC') as 'ASC' | 'DESC';
  const drawerCodparc = Number(searchParams.get('drawer')) || null;

  const listParams = useMemo<ListarFuncionariosParams>(() => {
    const p: ListarFuncionariosParams = {
      page, limit, orderBy, orderDir,
    };
    if (situacao && situacao !== 'all') p.situacao = situacao;
    if (codemp) p.codemp = Number(codemp);
    if (coddep) p.coddep = Number(coddep);
    if (codcargo) p.codcargo = Number(codcargo);
    if (codfuncao) p.codfuncao = Number(codfuncao);
    if (termo) p.termo = termo;
    if (dataInicio) p.dataInicio = dataInicio;
    if (dataFim) p.dataFim = dataFim;
    return p;
  }, [
    page, limit, orderBy, orderDir, situacao,
    codemp, coddep, codcargo, codfuncao, termo, dataInicio, dataFim,
  ]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val === null || val === '') next.delete(key);
          else next.set(key, val);
        }
        const isFilterChange = Object.keys(updates).some(
          (k) => !['page', 'tab', 'drawer'].includes(k),
        );
        if (isFilterChange && !('page' in updates)) next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const clearAll = useCallback(() => {
    clearFuncionariosFilters();
    setSearchParams({ situacao: '1' });
  }, [setSearchParams]);

  return {
    situacao, codemp, coddep, codcargo, codfuncao, termo,
    dataInicio, dataFim,
    tab, page, limit, orderBy, orderDir, listParams, drawerCodparc,
    updateParams, clearAll,
  };
}
