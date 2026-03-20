import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { BuildRounded, EngineeringRounded } from '@mui/icons-material';
import type { OsDetailEnriched, OsDetailServico, OsDetailExecutor } from '@/types/os-types';

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

const svcCols: GridColDef<OsDetailServico>[] = [
  { field: 'SEQUENCIA', headerName: '#', width: 44 },
  {
    field: 'nomeProduto', headerName: 'Servico', flex: 1, minWidth: 180,
    renderCell: ({ row }) => (
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
          {row.nomeProduto ?? `Cod. ${row.CODPROD}`}
        </Typography>
        {row.OBSERVACAO && (
          <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1.2, fontStyle: 'italic' }}>
            {row.OBSERVACAO}
          </Typography>
        )}
      </Box>
    ),
  },
  {
    field: 'STATUS', headerName: 'Status', width: 85,
    renderCell: ({ value }) => {
      const d = SVC_STATUS[value as string];
      return d ? (
        <Chip label={d.label} size="small" sx={{
          height: 20, fontSize: 10, fontWeight: 700,
          bgcolor: `${d.color}18`, color: d.color, borderRadius: '4px',
        }} />
      ) : <Typography sx={{ fontSize: 11 }}>{(value as string) ?? '-'}</Typography>;
    },
  },
  { field: 'QTD', headerName: 'Qtd', width: 55, type: 'number' },
  {
    field: 'VLRUNIT', headerName: 'Unit.', width: 85, align: 'right', headerAlign: 'right',
    renderCell: ({ value }) => <Typography sx={{ fontSize: 12 }}>{fmtCur(value as number)}</Typography>,
  },
  {
    field: 'VLRTOT', headerName: 'Total', width: 95, align: 'right', headerAlign: 'right',
    renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{fmtCur(value as number)}</Typography>,
  },
  {
    field: 'TEMPO', headerName: 'Tempo', width: 70,
    renderCell: ({ value }) => <Typography sx={{ fontSize: 12 }}>{fmtMin(value as number)}</Typography>,
  },
  {
    field: 'DATAINI', headerName: 'Inicio', width: 125,
    renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value as string)}</Typography>,
  },
  {
    field: 'DATAFIN', headerName: 'Fim', width: 125,
    renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value as string)}</Typography>,
  },
];

const execCols: GridColDef<OsDetailExecutor>[] = [
  { field: 'SEQUENCIA', headerName: 'Serv.', width: 55 },
  {
    field: 'nomeUsuario', headerName: 'Executor', flex: 1, minWidth: 160,
    renderCell: ({ row }) => (
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{row.nomeUsuario ?? '-'}</Typography>
        {row.nomeColaborador && row.nomeColaborador !== row.nomeUsuario && (
          <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1.2 }}>{row.nomeColaborador}</Typography>
        )}
      </Box>
    ),
  },
  {
    field: 'dtIni', headerName: 'Inicio', width: 130,
    renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value as string)}</Typography>,
  },
  {
    field: 'dtFin', headerName: 'Fim', width: 130,
    renderCell: ({ value }) => <Typography sx={{ fontSize: 11 }}>{fmtDate(value as string)}</Typography>,
  },
  {
    field: 'minutos', headerName: 'Duracao', width: 80,
    renderCell: ({ value }) => <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{fmtMin(value as number)}</Typography>,
  },
  {
    field: 'obs', headerName: 'Observacao', flex: 1, minWidth: 180,
    renderCell: ({ value }) => (
      <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'normal', lineHeight: 1.3 }}>
        {(value as string) ?? '-'}
      </Typography>
    ),
  },
];

const gridSx = {
  border: '1px solid', borderColor: 'divider', borderRadius: '4px',
  '& .MuiDataGrid-cell': {
    fontSize: 12, borderColor: 'divider', display: 'flex', alignItems: 'center',
    '&:focus, &:focus-within': { outline: 'none' },
  },
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: (t: any) => t.palette.mode === 'dark' ? 'rgba(46,125,50,0.12)' : 'rgba(46,125,50,0.05)',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'text.secondary',
  },
  '& .MuiDataGrid-row:nth-of-type(even)': {
    bgcolor: (t: any) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
  },
  '& .MuiDataGrid-footerContainer': { display: 'none' },
};

function TabLabel({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ textTransform: 'none' }}>
      {icon}
      <span>{label}</span>
      <Chip label={count} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, borderRadius: '4px' }} />
    </Stack>
  );
}

import { Stack } from '@mui/material';

export function OsDetailTables({ os }: { os: OsDetailEnriched }) {
  const [tab, setTab] = useState(0);
  const hasExec = os.executores.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          minHeight: 42, px: 2,
          borderBottom: '1px solid', borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 42, py: 0, fontSize: 13 },
        }}
      >
        <Tab label={<TabLabel icon={<BuildRounded sx={{ fontSize: 16 }} />} label="Servicos" count={os.servicos.length} />} />
        {hasExec && (
          <Tab label={<TabLabel icon={<EngineeringRounded sx={{ fontSize: 16 }} />} label="Executores" count={os.executores.length} />} />
        )}
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {tab === 0 && (
          os.servicos.length > 0 ? (
            <DataGrid
              rows={os.servicos}
              columns={svcCols}
              getRowId={(r) => `${r.NUOS}-${r.SEQUENCIA}`}
              getRowHeight={() => 'auto'}
              disableRowSelectionOnClick
              hideFooter
              sx={gridSx}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'text.disabled' }}>
              <Typography sx={{ fontSize: 13 }}>Nenhum servico cadastrado</Typography>
            </Box>
          )
        )}

        {tab === 1 && hasExec && (
          <DataGrid
            rows={os.executores}
            columns={execCols}
            getRowId={(r) => `${r.NUOS}-${r.SEQUENCIA}-${r.codusu}-${r.dtIni}`}
            getRowHeight={() => 'auto'}
            disableRowSelectionOnClick
            hideFooter
            sx={gridSx}
          />
        )}
      </Box>
    </Box>
  );
}
