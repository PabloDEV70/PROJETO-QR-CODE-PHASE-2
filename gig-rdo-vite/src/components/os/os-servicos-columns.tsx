import { Chip, Link, Stack, Tooltip, Typography } from '@mui/material';
import { WarningAmber, DescriptionOutlined } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import type { OsColabServico } from '@/types/os-list-types';

const LIMITE_JORNADA_MIN = 720;

function fmtDate(val: string | null) {
  if (!val) return '-';
  try { return format(parseISO(val), 'dd/MM/yy'); } catch { return val; }
}

function fmtDateTime(val: string | null) {
  if (!val) return '-';
  try { return format(parseISO(val), 'dd/MM HH:mm'); } catch { return val; }
}

function fmtTempo(min: number) {
  if (min <= 0) return '0';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return `${h}h${m > 0 ? `${m}` : ''}`;
}

function statusColor(s: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
  return { F: 'success', E: 'info', A: 'warning', C: 'error', R: 'error' }[s] as
    'success' | 'info' | 'warning' | 'error' ?? 'default';
}

function tipoColor(t: string | null): 'primary' | 'secondary' | 'default' {
  return t === 'I' ? 'primary' : t === 'E' ? 'secondary' : 'default';
}

export function buildServicosColumns(): GridColDef<OsColabServico>[] {
  return [
    {
      field: 'NUOS', headerName: 'OS', width: 68, type: 'number',
      description: 'Numero da Ordem de Servico',
      renderCell: ({ row }) => (
        <Typography variant="caption" fontWeight={700}>
          {row.NUOS}
          <Typography component="span" variant="caption" color="text.secondary">
            /{row.sequencia}
          </Typography>
        </Typography>
      ),
    },
    {
      field: 'DTABERTURA', headerName: 'Abertura', width: 82,
      description: 'Data de abertura da OS',
      valueGetter: (_v, row) => {
        if (!row.DTABERTURA) return null;
        const d = new Date(row.DTABERTURA);
        return isNaN(d.getTime()) ? null : d;
      },
      valueFormatter: (v: Date | null) => {
        if (!v || isNaN(v.getTime())) return '-';
        return fmtDate(v.toISOString());
      },
    },
    {
      field: 'nomeServico', headerName: 'Servico', flex: 1, minWidth: 160,
      description: 'Nome do servico executado',
      renderCell: ({ value }) => (
        <Tooltip title={value ?? '-'} enterDelay={500}>
          <Typography variant="caption" noWrap>{value?.trim() ?? '-'}</Typography>
        </Tooltip>
      ),
    },
    {
      field: 'placa', headerName: 'Veiculo', width: 145,
      description: 'Placa e modelo do veiculo',
      renderCell: ({ row }) => (
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="caption" fontWeight={600} noWrap>
            {row.placa?.trim() ?? '-'}
          </Typography>
          {row.marcaModelo?.trim() && (
            <Typography variant="caption" color="text.secondary" noWrap
              sx={{ fontSize: '0.62rem', lineHeight: 1.1 }}>
              {row.marcaModelo.trim()}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'TIPO', headerName: 'Tipo', width: 85,
      description: 'Interna ou Externa',
      renderCell: ({ row }) => row.tipoLabel ? (
        <Chip label={row.tipoLabel} size="small" variant="outlined"
          color={tipoColor(row.TIPO)}
          sx={{ height: 20, fontSize: '0.65rem' }} />
      ) : '-',
    },
    {
      field: 'MANUTENCAO', headerName: 'Manutencao', width: 115,
      description: 'Tipo de manutencao (Corretiva, Preventiva, etc.)',
      renderCell: ({ row }) => (
        <Typography variant="caption" noWrap sx={{ fontSize: '0.72rem' }}>
          {row.manutencaoLabel ?? row.MANUTENCAO ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'localManutencao', headerName: 'Local', width: 75,
      description: 'Local da manutencao (Interno, Externo, Campo)',
      renderCell: ({ row }) => (
        <Typography variant="caption" noWrap sx={{ fontSize: '0.72rem' }}>
          {row.localManutencaoLabel ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'dtInicio', headerName: 'Inicio', width: 95,
      description: 'Data/hora de inicio da execucao',
      valueGetter: (_v, row) => {
        if (!row.dtInicio) return null;
        const d = new Date(row.dtInicio);
        return isNaN(d.getTime()) ? null : d;
      },
      valueFormatter: (v: Date | null) => {
        if (!v || isNaN(v.getTime())) return '-';
        return fmtDateTime(v.toISOString());
      },
    },
    {
      field: 'dtFim', headerName: 'Fim', width: 95,
      description: 'Data/hora do fim da execucao',
      valueGetter: (_v, row) => {
        if (!row.dtFim) return null;
        const d = new Date(row.dtFim);
        return isNaN(d.getTime()) ? null : d;
      },
      valueFormatter: (v: Date | null) => {
        if (!v || isNaN(v.getTime())) return '-';
        return fmtDateTime(v.toISOString());
      },
    },
    {
      field: 'tempoGastoMin', headerName: 'Tempo', width: 80,
      type: 'number', align: 'right', headerAlign: 'right',
      description: 'Tempo gasto em minutos (>12h = anomalia)',
      renderCell: ({ row }) => {
        const min = row.tempoGastoMin ?? 0;
        const anomalo = min > LIMITE_JORNADA_MIN;
        if (anomalo) {
          return (
            <Tooltip title={`${min} min — provavel erro de apontamento`}>
              <Stack direction="row" spacing={0.3} alignItems="center">
                <WarningAmber sx={{ fontSize: 13, color: 'warning.main' }} />
                <Typography variant="caption" fontWeight={700} color="warning.main">
                  {fmtTempo(min)}
                </Typography>
              </Stack>
            </Tooltip>
          );
        }
        return (
          <Typography variant="caption" fontWeight={600}>
            {fmtTempo(min)}
          </Typography>
        );
      },
    },
    {
      field: 'STATUS', headerName: 'Status', width: 100,
      description: 'Status da OS',
      renderCell: ({ row }) => (
        <Chip label={row.statusLabel} size="small" variant="outlined"
          color={statusColor(row.STATUS)}
          sx={{ height: 20, fontSize: '0.65rem' }} />
      ),
    },
    {
      field: 'codrdoVinculado', headerName: 'RDO', width: 72,
      type: 'number', align: 'center', headerAlign: 'center',
      description: 'RDO vinculado a esta OS (clique para ver detalhes)',
      renderCell: ({ row }) => {
        if (!row.codrdoVinculado) return (
          <Typography variant="caption" color="text.disabled">-</Typography>
        );
        return (
          <Tooltip title={`Ver RDO ${row.codrdoVinculado}`} arrow>
            <Link
              component={RouterLink}
              to={`/manutencao/rdo/${row.codrdoVinculado}`}
              underline="hover"
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.3,
                fontSize: '0.75rem', fontWeight: 600,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <DescriptionOutlined sx={{ fontSize: 13 }} />
              {row.codrdoVinculado}
            </Link>
          </Tooltip>
        );
      },
    },
  ];
}
