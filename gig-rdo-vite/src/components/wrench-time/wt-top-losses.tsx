import { Fragment, useState } from 'react';
import {
  Box, Chip, Collapse, IconButton, Paper, Skeleton, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from '@mui/material';
import { Info, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { fmtMin } from '@/utils/wrench-time-categories';
import { ExpandedMotivos } from '@/components/wrench-time/wt-motivo-tooltip';
import { WtLossDetailDialog } from '@/components/wrench-time/wt-loss-detail-dialog';
import type { WrenchTimeBreakdown, WtDeductions } from '@/types/wrench-time-types';

interface WtTopLossesProps {
  breakdowns: WrenchTimeBreakdown[];
  deductions?: WtDeductions;
  dataInicio?: string;
  dataFim?: string;
  isLoading?: boolean;
}

const emptyD: WtDeductions = {
  almocoTotalMin: 0, almocoProgramadoMin: 0, almocoExcessoMin: 0,
  banheiroTotalMin: 0, banheiroToleranciaMin: 0, banheiroExcessoMin: 0,
  totalRdos: 0, totalBrutoMin: 0, baseEfetivaMin: 0,
};

export function WtTopLosses({
  breakdowns, deductions, dataInicio, dataFim, isLoading,
}: WtTopLossesProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dialogCat, setDialogCat] = useState<WrenchTimeBreakdown | null>(null);
  const losses = breakdowns.filter((b) => b.category !== 'wrenchTime');
  const d = deductions ?? emptyD;

  if (!isLoading && losses.filter((b) => b.totalMin > 0).length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Principais Perdas
        </Typography>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
          <Typography variant="body2" color="text.secondary">Sem perdas registradas</Typography>
        </Stack>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Principais Perdas
        </Typography>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" height={44} sx={{ mb: 0.5, borderRadius: 1 }} />
        ))}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Principais Perdas
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={36}>#</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell width={90}>Horas</TableCell>
              <TableCell width={70}>%</TableCell>
              <TableCell>Dica</TableCell>
              <TableCell width={72} />
            </TableRow>
          </TableHead>
          <TableBody>
            {losses.map((cat, idx) => {
              const isOpen = expanded === cat.category;
              return (
                <Fragment key={cat.category}>
                  <TableRow hover sx={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(isOpen ? null : cat.category)}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{
                          width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color,
                        }} />
                        <Typography variant="body2" fontWeight={600}>{cat.label}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{fmtMin(cat.totalMin)}</TableCell>
                    <TableCell>
                      <Chip label={`${cat.percentOfTotal}%`} size="small" sx={{
                        bgcolor: `${cat.color}20`, color: cat.color, fontWeight: 600,
                      }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{cat.tips}</Typography>
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Stack direction="row" spacing={0}>
                        <Tooltip title="Ver calculo detalhado">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation(); setDialogCat(cat);
                          }}>
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton size="small">
                          {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0, borderBottom: isOpen ? undefined : 0 }}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <ExpandedMotivos cat={cat} d={d} />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <WtLossDetailDialog open={!!dialogCat} onClose={() => setDialogCat(null)}
        category={dialogCat} deductions={d}
        dataInicio={dataInicio} dataFim={dataFim} />
    </Paper>
  );
}
