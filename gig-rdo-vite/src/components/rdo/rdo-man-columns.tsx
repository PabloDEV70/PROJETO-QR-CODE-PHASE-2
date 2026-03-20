import { Typography, Link as MuiLink, Chip, Tooltip } from '@mui/material';
import {
  type GridColDef,
  type GridRenderCellParams,
  type GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import { Assignment } from '@mui/icons-material';
import type { NavigateFunction } from 'react-router-dom';
import type { RdoListItem } from '@/types/rdo-types';
const pctToChipColor = (pct: number): 'success' | 'warning' | 'error' => {
  if (pct >= 95) return 'success';
  if (pct >= 70) return 'warning';
  return 'error';
};
import { fmtMin } from '@/utils/wrench-time-categories';
import { AvatarCell, VeiculoCell } from '@/components/rdo/rdo-man-cells';
import { formatDateBR } from '@/utils/os-utils';

type Cell = GridRenderCellParams<RdoListItem>;
const mono = { fontFamily: 'monospace', fontSize: 13 } as const;
const centered = { align: 'center' as const, headerAlign: 'center' as const };

export function getRdoColumnVisibility(
  isMobile: boolean, isTablet: boolean,
): GridColumnVisibilityModel {
  if (isMobile) {
    return {
      CODRDO: false, DTREF: true, nomeparc: true, departamento: false,
      cargo: false, totalItens: false, primeiraHora: false, ultimaHora: false,
      totalHoras: true, horasJornadaEsperada: false, produtividadePercent: true,
      diagnostico: true, minutosNaoProdu: false, horaExtraMin: false,
      primeiroNuos: false, veiculoPlaca: false,
    };
  }
  if (isTablet) {
    return {
      departamento: false, cargo: false, primeiraHora: false, ultimaHora: false,
      horasJornadaEsperada: false, minutosNaoProdu: false, horaExtraMin: false,
      veiculoPlaca: false,
    };
  }
  return {};
}

interface ColumnOptions {
  onProdClick?: (row: RdoListItem) => void;
  onHexClick?: (row: RdoListItem) => void;
}

export function buildRdoColumns(
  navigate: NavigateFunction,
  opts: ColumnOptions = {},
): GridColDef<RdoListItem>[] {
  return [
    {
      field: 'CODRDO', headerName: 'RDO', width: 70, type: 'number',
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
        <Typography variant="body2">{formatDateBR(p.value)}</Typography>
      ),
    },
    {
      field: 'nomeparc', headerName: 'Colaborador', flex: 1, minWidth: 180,
      renderCell: (p: Cell) => <AvatarCell row={p.row} />,
    },
    { field: 'departamento', headerName: 'Depto', width: 130 },
    { field: 'cargo', headerName: 'Funcao', width: 180 },
    { field: 'totalItens', headerName: 'Itens', width: 55, type: 'number', ...centered },
    { field: 'primeiraHora', headerName: 'Ini', width: 55, ...centered },
    { field: 'ultimaHora', headerName: 'Fim', width: 55, ...centered },
    {
      field: 'totalHoras', headerName: 'Horas', width: 60, type: 'number', ...centered,
      renderCell: (p: Cell) => {
        const horas = p.value as number;
        const hje = p.row.horasJornadaEsperada;
        const color = !hje ? 'text.primary'
          : horas >= hje ? 'success.main'
            : horas >= hje * 0.9 ? 'warning.main' : 'error.main';
        return <Typography variant="body2" fontWeight={600} fontSize={13} color={color}>
          {typeof horas === 'number' ? horas.toFixed(1) : '-'}</Typography>;
      },
    },
    {
      field: 'horasJornadaEsperada', headerName: 'HJE', width: 50, type: 'number',
      ...centered, description: 'Horas Jornada Esperada',
      renderCell: (p: Cell) => {
        const hje = p.value as number;
        if (!hje) return <Typography variant="body2" color="text.disabled">-</Typography>;
        const h = Math.floor(hje);
        const m = Math.round((hje - h) * 60);
        return <Typography variant="body2" {...mono} color="text.secondary">
          {`${h}:${m.toString().padStart(2, '0')}`}</Typography>;
      },
    },
    {
      field: 'produtividadePercent', headerName: '%Prod', width: 70, type: 'number',
      ...centered, description: 'Produtividade vs Meta',
      renderCell: (p: Cell) => {
        const pct = p.value as number;
        if (pct == null || (pct === 0 && !p.row.minutosPrevistosDia)) {
          return <Typography variant="body2" color="text.disabled">-</Typography>;
        }
        const r = p.row;
        const metaMin = r.metaEfetivaMin || 0;
        const tip = `${fmtMin(r.minutosProdu || 0)} / ${fmtMin(metaMin)} meta${
          (r.minutosFumarPenalidade || 0) > 0 ? ` | Fumar: -${r.minutosFumarPenalidade}min` : ''
        }`;
        const variant = pct >= 85 ? 'filled' as const : 'outlined' as const;
        return (
          <Tooltip title={tip} arrow>
            <Chip size="small" label={`${pct}%`} color={pctToChipColor(pct)} variant={variant}
              onClick={opts.onProdClick
                ? (e) => { e.stopPropagation(); opts.onProdClick!(r); } : undefined}
              sx={{
                minWidth: 48, fontWeight: 600, fontSize: 12,
                cursor: opts.onProdClick ? 'pointer' : 'default',
              }} />
          </Tooltip>
        );
      },
    },
    {
      field: 'diagnostico', headerName: 'Status', width: 130,
      renderCell: (p: Cell) => {
        const d = p.value as string;
        if (!d) return <Typography variant="body2" color="text.disabled">-</Typography>;
        const faixaDiag = p.row.diagnosticoFaixa?.faixa;
        return (
          <Chip size="small" label={d}
            color={(faixaDiag?.color as 'success' | 'warning' | 'error') ?? 'error'} variant="outlined"
            sx={{ fontWeight: 600, fontSize: 11, maxWidth: '100%' }} />
        );
      },
    },
    {
      field: 'minutosNaoProdu', headerName: 'HST', width: 65, type: 'number',
      ...centered, description: 'Horas Sem Trabalho (tempo parado)',
      valueGetter: (_v: unknown, row: RdoListItem) => {
        const gap = (row.minutosContabilizados || 0) - (row.minutosProdu || 0);
        return gap > 0 ? gap : 0;
      },
      renderCell: (p: Cell) => {
        const hst = p.value as number;
        if (!hst || !p.row.minutosPrevistosDia)
          return <Typography variant="body2" color="text.disabled">-</Typography>;
        const pctP = p.row.minutosContabilizados
          ? Math.round((hst / p.row.minutosContabilizados) * 100) : 0;
        return <Tooltip title={`${fmtMin(hst)} parado (${pctP}%)`} arrow>
          <Typography variant="body2" {...mono}
            color={hst > 30 ? 'error.main' : hst > 15 ? 'warning.main' : 'text.secondary'}>
            {fmtMin(hst)}</Typography></Tooltip>;
      },
    },
    {
      field: 'horaExtraMin', headerName: 'HEX', width: 65, type: 'number',
      ...centered, description: 'Hora Extra',
      renderCell: (p: Cell) => {
        const hex = p.value as number;
        if (!hex || !p.row.minutosPrevistosDia)
          return <Typography variant="body2" color="text.disabled">-</Typography>;
        return <Tooltip title={`HEX: ${fmtMin(hex)}`} arrow>
          <Chip size="small" label={fmtMin(hex)} color="warning" variant="outlined"
            onClick={opts.onHexClick
              ? (e) => { e.stopPropagation(); opts.onHexClick!(p.row); } : undefined}
            sx={{
              minWidth: 48, fontWeight: 600, fontSize: 12,
              cursor: opts.onHexClick ? 'pointer' : 'default',
            }} />
        </Tooltip>;
      },
    },
    {
      field: 'primeiroNuos', headerName: 'OS', width: 75,
      renderCell: (p: Cell) => {
        if (!p.value)
          return <Typography variant="body2" color="text.disabled">-</Typography>;
        return <MuiLink component="button" variant="body2" underline="hover"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/manutencao/ordens-de-servico/${p.value}`);
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Assignment sx={{ fontSize: 14 }} />{p.value}</MuiLink>;
      },
    },
    {
      field: 'veiculoPlaca', headerName: 'Veiculo', width: 200, minWidth: 160,
      renderCell: (p: Cell) => (
        <VeiculoCell placa={p.value as string} modelo={p.row.veiculoModelo} />
      ),
    },
  ];
}
