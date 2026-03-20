import { Typography, Avatar, Link as MuiLink, Chip, Stack } from '@mui/material';
import {
  type GridColDef,
  type GridRenderCellParams,
  type GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import { Assignment, DirectionsCar } from '@mui/icons-material';
import type { NavigateFunction } from 'react-router-dom';
import type { RdoDetalhePeriodo } from '@/types/rdo-types';
import { getFuncionarioFotoUrl } from '@/api/funcionarios';

type Cell = GridRenderCellParams<RdoDetalhePeriodo>;
const Dash = <Typography variant="body2" color="text.disabled">-</Typography>;

function fmtDate(d: string | null): string {
  if (!d) return '-';
  const iso = d.length > 10 ? d.slice(0, 10) : d;
  const [y, m, day] = iso.split('-');
  return `${day}/${m}/${y}`;
}

function VeiculoCell({ placa, modelo }: { placa?: string | null; modelo?: string | null }) {
  const p = placa?.trim();
  if (!p) return <Typography variant="body2" color="text.disabled">-</Typography>;
  const m = modelo?.trim();
  return (
    <Stack direction="row" spacing={0.5} alignItems="center"
      sx={{ overflow: 'hidden', width: '100%' }}>
      <DirectionsCar sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
      <Typography variant="body2" fontSize={12} noWrap>
        <Typography component="span" fontFamily="monospace" fontWeight={600}
          fontSize={12}>{p}</Typography>
        {m && (
          <Typography component="span" color="text.secondary"
            fontSize={11} sx={{ ml: 0.5 }}>{m}</Typography>
        )}
      </Typography>
    </Stack>
  );
}

export function getDetalhesColumnVisibility(
  isMobile: boolean, isTablet: boolean,
): GridColumnVisibilityModel {
  if (isMobile) {
    return {
      CODRDO: false, DTREF: false, nomeparc: true, hriniFormatada: false,
      hrfimFormatada: false, duracaoMinutos: true, motivoSigla: true,
      NUOS: true, veiculoPlaca: false, OBS: false,
    };
  }
  if (isTablet) {
    return { veiculoPlaca: false, OBS: false };
  }
  return {};
}

export function buildDetalhesColumns(
  navigate: NavigateFunction,
): GridColDef<RdoDetalhePeriodo>[] {
  return [
    {
      field: 'CODRDO', headerName: 'RDO', width: 70,
      renderCell: (p: Cell) => (
        <MuiLink component="button" variant="body2" fontWeight={600} underline="hover"
          onClick={(e) => { e.stopPropagation(); navigate(`/manutencao/rdo/${p.value}`); }}>
          {p.value}
        </MuiLink>
      ),
    },
    {
      field: 'DTREF', headerName: 'Data', width: 100,
      renderCell: (p: Cell) => (
        <Typography variant="body2">{fmtDate(p.value)}</Typography>
      ),
    },
    {
      field: 'nomeparc', headerName: 'Colaborador', width: 200,
      renderCell: (p: Cell) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
          <Avatar src={p.row.CODPARC ? getFuncionarioFotoUrl(p.row.CODPARC) : undefined}
            sx={{ width: 24, height: 24, fontSize: 11, bgcolor: 'primary.main' }}>
            {p.row.nomeparc?.charAt(0) || '?'}
          </Avatar>
          <Typography variant="body2" noWrap sx={{
            fontWeight: 500,
            cursor: p.row.CODPARC ? 'pointer' : 'default',
            '&:hover': p.row.CODPARC
              ? { textDecoration: 'underline', color: 'primary.main' } : {},
          }}
            onClick={(e) => {
              if (p.row.CODPARC) {
                e.stopPropagation();
                navigate(`/manutencao/colaborador/${p.row.CODPARC}/rdo-analytics`);
              }
            }}>
            {p.row.CODPARC && (
              <Typography component="span" variant="caption" color="text.secondary"
                sx={{ mr: 0.5 }}>{p.row.CODPARC}</Typography>
            )}
            {p.row.nomeparc || '-'}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'hriniFormatada', headerName: 'Inicio', width: 60,
      align: 'center', headerAlign: 'center',
      renderCell: (p: Cell) => (
        <Typography variant="body2" fontFamily="monospace" fontSize={13}>
          {p.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'hrfimFormatada', headerName: 'Fim', width: 60,
      align: 'center', headerAlign: 'center',
      renderCell: (p: Cell) => (
        <Typography variant="body2" fontFamily="monospace" fontSize={13}>
          {p.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'duracaoMinutos', headerName: 'Min', width: 55, type: 'number',
      align: 'center', headerAlign: 'center',
      renderCell: (p: Cell) => (
        <Typography variant="body2" fontWeight={600} fontSize={13}>
          {p.value ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'motivoSigla', headerName: 'Motivo', width: 140,
      renderCell: (p: Cell) => {
        if (!p.value) return Dash;
        return <Chip label={p.value} size="small"
          sx={{ fontSize: 11, height: 22, maxWidth: 130 }} />;
      },
    },
    {
      field: 'NUOS', headerName: 'OS', width: 75,
      renderCell: (p: Cell) => {
        if (!p.value) return Dash;
        return (
          <MuiLink component="button" variant="body2" underline="hover"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/manutencao/ordens-de-servico/${p.value}`);
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Assignment sx={{ fontSize: 14 }} />{p.value}
          </MuiLink>
        );
      },
    },
    {
      field: 'veiculoPlaca', headerName: 'Veiculo', width: 200, minWidth: 160,
      renderCell: (p: Cell) => (
        <VeiculoCell placa={p.value as string} modelo={p.row.veiculoModelo} />
      ),
    },
    {
      field: 'OBS', headerName: 'Obs', flex: 1, minWidth: 120,
      renderCell: (p: Cell) => (
        <Typography variant="body2" noWrap color={p.value ? 'text.primary' : 'text.disabled'}>
          {p.value || '-'}
        </Typography>
      ),
    },
  ];
}
