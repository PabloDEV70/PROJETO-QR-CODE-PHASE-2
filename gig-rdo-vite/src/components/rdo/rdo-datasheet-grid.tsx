import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  DataSheetGrid, textColumn, intColumn, keyColumn,
} from 'react-datasheet-grid';
import 'react-datasheet-grid/dist/style.css';
import type { RdoDetalheCompleto } from '@/types/rdo-types';

interface Row {
  item: number;
  inicio: string;
  fim: string;
  minutos: number | null;
  motivo: string;
  descricao: string;
  os: string;
  statusOs: string;
  placa: string;
  obs: string;
}

function toRows(detalhes: RdoDetalheCompleto[]): Row[] {
  return detalhes.map((d) => ({
    item: d.ITEM,
    inicio: d.hriniFormatada ?? '-',
    fim: d.hrfimFormatada ?? '-',
    minutos: d.duracaoMinutos,
    motivo: d.motivoSigla ?? '-',
    descricao: d.motivoDescricao ?? '-',
    os: d.NUOS ? String(d.NUOS) : '-',
    statusOs: d.osStatus ?? '-',
    placa: d.veiculoPlaca?.trim() ?? '-',
    obs: d.OBS ?? '-',
  }));
}

export function RdoDatasheetGrid({ detalhes }: {
  detalhes: RdoDetalheCompleto[];
}) {
  const data = useMemo(() => toRows(detalhes), [detalhes]);

  const columns = useMemo(() => [
    { ...keyColumn('item', intColumn), title: '#', minWidth: 50, maxWidth: 60 },
    { ...keyColumn('inicio', textColumn), title: 'Inicio', minWidth: 70 },
    { ...keyColumn('fim', textColumn), title: 'Fim', minWidth: 70 },
    { ...keyColumn('minutos', intColumn), title: 'Min', minWidth: 60 },
    { ...keyColumn('motivo', textColumn), title: 'Motivo', minWidth: 70 },
    { ...keyColumn('descricao', textColumn), title: 'Descricao', minWidth: 160 },
    { ...keyColumn('os', textColumn), title: 'OS', minWidth: 70 },
    { ...keyColumn('statusOs', textColumn), title: 'Status OS', minWidth: 90 },
    { ...keyColumn('placa', textColumn), title: 'Placa', minWidth: 90 },
    { ...keyColumn('obs', textColumn), title: 'Obs', minWidth: 160 },
  ], []);

  if (detalhes.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        react-datasheet-grid
      </Typography>
      <DataSheetGrid
        value={data}
        columns={columns}
        lockRows
        height={Math.min(detalhes.length * 34 + 40, 500)}
      />
    </Box>
  );
}
