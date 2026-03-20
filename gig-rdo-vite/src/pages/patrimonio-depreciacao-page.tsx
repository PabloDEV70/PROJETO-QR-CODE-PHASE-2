import { useMemo } from 'react';
import { Stack, Paper, Typography, Skeleton, Alert } from '@mui/material';
import { TrendingDown } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { PageLayout } from '@/components/layout/page-layout';
import { usePatrimonioDepreciacao } from '@/hooks/use-patrimonio-depreciacao';
import type { PatrimonioDepreciacaoConsolidada } from '@/types/patrimonio-types';

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

interface KpiDef {
  label: string;
  getValue: (rows: PatrimonioDepreciacaoConsolidada[]) => string;
  color: string;
}

const KPIS: KpiDef[] = [
  {
    label: 'Valor Total Aquisicao',
    getValue: (r) => fmtCurrency(r.reduce((s, i) => s + i.vlrAquisicaoTotal, 0)),
    color: '#1976d2',
  },
  {
    label: 'Depreciacao Total',
    getValue: (r) => fmtCurrency(r.reduce((s, i) => s + i.vlrDepreciacaoTotal, 0)),
    color: '#d32f2f',
  },
  {
    label: 'Saldo Total',
    getValue: (r) => fmtCurrency(r.reduce((s, i) => s + i.vlrSaldoTotal, 0)),
    color: '#2e7d32',
  },
  {
    label: '% Medio',
    getValue: (r) => {
      const totalAq = r.reduce((s, i) => s + i.vlrAquisicaoTotal, 0);
      const totalDep = r.reduce((s, i) => s + i.vlrDepreciacaoTotal, 0);
      return totalAq > 0 ? fmtPct((totalDep / totalAq) * 100) : '0%';
    },
    color: '#ed6c02',
  },
];

export function PatrimonioDepreciacaoPage() {
  const { data, isLoading } = usePatrimonioDepreciacao();

  const columns = useMemo<GridColDef<PatrimonioDepreciacaoConsolidada>[]>(
    () => [
      { field: 'categoria', headerName: 'Categoria', width: 180 },
      { field: 'quantidade', headerName: 'Qtd', width: 70, align: 'right', headerAlign: 'right' },
      {
        field: 'vlrAquisicaoTotal',
        headerName: 'Valor Aquisicao',
        width: 150,
        align: 'right',
        headerAlign: 'right',
        renderCell: (p) => fmtCurrency(p.value as number),
      },
      {
        field: 'vlrDepreciacaoTotal',
        headerName: 'Depreciacao',
        width: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: (p) => fmtCurrency(p.value as number),
      },
      {
        field: 'vlrSaldoTotal',
        headerName: 'Saldo',
        width: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: (p) => fmtCurrency(p.value as number),
      },
      {
        field: 'percentualMedio',
        headerName: '% Medio',
        width: 100,
        align: 'right',
        headerAlign: 'right',
        renderCell: (p) => fmtPct(p.value as number),
      },
      {
        field: 'completos',
        headerName: 'Completos',
        width: 100,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'parciais',
        headerName: 'Parciais',
        width: 90,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'semDepreciacao',
        headerName: 'Sem Deprec.',
        width: 110,
        align: 'right',
        headerAlign: 'right',
      },
    ],
    [],
  );

  return (
    <PageLayout title="Depreciacao" subtitle="Analise de depreciacao patrimonial" icon={TrendingDown}>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {KPIS.map((kpi) => (
            <Paper
              key={kpi.label}
              variant="outlined"
              sx={{ px: 2, py: 1.5, minWidth: 140, flex: '1 1 0', textAlign: 'center' }}
            >
              <Typography variant="caption" color="text.secondary">
                {kpi.label}
              </Typography>
              {isLoading ? (
                <Skeleton width={80} height={32} sx={{ mx: 'auto' }} />
              ) : (
                <Typography variant="h6" fontWeight={700} sx={{ color: kpi.color }}>
                  {data ? kpi.getValue(data) : '-'}
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>

        <Alert severity="warning" variant="outlined">
          O modulo de depreciacao automatica do Sankhya nao esta em operacao.
          Os valores exibidos podem ter sido inseridos manualmente.
        </Alert>

        <DataGrid
          rows={data ?? []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.categoria}
          density="compact"
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50]}
          initialState={{
            sorting: { sortModel: [{ field: 'vlrAquisicaoTotal', sort: 'desc' }] },
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={{
            border: 0,
            height: 500,
          }}
        />
      </Stack>
    </PageLayout>
  );
}
