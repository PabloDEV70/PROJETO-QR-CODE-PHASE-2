import { useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { type GridSortModel, type GridRowSelectionModel } from '@mui/x-data-grid';
import { TreinamentosDataGrid } from '@/components/treinamentos/treinamentos-data-grid';
import { TreinamentoDetailDrawer } from '@/components/treinamentos/treinamento-detail-drawer';
import { useColaboradoresTodos, useFiltroOpcoes } from '@/hooks/use-treinamento';
import { getTreinamentosTodos } from '@/api/treinamentos';
import { printTreinamentosBatch } from '@/components/treinamentos/treinamento-batch-print';
import type { ColaboradorListItem, OpcaoFiltro } from '@/types/treinamento-types';

const DEPARTAMENTOS = [
  'ADM', 'ALMOXARIFADO', 'COMERCIAL.', 'COMPRAS', 'CONTABILIDADE',
  'CONTROLADORIA', 'DIRETORIA', 'FINANCEIRO', 'GERÊNCIA',
  'LOGISTICA / PATIO', 'MANUTENÇÃO', 'OPERAÇÃO', 'OPERADORES ROTINA',
  'OPERADORES SERRA', 'PARADA', 'PORTARIA', 'PROGRAMAÇÃO', 'QUALIDADE',
  'RECURSOS HUMANOS', 'SEGURANCA DO TRABALHO', 'SERVIÇOS GERAIS',
  'TECNOLOGIA DA INFORMAÇÃO',
];


function getTreinamentoRowId(row: ColaboradorListItem) {
  return `${row.CODEMP}-${row.CODFUNC}`;
}

export function TreinamentoListPage() {
  const [sp, setSp] = useSearchParams();
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorListItem | null>(null);
  const [printing, setPrinting] = useState(false);
  const [printCols, setPrintCols] = useState(2);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<string>(),
  });

  const departamento = sp.get('departamento') || '';
  const situacao = sp.get('situacao') || 'ATIVO';
  const termo = sp.get('termo') || '';
  const sortModel: GridSortModel = [];

  const { data: filtroOpcoes } = useFiltroOpcoes();

  const coddep = useMemo(() => {
    if (!departamento) return undefined;
    const n = Number(departamento);
    if (!Number.isNaN(n)) return n;
    // try to resolve via filtroOpcoes first (descricao -> codigo), then fallback to DEPARTAMENTOS index
    const found = filtroOpcoes?.departamentos?.find(
      (d) => d.descricao === departamento || String(d.codigo) === departamento,
    );
    if (found) return found.codigo;
    const idx = DEPARTAMENTOS.findIndex((d) => d === departamento);
    return idx >= 0 ? idx + 1 : undefined;
  }, [departamento, filtroOpcoes]);

  const { data, isLoading, refetch } = useColaboradoresTodos(coddep);

  const departamentos = useMemo<OpcaoFiltro[]>(() => {
    return (
      filtroOpcoes?.departamentos ?? DEPARTAMENTOS.map((d, i) => ({ codigo: i + 1, descricao: d }))
    );
  }, [filtroOpcoes]);
  
  const selectedCount = selectionModel.type === 'include' ? selectionModel.ids.size : 0;
  const total = data?.length ?? 0;

  const update = useCallback((patch: Record<string, string | null>) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === '') next.delete(k); else next.set(k, v);
      }
      return next;
    }, { replace: true });
  }, [setSp]);

  const handleSortChange = useCallback((m: GridSortModel) => {
    // Ordenação server-side removida: listagem sem paginação.
    // Mantemos a assinatura para o DataGrid.
    void m;
  }, []);
  
  const handleDepartamentoChange = useCallback((v: OpcaoFiltro | null) => {
    // store departamento as descricao (name) so it matches armario-list behavior
    update({ departamento: v ? v.descricao : null });
  }, [update]);

  const handleSituacaoChange = useCallback((v: string) => {
    update({ situacao: v });
  }, [update]);

  const handleTermoChange = useCallback((v: string) => {
    update({ termo: v });
  }, [update]);

  const handleSelectionChange = useCallback((model: GridRowSelectionModel) => {
    setSelectionModel(model);
  }, []);

  const handlePrintSelected = useCallback(() => {
    if (!data || selectedCount === 0) return;
    const selIds = selectionModel.type === 'include'
      ? selectionModel.ids
      : new Set<string>();
    const selected = data.filter((r) => selIds.has(getTreinamentoRowId(r)));
    if (selected.length > 0) printTreinamentosBatch(selected, { columns: printCols });
  }, [data, selectedCount, selectionModel, printCols]);

  const handlePrintAll = useCallback(async () => {
    setPrinting(true);
    try {
      const all = await getTreinamentosTodos({
        coddep: coddep,
      });
      if (all.length > 0) printTreinamentosBatch(all, { columns: printCols });
    } finally { setPrinting(false); }
  }, [coddep, printCols]);

  const filteredRows = useMemo(() => {
    const allRows = Array.isArray(data) ? data.filter((r) => r && typeof r === 'object') : [];
    const normalizedTerm = termo.trim().toLowerCase();
    return allRows.filter((row) => {
      if (situacao === 'INATIVO') return false;
      if (!normalizedTerm) return true;
      return (
        row.NOMEFUNC?.toLowerCase().includes(normalizedTerm) ||
        row.DESCRCARGO?.toLowerCase().includes(normalizedTerm) ||
        row.RAZAOSOCIAL?.toLowerCase().includes(normalizedTerm)
      );
    });
  }, [data, situacao, termo]);

  return (
    <Box>
      <TreinamentosDataGrid
        rows={filteredRows}
        isLoading={isLoading}
        sortModel={sortModel}
        selectionModel={selectionModel}
        onSortModelChange={handleSortChange}
        onSelectionChange={handleSelectionChange}
        onPreview={setSelectedColaborador}
        onRefresh={() => refetch()}
        departamento={departamento}
        departamentos={departamentos}
        onDepartamentoChange={handleDepartamentoChange}
        situacao={situacao}
        onSituacaoChange={handleSituacaoChange}
        termo={termo}
        onTermoChange={handleTermoChange}
        selectedCount={selectedCount}
        totalCount={filteredRows.length || total}
        printCols={printCols}
        printing={printing}
        onPrintSelected={handlePrintSelected}
        onPrintAll={handlePrintAll}
        onPrintColsChange={setPrintCols}
      />

      <TreinamentoDetailDrawer
        open={selectedColaborador !== null}
        onClose={() => setSelectedColaborador(null)}
        colaborador={selectedColaborador}
      />
    </Box>
  );
}
