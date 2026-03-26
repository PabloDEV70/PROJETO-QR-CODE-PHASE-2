import { useState } from 'react';
import {
  Box, Typography, Chip, Stack, Paper, useTheme,
} from '@mui/material';
import {
  DataGrid, type GridColDef,
  GridToolbar,
} from '@mui/x-data-grid';
import { Clock, ShoppingCart, History } from 'lucide-react';
import { STATUSGIG_MAP } from '@/utils/os-constants';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { useOsCompras, useOsTimeline } from '@/hooks/use-ordens-servico';
import type { OsDetailEnriched, OsDetailServico, OsDetailExecutor } from '@/types/os-types';
import type { OsComprasNota, OsComprasItem, OsTimelineEntry } from '@/api/ordens-servico';

interface OsTablesRedesignProps {
  os: OsDetailEnriched;
  initialTab?: number;
}

function fmtDate(v: string | null) {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtCur(v: number | null) {
  if (v == null || v === 0) return '-';
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function fmtMin(m: number | null) {
  if (m == null) return '-';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h${r}min` : `${h}h`;
}

const SVC_STATUS: Record<string, { label: string; color: string }> = {
  E: { label: 'Execucao', color: '#0ea5e9' },
  F: { label: 'Finalizado', color: '#22c55e' },
  R: { label: 'Realizado', color: '#22c55e' },
  A: { label: 'Aberto', color: '#f59e0b' },
};

const ITEM_STATUS_MAP: Record<string, { label: string; color: string }> = {
  '': { label: 'Pendente', color: '#f59e0b' },
  O: { label: 'Em Cotacao', color: '#3b82f6' },
  A: { label: 'Aprovado', color: '#10b981' },
  F: { label: 'Finalizado', color: '#22c55e' },
  C: { label: 'Cancelado', color: '#ef4444' },
};

const gridSx = {
  border: 'none',
  '& .MuiDataGrid-cell': {
    borderColor: 'divider',
    '&:focus, &:focus-within': { outline: 'none' },
  },
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: (t: any) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 800, fontSize: 11,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    color: 'text.secondary',
  },
  '& .MuiDataGrid-row:hover': {
    bgcolor: (t: any) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.01)',
  },
  '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider' },
  '& .MuiDataGrid-toolbarContainer': {
    py: 1, px: 2, gap: 1,
    borderBottom: '1px solid', borderColor: 'divider',
  },
};

/* ─── Servicos Grid ─── */
function ServicosGrid({ os }: { os: OsDetailEnriched }) {
  const cols: GridColDef<OsDetailServico>[] = [
    {
      field: 'SEQUENCIA', headerName: '#', width: 50,
      renderCell: ({ value }) => (
        <Typography sx={{ fontWeight: 800, color: 'text.secondary', fontFamily: 'monospace', fontSize: 12 }}>
          {String(value).padStart(2, '0')}
        </Typography>
      ),
    },
    {
      field: 'nomeProduto', headerName: 'Servico', flex: 1, minWidth: 250,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
            {row.nomeProduto ?? `Cod. ${row.CODPROD}`}
          </Typography>
          {row.OBSERVACAO && (
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5, fontStyle: 'italic', lineHeight: 1.1 }}>
              {row.OBSERVACAO}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'STATUS', headerName: 'Status', width: 100,
      renderCell: ({ value }) => {
        const d = SVC_STATUS[value as string];
        return d ? (
          <Chip label={d.label} size="small"
            sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: `${d.color}15`, color: d.color, borderRadius: '4px' }} />
        ) : <Typography fontSize={12}>{value || '-'}</Typography>;
      },
    },
    {
      field: 'QTD', headerName: 'Qtd', width: 60, type: 'number',
      renderCell: ({ value }) => <Typography fontSize={12} fontWeight={600}>{value}</Typography>,
    },
    {
      field: 'VLRUNIT', headerName: 'Unit.', width: 100, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => <Typography fontSize={12} fontFamily="monospace">{fmtCur(value as number)}</Typography>,
    },
    {
      field: 'VLRTOT', headerName: 'Total', width: 110, align: 'right', headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography fontSize={12} fontWeight={800} color="primary.main" fontFamily="monospace">
          {fmtCur(value as number)}
        </Typography>
      ),
    },
    {
      field: 'TEMPO', headerName: 'Tempo', width: 90,
      renderCell: ({ value }) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Clock size={12} />
          <Typography fontSize={12} fontWeight={500}>{fmtMin(value as number)}</Typography>
        </Stack>
      ),
    },
  ];

  return (
    <DataGrid
      rows={os.servicos}
      columns={cols}
      getRowId={(r) => `${r.NUOS}-${r.SEQUENCIA}`}
      getRowHeight={() => 'auto'}
      disableRowSelectionOnClick
      sx={gridSx}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 300 },
        },
      }}
      pageSizeOptions={[10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
    />
  );
}

/* ─── Executores Grid ─── */
function ExecutoresGrid({ os }: { os: OsDetailEnriched }) {
  const cols: GridColDef<OsDetailExecutor>[] = [
    {
      field: 'nomeUsuario', headerName: 'Executor', flex: 1, minWidth: 250,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.75 }}>
          <FuncionarioAvatar
            codparc={row.codparc}
            nome={row.nomeColaborador || row.nomeUsuario || ''}
            size="small"
          />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
              {row.nomeUsuario ?? '-'}
            </Typography>
            {row.nomeColaborador && row.nomeColaborador !== row.nomeUsuario && (
              <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.2 }}>
                {row.nomeColaborador}
              </Typography>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      field: 'dtIni', headerName: 'Inicio', width: 150,
      renderCell: ({ value }) => <Typography fontSize={12} fontFamily="monospace">{fmtDate(value as string)}</Typography>,
    },
    {
      field: 'dtFin', headerName: 'Fim', width: 150,
      renderCell: ({ value }) => <Typography fontSize={12} fontFamily="monospace">{fmtDate(value as string)}</Typography>,
    },
    {
      field: 'minutos', headerName: 'Duracao', width: 100,
      renderCell: ({ value }) => (
        <Chip label={fmtMin(value as number)} size="small" variant="outlined"
          sx={{ fontWeight: 700, fontSize: 11, borderRadius: '4px' }} />
      ),
    },
    {
      field: 'obs', headerName: 'Observacao', flex: 1, minWidth: 200,
      renderCell: ({ value }) => (
        <Typography fontSize={12} color="text.secondary" sx={{ whiteSpace: 'normal', lineHeight: 1.3, py: 1 }}>
          {(value as string) || '-'}
        </Typography>
      ),
    },
  ];

  if (os.executores.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.disabled" fontSize={13}>Nenhum executor registrado para esta OS</Typography>
        <Typography color="text.disabled" fontSize={11} sx={{ mt: 0.5 }}>
          Executores sao registrados em AD_TCFEXEC quando o trabalho eh iniciado
        </Typography>
      </Box>
    );
  }

  return (
    <DataGrid
      rows={os.executores}
      columns={cols}
      getRowId={(r) => `${r.NUOS}-${r.SEQUENCIA}-${r.codusu}-${r.dtIni}`}
      getRowHeight={() => 'auto'}
      disableRowSelectionOnClick
      sx={gridSx}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 300 },
        },
      }}
      pageSizeOptions={[10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
    />
  );
}

/* ─── Compras Tab ─── */
function ComprasTab({ nuos }: { nuos: number }) {
  const { data, isLoading } = useOsCompras(nuos);

  if (isLoading) return <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="text.disabled">Carregando...</Typography></Box>;
  if (!data || data.notas.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.disabled" fontSize={13}>Nenhuma requisicao de compra vinculada</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        {data.notas.map((nota) => {
          const itensNota = data.itens.filter((i) => i.NUNOTA === nota.NUNOTA);
          const totalEntregue = itensNota.filter((i) => i.QTD_PENDENTE <= 0).length;

          return (
            <Paper key={nota.NUNOTA} variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1 }}>
              <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>#{nota.NUNOTA}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{nota.TIPO_OPER_DESCRICAO ?? `TOP ${nota.CODTIPOPER}`}</Typography>
                  <Box sx={{ flex: 1 }} />
                  <Chip label={nota.STATUSNOTA === 'L' ? 'Liberada' : nota.STATUSNOTA} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                  {nota.NUMCOTACAO && <Chip label={`Cot. ${nota.NUMCOTACAO}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                  {nota.VLRNOTA != null && nota.VLRNOTA > 0 && (
                    <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'success.main' }}>{fmtCur(nota.VLRNOTA)}</Typography>
                  )}
                  <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{totalEntregue}/{itensNota.length} entregues</Typography>
                </Stack>
              </Box>
              {itensNota.length > 0 && (
                <Box sx={{ px: 1 }}>
                  {itensNota.map((item) => {
                    const st = ITEM_STATUS_MAP[item.STATUS_COTACAO ?? ''] ?? ITEM_STATUS_MAP[''];
                    const entregue = item.QTD_PENDENTE <= 0 && item.PENDENTE === 'N';
                    return (
                      <Stack key={`${item.NUNOTA}-${item.SEQUENCIA}`} direction="row" alignItems="center" spacing={1}
                        sx={{ py: 0.75, px: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' }, opacity: entregue ? 0.6 : 1 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, minWidth: 50, fontFamily: 'monospace' }}>{item.CODPROD}</Typography>
                        <Typography sx={{ fontSize: 12, flex: 1 }}>{item.PRODUTO_DESCRICAO}</Typography>
                        <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>{item.QTDNEG} {item.UNIDADE ?? 'UN'}</Typography>
                        <Chip label={entregue ? 'Entregue' : item.NUMPEDIDO ? 'Pedido' : st.label} size="small"
                          sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: entregue ? '#22c55e15' : `${st.color}15`, color: entregue ? '#22c55e' : st.color, borderRadius: '4px' }} />
                        <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', minWidth: 70, textAlign: 'right' }}>{fmtCur(item.VLRTOT)}</Typography>
                      </Stack>
                    );
                  })}
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}

/* ─── Timeline Tab ─── */
function TimelineTab({ nuos }: { nuos: number }) {
  const { data, isLoading } = useOsTimeline(nuos);

  if (isLoading) return <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="text.disabled">Carregando...</Typography></Box>;
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.disabled" fontSize={13}>Nenhum registro de historico</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pl: 4 }}>
      {data.map((entry, idx) => {
        const isLast = idx === data.length - 1;
        const gigDef = STATUSGIG_MAP[entry.AD_STATUSGIG ?? ''];
        const color = entry.AD_FINALIZACAO ? '#22c55e' : gigDef ? '#3b82f6' : '#94a3b8';

        return (
          <Box key={entry.SEQUENCIA} sx={{ display: 'flex', gap: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', mt: 0.75, bgcolor: color, border: `2px solid ${color}40` }} />
              {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', mt: 0.5 }} />}
            </Box>
            <Box sx={{ flex: 1, pb: isLast ? 0 : 2, pl: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: 'text.secondary' }}>{fmtDate(entry.DHALTER)}</Typography>
                {entry.AD_STATUSGIG && (
                  <Chip label={gigDef?.label ?? entry.AD_STATUSGIG} size="small"
                    sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: `${color}15`, color }} />
                )}
                {entry.AD_FINALIZACAO && (
                  <Chip label={entry.AD_FINALIZACAO === 'LF' ? 'Finalizado' : entry.AD_FINALIZACAO === 'LT' ? 'Terceirizado' : entry.AD_FINALIZACAO}
                    size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: '#22c55e15', color: '#22c55e' }} />
                )}
              </Stack>
              {entry.NOME_USUARIO && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>{entry.NOME_USUARIO}</Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/* ─── Main Component ─── */
export function OsTablesRedesign({ os, initialTab = 0 }: OsTablesRedesignProps) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
      {initialTab === 0 && <ServicosGrid os={os} />}
      {initialTab === 1 && <ExecutoresGrid os={os} />}
      {initialTab === 2 && <ComprasTab nuos={os.NUOS} />}
      {initialTab === 3 && <TimelineTab nuos={os.NUOS} />}
    </Box>
  );
}
