import {
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import type { ColaboradorTimelineResponse } from '@/types/rdo-timeline-types';
import { formatMinutos, parseDateSafe } from '@/utils/gantt-utils';

interface HoraExtraAlertaProps {
  dias: ColaboradorTimelineResponse['dias'];
  resumoPeriodo: ColaboradorTimelineResponse['resumoPeriodo'];
}

export function HoraExtraAlerta({ dias, resumoPeriodo }: HoraExtraAlertaProps) {
  if (resumoPeriodo.totalHoraExtraMin <= 0) return null;

  const totalHE = formatMinutos(resumoPeriodo.totalHoraExtraMin);
  const diasComHE = resumoPeriodo.diasComHoraExtra;
  const mediaHE = diasComHE > 0
    ? formatMinutos(Math.round(resumoPeriodo.totalHoraExtraMin / diasComHE))
    : '0min';

  const diasHoraExtra = dias.filter((dia) => dia.meta.horaExtraMin > 0);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderTop: '3px solid #ed6c02',
        p: 2,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Warning sx={{ color: '#ed6c02' }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Hora Extra no Periodo
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label={`Total: ${totalHE}`}
            size="small"
            sx={{ bgcolor: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02', fontWeight: 600 }}
          />
          <Chip
            label={`${diasComHE} dia${diasComHE !== 1 ? 's' : ''} com HE`}
            size="small"
            sx={{ bgcolor: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02' }}
          />
          <Chip
            label={`Media diaria: ${mediaHE}`}
            size="small"
            sx={{ bgcolor: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02' }}
          />
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell align="right">Produtivo</TableCell>
                <TableCell align="right">Carga Prevista</TableCell>
                <TableCell align="right">Gap</TableCell>
                <TableCell align="right">Excedente</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diasHoraExtra.map((dia) => {
                const date = parseDateSafe(dia.data);
                const dataFormatada = date.toLocaleDateString('pt-BR');
                return (
                  <TableRow key={dia.data}>
                    <TableCell>
                      {dataFormatada} ({dia.diaSemanaLabel})
                    </TableCell>
                    <TableCell align="right">
                      {formatMinutos(dia.resumo.minutosProdu)}
                    </TableCell>
                    <TableCell align="right">
                      {formatMinutos(dia.meta.cargaHorariaPrevistaMin)}
                    </TableCell>
                    <TableCell align="right">
                      {formatMinutos(dia.meta.gapNaoProdutivoMin)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatMinutos(dia.meta.horaExtraMin)}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(237, 108, 2, 0.12)',
                          color: '#ed6c02',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  );
}
