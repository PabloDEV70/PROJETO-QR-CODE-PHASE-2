import {
  Chip, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { ColaboradorTimelineAtividade } from '@/types/rdo-timeline-types';

interface WtColabAtividadesTableProps {
  atividades: ColaboradorTimelineAtividade[];
}

export function WtColabAtividadesTable({ atividades }: WtColabAtividadesTableProps) {
  if (!atividades.length) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhuma atividade registrada
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
        Atividades ({atividades.length})
      </Typography>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>
              <TableCell>RDO</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell align="right">Duracao</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>OS</TableCell>
              <TableCell>Veiculo</TableCell>
              <TableCell>Obs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {atividades.map((a, i) => {
              return (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{i + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={String(a.codrdo)}
                      variant="outlined"
                      component={Link}
                      to={`/rdo/${a.codrdo}`}
                      icon={<OpenInNew sx={{ fontSize: 12 }} />}
                      clickable
                      sx={{ height: 20, fontSize: 10 }}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {a.hrini} → {a.hrfim}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {fmtMin(a.duracaoMinutos)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0}>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {a.motivoSigla}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap
                        sx={{ maxWidth: 140 }}>
                        {a.motivoDescricao}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={a.isProdutivo ? 'Produtivo' : 'N-Prod'}
                      sx={{
                        height: 20, fontSize: 10, fontWeight: 600,
                        bgcolor: a.isProdutivo ? '#16A34A22' : '#94A3B822',
                        color: a.isProdutivo ? '#16A34A' : '#64748B',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {a.nuos ? (
                      <Tooltip title={`OS ${a.nuos}`}>
                        <Chip
                          size="small" label={String(a.nuos)} variant="outlined"
                          component={Link} to={`/rdo/${a.nuos}`}
                          icon={<OpenInNew sx={{ fontSize: 12 }} />}
                          clickable sx={{ height: 20, fontSize: 10 }}
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" noWrap sx={{ maxWidth: 100 }}>
                      {a.veiculoPlaca || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={a.obs || ''} arrow>
                      <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                        {a.obs || '—'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
