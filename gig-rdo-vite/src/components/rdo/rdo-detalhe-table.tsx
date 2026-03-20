import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Typography,
} from '@mui/material';
import type { RdoDetalheCompleto } from '@/types/rdo-types';
import { MotivoChip } from '@/components/shared/motivo-icon';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

interface RdoDetalheTableProps {
  detalhes: RdoDetalheCompleto[];
  isLoading: boolean;
  onOsClick?: (nuos: number) => void;
}

function DuracaoChip({ minutos }: { minutos: number | null }) {
  if (minutos == null) return <Typography variant="body2">-</Typography>;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const label = h > 0 ? `${h}h${m > 0 ? `${m}m` : ''}` : `${m}m`;
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{ fontSize: '0.75rem', fontWeight: 600 }}
    />
  );
}

const headCellSx = { fontWeight: 600 } as const;

export function RdoDetalheTable({ detalhes, isLoading, onOsClick }: RdoDetalheTableProps) {
  if (isLoading) return <LoadingSkeleton rows={5} height={40} />;

  if (detalhes.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Nenhum detalhe encontrado</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={headCellSx}>#</TableCell>
            <TableCell sx={headCellSx}>Inicio</TableCell>
            <TableCell sx={headCellSx}>Fim</TableCell>
            <TableCell sx={headCellSx}>Duracao</TableCell>
            <TableCell sx={headCellSx}>Motivo</TableCell>
            <TableCell sx={headCellSx}>OS</TableCell>
            <TableCell sx={headCellSx}>Veiculo</TableCell>
            <TableCell sx={headCellSx}>Obs</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detalhes.map((d) => (
            <TableRow key={d.ITEM} hover>
              <TableCell>{d.ITEM}</TableCell>
              <TableCell>{d.hriniFormatada || '-'}</TableCell>
              <TableCell>{d.hrfimFormatada || '-'}</TableCell>
              <TableCell>
                <DuracaoChip minutos={d.duracaoMinutos} />
              </TableCell>
              <TableCell>
                {d.RDOMOTIVOCOD ? (
                  <MotivoChip cod={d.RDOMOTIVOCOD} sigla={d.motivoSigla ?? undefined} />
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {d.NUOS ? (
                  <Chip
                    label={String(d.NUOS)}
                    size="small"
                    color="info"
                    variant="outlined"
                    onClick={onOsClick ? () => onOsClick(d.NUOS!) : undefined}
                    sx={onOsClick ? { cursor: 'pointer' } : undefined}
                  />
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{d.veiculoPlaca?.trim() || '-'}</TableCell>
              <TableCell sx={{ maxWidth: 200 }}>
                <Typography variant="body2" noWrap title={d.OBS || ''}>
                  {d.OBS || '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
