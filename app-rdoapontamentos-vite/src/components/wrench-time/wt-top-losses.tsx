import { Fragment, useState } from 'react';
import {
  Box, Chip, Collapse, IconButton, Paper, Skeleton, Stack,
  Typography,
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
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Principais Perdas
        </Typography>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 120 }}>
          <Typography variant="body2" color="text.secondary">Sem perdas registradas</Typography>
        </Stack>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Principais Perdas
        </Typography>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 0.5, borderRadius: 1.5 }} />
        ))}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ px: 0.5, mb: 1 }}>
        Principais Perdas
      </Typography>

      <Stack spacing={0.5}>
        {losses.map((cat, idx) => {
          const isOpen = expanded === cat.category;
          return (
            <Fragment key={cat.category}>
              <Box
                onClick={() => setExpanded(isOpen ? null : cat.category)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1,
                  py: 0.75,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  bgcolor: isOpen ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 150ms',
                }}
              >
                {/* Rank + color dot */}
                <Typography
                  variant="caption"
                  sx={{ width: 18, textAlign: 'center', color: 'text.disabled', fontWeight: 700 }}
                >
                  {idx + 1}
                </Typography>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color, flexShrink: 0 }} />

                {/* Name + hours */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {cat.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fmtMin(cat.totalMin)}
                    {cat.tips && ` — ${cat.tips}`}
                  </Typography>
                </Box>

                {/* Percentage badge */}
                <Chip
                  label={`${cat.percentOfTotal}%`}
                  size="small"
                  sx={{
                    height: 22, fontWeight: 700, fontSize: 11,
                    bgcolor: `${cat.color}18`, color: cat.color,
                    flexShrink: 0,
                  }}
                />

                {/* Info + expand */}
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDialogCat(cat); }}
                  sx={{ p: 0.25 }}
                >
                  <Info sx={{ fontSize: 16 }} />
                </IconButton>
                {isOpen
                  ? <KeyboardArrowUp sx={{ fontSize: 18, color: 'text.secondary' }} />
                  : <KeyboardArrowDown sx={{ fontSize: 18, color: 'text.secondary' }} />}
              </Box>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 4, pr: 1, pb: 1 }}>
                  <ExpandedMotivos cat={cat} d={d} />
                </Box>
              </Collapse>
            </Fragment>
          );
        })}
      </Stack>

      <WtLossDetailDialog
        open={!!dialogCat} onClose={() => setDialogCat(null)}
        category={dialogCat} deductions={d}
        dataInicio={dataInicio} dataFim={dataFim}
      />
    </Paper>
  );
}
