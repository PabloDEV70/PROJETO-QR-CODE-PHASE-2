import { useState } from 'react';
import {
  Alert, Box, Chip, Collapse, IconButton, Paper, Stack,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { ExpandMore, ExpandLess, Help } from '@mui/icons-material';
import type { RdoAnomalia } from '@/types/rdo-analytics-types';
import { format, parseISO } from 'date-fns';

interface AnomaliaInfo {
  label: string;
  color: 'error' | 'warning';
  explicacao: string;
}

const ANOMALIA_MAP: Record<string, AnomaliaInfo> = {
  HRINI_INVALIDO: {
    label: 'Inicio de madrugada', color: 'warning',
    explicacao: 'O apontamento comeca antes das 04:00. '
      + 'Se o colaborador realmente trabalhou nesse horario, pode ignorar.',
  },
  HRFIM_INVALIDO: {
    label: 'Hora fim invalida', color: 'error',
    explicacao: 'O horario de fim do apontamento esta apos 24:00. '
      + 'Provavelmente erro de digitacao no RDO.',
  },
  DURACAO_ZERO: {
    label: 'Duracao zero', color: 'warning',
    explicacao: 'Inicio e fim sao iguais — o apontamento tem 0 minutos. '
      + 'Provavelmente esqueceram de preencher o horario de fim.',
  },
  DURACAO_NEGATIVA: {
    label: 'Fim antes do inicio', color: 'error',
    explicacao: 'O horario de fim e anterior ao de inicio. '
      + 'Provavelmente os horarios foram invertidos. O apontamento foi ignorado nos calculos.',
  },
  DURACAO_EXCESSIVA: {
    label: 'Duracao acima de 10h', color: 'error',
    explicacao: 'Um unico apontamento com mais de 10 horas e incomum. '
      + 'Verifique se os horarios estao corretos.',
  },
  MOTIVO_NULO: {
    label: 'Sem motivo RDO', color: 'warning',
    explicacao: 'Apontamento sem motivo/atividade vinculada. '
      + 'Esse tempo nao sera classificado em nenhuma categoria de perda ou produtividade.',
  },
};

const FALLBACK: AnomaliaInfo = {
  label: 'Problema desconhecido', color: 'warning',
  explicacao: 'Anomalia nao catalogada. Verifique os dados do apontamento.',
};

function formatHr(v: number | null): string {
  if (v == null) return '-';
  const h = Math.floor(v / 100);
  const m = v % 100;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getInfo(a: RdoAnomalia): AnomaliaInfo {
  const tipo = a.tipoAnomalia === 'DURACAO_NEGATIVA'
    && a.HRINI != null && a.HRFIM != null && a.HRFIM === a.HRINI
    ? 'DURACAO_ZERO' : a.tipoAnomalia;
  return ANOMALIA_MAP[tipo] ?? FALLBACK;
}

interface WtAnomaliasAlertProps {
  anomalias: RdoAnomalia[];
}

export function WtAnomaliasAlert({ anomalias }: WtAnomaliasAlertProps) {
  const [open, setOpen] = useState(false);
  if (!anomalias.length) return null;

  const erros = anomalias.filter((a) => getInfo(a).color === 'error').length;
  const avisos = anomalias.length - erros;

  return (
    <Box>
      <Alert
        severity={erros > 0 ? 'error' : 'warning'}
        action={
          <IconButton size="small" onClick={() => setOpen((o) => !o)}>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" fontWeight={600}>
              {anomalias.length} apontamento{anomalias.length > 1 ? 's' : ''} com
              problemas no periodo
            </Typography>
            {erros > 0 && <Chip label={`${erros} erro${erros > 1 ? 's' : ''}`}
              color="error" size="small" />}
            {avisos > 0 && <Chip label={`${avisos} aviso${avisos > 1 ? 's' : ''}`}
              color="warning" size="small" />}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Esses registros podem distorcer os calculos de produtividade.
            Clique para expandir e verificar cada um.
          </Typography>
        </Stack>
      </Alert>

      <Collapse in={open}>
        <Paper variant="outlined" sx={{ mt: -0.5, borderTop: 0, borderRadius: '0 0 4px 4px' }}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>RDO</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Colaborador</TableCell>
                  <TableCell>Horario</TableCell>
                  <TableCell>Atividade</TableCell>
                  <TableCell>Problema</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {anomalias.map((a, i) => {
                  const info = getInfo(a);
                  return (
                    <TableRow key={`${a.CODRDO}-${a.ITEM}-${i}`}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="caption" fontWeight={600}>
                          #{a.CODRDO}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {format(parseISO(a.DTREF), 'dd/MM')}
                      </TableCell>
                      <TableCell>{a.NOMEPARC}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatHr(a.HRINI)} → {formatHr(a.HRFIM)}
                      </TableCell>
                      <TableCell>{a.motivo ?? <em>vazio</em>}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip label={info.label} color={info.color}
                            size="small" variant="outlined" />
                          <Tooltip title={info.explicacao} arrow placement="left"
                            slotProps={{ tooltip: { sx: { maxWidth: 260 } } }}>
                            <Help sx={{ fontSize: 16, color: 'text.secondary',
                              cursor: 'help' }} />
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Collapse>
    </Box>
  );
}
