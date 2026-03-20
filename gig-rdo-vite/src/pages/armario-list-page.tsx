import { useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Stack, TextField, MenuItem, Button, Typography, CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Print, PrintOutlined } from '@mui/icons-material';
import { type GridRowSelectionModel } from '@mui/x-data-grid';
import { ArmariosDataGrid } from '@/components/armarios/armarios-data-grid';
import { ArmarioLabelDrawer } from '@/components/armarios/armario-label-print';
import { printArmariosBatch } from '@/components/armarios/armario-batch-print';
import { useArmariosList, useArmarioLocais } from '@/hooks/use-armario';
import { getArmariosTodos } from '@/api/armarios';
import type { ArmarioListItem, ListarArmariosParams } from '@/types/armario-types';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Ocupado' },
  { value: 'false', label: 'Livre' },
];

const COLS_OPTIONS = [
  { value: '1', label: '1 por linha' },
  { value: '2', label: '2 por linha' },
  { value: '3', label: '3 por linha' },
  { value: '4', label: '4 por linha' },
];

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
  const termo = sp.get('termo') || '';
  const orderBy = (sp.get('orderBy') || 'codarmario') as ListarArmariosParams['orderBy'];
  const orderDir = (sp.get('orderDir') || 'DESC') as 'ASC' | 'DESC';

  const params: ListarArmariosParams = useMemo(() => ({
    page, limit,
    localArm: localArm ? Number(localArm) : undefined,
    ocupado: ocupado === 'true' ? true : ocupado === 'false' ? false : undefined,
    departamento: departamento || undefined,
    termo: termo || undefined, orderBy, orderDir,
  }), [page, limit, localArm, ocupado, departamento, termo, orderBy, orderDir]);

  const { data, isLoading } = useArmariosList(params);
  const { data: locais } = useArmarioLocais();

  const localOptions = useMemo(() => {
    const opts = [{ value: '', label: 'Todos' }];
    if (locais) {
      for (const l of locais) {
        opts.push({ value: l.valor, label: l.descricao });
      }
    }
    return opts;
  }, [locais]);

  const selectionRaw = sp.get('sel');
  const selectionModel: GridRowSelectionModel = useMemo(() => {
    if (!selectionRaw) return { type: 'include' as const, ids: new Set<number>() };
    const ids = selectionRaw.split(',').map(Number).filter(Boolean);
    return { type: 'include' as const, ids: new Set(ids) };
  }, [selectionRaw]);

  const selectedCount = selectionModel.type === 'include' ? selectionModel.ids.size : 0;

  const update = useCallback((patch: Record<string, string | null>) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === '') next.delete(k); else next.set(k, v);
      }
      return next;
    }, { replace: true });
  }, [setSp]);

  const handleSelectionChange = useCallback((model: GridRowSelectionModel) => {
    if (model.type === 'include') {
      const ids = Array.from(model.ids);
      update({ sel: ids.length > 0 ? ids.join(',') : null });
    } else if (model.type === 'exclude') {
      // "Select all" — select all visible rows minus excluded
      const excluded = model.ids;
      const currentRows = data?.data ?? [];
      const ids = currentRows
        .map((r) => r.codarmario)
        .filter((id) => !excluded.has(id));
      update({ sel: ids.length > 0 ? ids.join(',') : null });
    }
  }, [update, data?.data]);

  const handlePrintSelected = () => {
    if (!data?.data || selectedCount === 0) return;
    const selIds = selectionModel.type === 'include' ? selectionModel.ids : new Set<number>();
    const selected = data.data.filter((r) => selIds.has(r.codarmario));
    if (selected.length > 0) printArmariosBatch(selected, { columns: printCols });
  };

  const handlePrintAll = async () => {
    setPrinting(true);
    try {
      const all = await getArmariosTodos({
        localArm: localArm ? Number(localArm) : undefined,
        ocupado: ocupado === 'true' ? true : ocupado === 'false' ? false : undefined,
        departamento: departamento || undefined,
        termo: termo || undefined, orderBy, orderDir,
      });
      if (all.length > 0) printArmariosBatch(all, { columns: printCols });
    } finally { setPrinting(false); }
  };

  const total = data?.meta.total ?? 0;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Armarios</Typography>
        {total > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              select size="small" value={String(printCols)}
              onChange={(e) => setPrintCols(Number(e.target.value))}
              sx={{ minWidth: 130 }}
              label="Colunas"
            >
              {COLS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
            {selectedCount > 0 && (
              <Button
                variant="outlined" startIcon={<PrintOutlined />}
                onClick={handlePrintSelected} size="small"
                sx={{
                  textTransform: 'none', borderColor: '#1B5E20', color: '#1B5E20',
                  '&:hover': { borderColor: '#2E7D32', bgcolor: 'rgba(27,94,32,0.04)' },
                }}
              >
                Selecionados ({selectedCount})
              </Button>
            )}
            <Button
              variant="contained" size="small" onClick={handlePrintAll} disabled={printing}
              startIcon={printing
                ? <CircularProgress size={16} color="inherit" />
                : <Print />}
              sx={{
                textTransform: 'none', bgcolor: '#1B5E20',
                '&:hover': { bgcolor: '#2E7D32' },
              }}
            >
              Todos ({total})
            </Button>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField select label="Local" value={localArm} size="small" sx={{ minWidth: 220 }}
          onChange={(e) => update({ localArm: e.target.value, page: '1' })}>
          {localOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Status" value={ocupado} size="small" sx={{ minWidth: 120 }}
          onChange={(e) => update({ ocupado: e.target.value, page: '1' })}>
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <Autocomplete
          size="small" sx={{ minWidth: 220 }}
          options={DEPARTAMENTOS}
          value={departamento || null}
          onChange={(_, v) => update({ departamento: v || null, page: '1' })}
          renderInput={(p) => <TextField {...p} label="Departamento" />}
          clearOnEscape
        />
        <TextField label="Buscar" value={termo} size="small" sx={{ minWidth: 200 }}
          placeholder="Nome, numero ou cadeado"
          onChange={(e) => update({ termo: e.target.value, page: '1' })} />
      </Stack>

      <ArmariosDataGrid
        rows={data?.data ?? []} rowCount={total} isLoading={isLoading}
        page={page} pageSize={limit} orderBy={orderBy || 'codarmario'} orderDir={orderDir}
        selectionModel={selectionModel} onSelectionChange={handleSelectionChange}
        onPaginationChange={(p, s) => update({ page: String(p), limit: String(s) })}
        onSortChange={(f, d) => update({ orderBy: f, orderDir: d })}
        onPreview={setPreviewArmario}
      />

      <ArmarioLabelDrawer
        open={previewArmario !== null}
        onClose={() => setPreviewArmario(null)}
        armario={previewArmario}
      />
    </Box>
  );
}
