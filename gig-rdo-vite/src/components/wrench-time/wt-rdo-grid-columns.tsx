import { Box, Chip, Link, Stack, Tooltip, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { fmtMin } from '@/utils/wrench-time-categories';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { RdoListItem } from '@/types/rdo-types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function fmtDateFull(dtref: string | null): string {
  if (!dtref) return '-';
  const d = new Date(dtref.split('T')[0] + 'T12:00:00');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${WEEKDAYS[d.getDay()]} ${dd}/${mm}/${yyyy}`;
}

function pctColor(pct: number): string {
  if (pct >= 95) return '#2e7d32';
  if (pct >= 70) return '#ed6c02';
  return '#d32f2f';
}

function saldoLabel(min: number): string {
  if (min === 0) return '0';
  const sign = min > 0 ? '+' : '';
  return `${sign}${fmtMin(Math.abs(min))}`;
}

export function buildColumns(nav: (path: string) => void): GridColDef<RdoListItem>[] {
  return [
    {
      field: 'CODRDO', headerName: 'RDO', width: 64, type: 'number',
      renderCell: ({ row }) => (
        <Link component="button" underline="hover" fontWeight="bold"
          sx={{ cursor: 'pointer' }} onClick={() => nav(`/rdo/${row.CODRDO}`)}>
          {row.CODRDO}
        </Link>
      ),
    },
    {
      field: 'DTREF', headerName: 'Data', width: 130,
      valueGetter: (_v, row) => fmtDateFull(row.DTREF),
    },
    {
      field: 'nomeparc', headerName: 'Colaborador', flex: 1, minWidth: 160,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
          <FuncionarioAvatar codparc={row.CODPARC} nome={row.nomeparc ?? undefined} size="small" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" fontWeight={600} noWrap display="block">
              {row.nomeparc ?? '-'}
            </Typography>
            {(row.departamento || row.cargo) && (
              <Typography variant="caption" color="text.secondary" noWrap display="block"
                sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                {[row.departamento, row.cargo].filter(Boolean).join(' · ')}
              </Typography>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      field: 'minutosPrevistosDia', headerName: 'Jornada', width: 70,
      align: 'right', headerAlign: 'right',
      description: 'Jornada prevista para o dia',
      valueFormatter: (v: number) => v ? fmtMin(v) : '-',
    },
    {
      field: 'totalMinutos', headerName: 'Trabalhado', width: 80,
      align: 'right', headerAlign: 'right',
      description: 'Total de minutos trabalhados no dia',
      valueFormatter: (v: number) => v ? fmtMin(v) : '-',
    },
    {
      field: 'minutosProdu', headerName: 'Produtivo', width: 80,
      align: 'right', headerAlign: 'right',
      description: 'Minutos em atividades produtivas (wrench time)',
      renderCell: ({ value }) => (
        <Typography variant="caption" fontWeight={600} sx={{ color: '#16A34A' }}>
          {fmtMin(value as number)}
        </Typography>
      ),
    },
    {
      field: 'minutosNaoProdu', headerName: 'Improdut.', width: 80,
      align: 'right', headerAlign: 'right',
      description: 'Minutos em atividades nao produtivas',
      renderCell: ({ value }) => (
        <Typography variant="caption" fontWeight={600} sx={{ color: '#94A3B8' }}>
          {fmtMin(value as number)}
        </Typography>
      ),
    },
    {
      field: 'horaExtraMin', headerName: 'H.Extra', width: 80,
      align: 'right', headerAlign: 'right',
      description: 'Minutos de hora extra (acima da jornada prevista)',
      renderCell: ({ value }) => {
        const v = value as number;
        if (!v) return <Typography variant="caption" color="text.disabled">-</Typography>;
        return (
          <Chip label={`+${fmtMin(v)}`} size="small" sx={{
            height: 20, fontSize: '0.68rem', fontWeight: 700,
            bgcolor: '#2563EB14', color: '#2563EB', border: '1px solid #2563EB30',
          }} />
        );
      },
    },
    {
      field: 'saldoJornadaMin', headerName: 'Saldo', width: 70,
      align: 'right', headerAlign: 'right',
      description: 'Saldo da jornada (tempo no trabalho - jornada prevista)',
      renderCell: ({ value }) => {
        const v = value as number;
        const color = v > 0 ? '#2563EB' : v < 0 ? '#d32f2f' : 'text.secondary';
        return (
          <Typography variant="caption" fontWeight={600} sx={{ color }}>
            {saldoLabel(v)}
          </Typography>
        );
      },
    },
    {
      field: 'produtividadePercent', headerName: 'Prod%', width: 60, type: 'number',
      align: 'right', headerAlign: 'right',
      renderCell: ({ row }) => {
        const pct = row.produtividadePercent;
        if (pct == null) return '-';
        return (
          <Tooltip arrow title={`Meta: ${fmtMin(row.metaEfetivaMin)} | Produtivo: ${fmtMin(row.minutosProdu)}`}>
            <Typography variant="caption" fontWeight={700}
              sx={{ color: pctColor(pct), fontFamily: 'monospace' }}>
              {pct.toFixed(0)}%
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'diagnostico', headerName: 'Status', width: 120,
      renderCell: ({ row }) => {
        const diag = row.diagnostico;
        if (!diag) return '-';
        const f = row.diagnosticoFaixa?.faixa;
        const pct = row.produtividadePercent;
        const lines = [
          `Produtividade: ${pct.toFixed(0)}%`,
          `Produtivo: ${fmtMin(row.minutosProdu)} de ${fmtMin(row.metaEfetivaMin)} (meta)`,
          `Jornada prevista: ${fmtMin(row.minutosPrevistosDia)}`,
          `Trabalhado: ${fmtMin(row.totalMinutos)}`,
          row.horaExtraMin > 0 ? `Hora extra: +${fmtMin(row.horaExtraMin)}` : null,
          row.saldoJornadaMin !== 0
            ? `Saldo: ${row.saldoJornadaMin > 0 ? '+' : ''}${fmtMin(Math.abs(row.saldoJornadaMin))}`
            : null,
          '',
          pct >= 105 ? 'Superou a meta do dia (>=105%)'
            : pct >= 95 ? 'Atingiu a meta do dia (>=95%)'
            : pct >= 85 ? 'Proximo da meta (>=85%)'
            : pct >= 70 ? 'Abaixo da meta (>=70%)'
            : 'Muito abaixo da meta (<70%)',
        ].filter(Boolean);
        return (
          <Tooltip arrow title={
            <span style={{ whiteSpace: 'pre-line' }}>
              {lines.join('\n')}
            </span>
          }>
            <Chip label={diag} size="small" color={(f?.color as 'success' | 'warning' | 'error') ?? 'error'} variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem', cursor: 'help' }} />
          </Tooltip>
        );
      },
    },
  ];
}
