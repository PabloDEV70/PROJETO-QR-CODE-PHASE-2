import { useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import {
  type GridSortModel,
  type GridPaginationModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { ArmariosDataGrid } from '@/components/armarios/armarios-data-grid';
import { ArmarioLabelDrawer } from '@/components/armarios/armario-label-print';
import { printArmariosBatch } from '@/components/armarios/armario-batch-print';
import { useArmariosList, useArmarioLocais } from '@/hooks/use-armario';
import { getArmariosTodos } from '@/api/armarios';
import type { ArmarioListItem, ListarArmariosParams } from '@/types/armario-types';

const DEPARTAMENTOS = [
  'ADM', 'ALMOXARIFADO', 'COMERCIAL.', 'COMPRAS', 'CONTABILIDADE',
  'CONTROLADORIA', 'DIRETORIA', 'FINANCEIRO', 'GERÊNCIA',
  'LOGISTICA / PATIO', 'MANUTENÇÃO', 'OPERAÇÃO', 'OPERADORES ROTINA',
  'OPERADORES SERRA', 'PARADA', 'PORTARIA', 'PROGRAMAÇÃO', 'QUALIDADE',
  'RECURSOS HUMANOS', 'SEGURANCA DO TRABALHO', 'SERVIÇOS GERAIS',
  'TECNOLOGIA DA INFORMAÇÃO',
];

export function ArmarioListPage() {
  const [sp, setSp] = useSearchParams();
  const [printing, setPrinting] = useState(false);
  const [previewArmario, setPreviewArmario] = useState<ArmarioListItem | null>(null);
  const [printCols, setPrintCols] = useState(2);

  const page = Number(sp.get('page')) || 1;
  const limit = Number(sp.get('limit')) || 25;
  const localArm = sp.get('localArm') || '';
  const ocupado = sp.get('ocupado') || '';
  const departamento = sp.get('departamento') || '';
  const orderBy = (sp.get('orderBy') || 'codarmario') as ListarArmariosParams['orderBy'];
  const orderDir = (sp.get('orderDir') || 'DESC') as 'ASC' | 'DESC';

  const params: ListarArmariosParams = useMemo(() => ({
    page, limit,
    localArm: localArm ? Number(localArm) : undefined,
    ocupado: ocupado === 'true' ? true : ocupado === 'false' ? false : undefined,
    departamento: departamento || undefined,
    orderBy, orderDir,
  }), [page, limit, localArm, ocupado, departamento, orderBy, orderDir]);

  const { data, isLoading, refetch } = useArmariosList(params);
  const { data: locais } = useArmarioLocais();

  const localOptions = useMemo(() => {
    return (locais ?? []).map((l) => ({ valor: l.valor, descricao: l.descricao }));
  }, [locais]);

  const selectionRaw = sp.get('sel');
  const selectionModel: GridRowSelectionModel = useMemo(() => {
    if (!selectionRaw) return { type: 'include' as const, ids: new Set<number>() };
    const ids = selectionRaw.split(',').map(Number).filter(Boolean);
    return { type: 'include' as const, ids: new Set(ids) };
  }, [selectionRaw]);

  const selectedCount = selectionModel.type === 'include' ? selectionModel.ids.size : 0;
  const total = data?.meta.total ?? 0;

  const update = useCallback((patch: Record<string, string | null>) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === '') next.delete(k); else next.set(k, v);
      }
      return next;
    }, { replace: true });
  }, [setSp]);

  const handlePaginationChange = useCallback((m: GridPaginationModel) => {
    update({ page: String(m.page + 1), limit: String(m.pageSize) });
  }, [update]);

  const handleSortChange = useCallback((m: GridSortModel) => {
    if (m.length > 0 && m[0]?.sort) {
      update({ orderBy: m[0].field, orderDir: m[0].sort === 'asc' ? 'ASC' : 'DESC' });
    }
  }, [update]);

  const handleSelectionChange = useCallback((model: GridRowSelectionModel) => {
    if (model.type === 'include') {
      const ids = Array.from(model.ids);
      update({ sel: ids.length > 0 ? ids.join(',') : null });
    } else if (model.type === 'exclude') {
      const excluded = model.ids;
      const currentRows = data?.data ?? [];
      const ids = currentRows.map((r) => r.codarmario).filter((id) => !excluded.has(id));
      update({ sel: ids.length > 0 ? ids.join(',') : null });
    }
  }, [update, data?.data]);

  const handlePrintSelected = useCallback(() => {
    if (!data?.data || selectedCount === 0) return;
    const selIds = selectionModel.type === 'include' ? selectionModel.ids : new Set<number>();
    const selected = data.data.filter((r) => selIds.has(r.codarmario));
    if (selected.length > 0) printArmariosBatch(selected, { columns: printCols });
  }, [data?.data, selectedCount, selectionModel, printCols]);

  const handlePrintAll = useCallback(async () => {
    setPrinting(true);
    try {
      const all = await getArmariosTodos({
        localArm: localArm ? Number(localArm) : undefined,
        ocupado: ocupado === 'true' ? true : ocupado === 'false' ? false : undefined,
        departamento: departamento || undefined,
        orderBy, orderDir,
      });
      if (all.length > 0) printArmariosBatch(all, { columns: printCols });
    } finally { setPrinting(false); }
  }, [localArm, ocupado, departamento, orderBy, orderDir, printCols]);

  const paginationModel: GridPaginationModel = { page: page - 1, pageSize: limit };
  const sortModel: GridSortModel = orderBy
    ? [{ field: orderBy, sort: orderDir === 'ASC' ? 'asc' : 'desc' }]
    : [];

  return (
    <Box>
      <ArmariosDataGrid
        rows={data?.data ?? []}
        rowCount={total}
        isLoading={isLoading}
        paginationModel={paginationModel}
        sortModel={sortModel}
        selectionModel={selectionModel}
        onPaginationModelChange={handlePaginationChange}
        onSortModelChange={handleSortChange}
        onSelectionChange={handleSelectionChange}
        onPreview={setPreviewArmario}
        onRefresh={() => refetch()}
        localArm={localArm}
        localOptions={localOptions}
        onLocalChange={useCallback((v: string) => update({ localArm: v || null, page: '1' }), [update])}
        ocupado={ocupado}
        onOcupadoChange={useCallback((v: string) => update({ ocupado: v || null, page: '1' }), [update])}
        departamento={departamento}
        departamentos={DEPARTAMENTOS}
        onDepartamentoChange={useCallback((v: string | null) => update({ departamento: v || null, page: '1' }), [update])}
        selectedCount={selectedCount}
        totalCount={total}
        printCols={printCols}
        printing={printing}
        onPrintSelected={handlePrintSelected}
        onPrintAll={handlePrintAll}
        onPrintColsChange={setPrintCols}
      />

      <ArmarioLabelDrawer
        open={previewArmario !== null}
        onClose={() => setPreviewArmario(null)}
        armario={previewArmario}
      />
    </Box>
  );
}
