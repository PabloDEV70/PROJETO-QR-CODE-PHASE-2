import {
  Box, Chip, Dialog, DialogContent, DialogTitle, Divider,
  IconButton, LinearProgress, Stack, Typography,
} from '@mui/material';
import { CalendarMonth, Close, Groups, Timer } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { fmtMin } from '@/utils/wrench-time-categories';
import { AlmocoDetail, BanheiroDetail } from '@/components/wrench-time/wt-deduction-details';
import type { WrenchTimeBreakdown, WtDeductions } from '@/types/wrench-time-types';

const MOTIVO_ALMOCO = 3;
const MOTIVO_BANHEIRO = 2;

interface Props {
  open: boolean;
  onClose: () => void;
  category: WrenchTimeBreakdown | null;
  deductions: WtDeductions;
  dataInicio?: string;
  dataFim?: string;
}

function fmtDate(d?: string) {
  if (!d) return '-';
  try { return format(parseISO(d), 'dd/MM/yyyy'); } catch { return d; }
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" fontWeight={bold ? 700 : 400}>{value}</Typography>
    </Stack>
  );
}

function ContextHeader({ d, dataInicio, dataFim }: {
  d: WtDeductions; dataInicio?: string; dataFim?: string;
}) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption">
            {fmtDate(dataInicio)} a {fmtDate(dataFim)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Groups sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption">
            {d.totalRdos} RDOs (= {d.totalRdos} func./dia)
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption">Base efetiva: {fmtMin(d.baseEfetivaMin)}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export function WtLossDetailDialog({
  open, onClose, category, deductions: d, dataInicio, dataFim,
}: Props) {
  if (!category) return null;
  const hasAlmoco = category.motivos.some((m) => m.cod === MOTIVO_ALMOCO);
  const hasBanheiro = category.motivos.some((m) => m.cod === MOTIVO_BANHEIRO);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: category.color }} />
          <Typography variant="h6" fontWeight={700}>{category.label}</Typography>
          <Chip label={`${category.percentOfTotal}%`} size="small" sx={{
            bgcolor: `${category.color}20`, color: category.color, fontWeight: 700,
          }} />
        </Stack>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <ContextHeader d={d} dataInicio={dataInicio} dataFim={dataFim} />
          <Box>
            <Row label="Total na categoria" value={fmtMin(category.totalMin)} bold />
            <Row label="% da base efetiva" value={`${category.percentOfTotal}%`} />
            <Row label="Base efetiva (periodo)" value={fmtMin(d.baseEfetivaMin)} />
            <Row label="Total bruto (periodo)" value={fmtMin(d.totalBrutoMin)} />
          </Box>

          {hasAlmoco && <AlmocoDetail d={d} />}
          {hasBanheiro && <BanheiroDetail d={d} />}

          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>
            Motivos nesta categoria ({category.motivos.length})
          </Typography>
          {category.motivos.map((m) => {
            const isSpecial = m.cod === MOTIVO_ALMOCO || m.cod === MOTIVO_BANHEIRO;
            return (
              <Box key={m.cod} sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {m.sigla} — {m.descricao}
                      {isSpecial && (
                        <Chip label="so excesso" size="small" sx={{
                          ml: 1, height: 18, fontSize: 10, bgcolor: '#F59E0B20', color: '#F59E0B',
                        }} />
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fmtMin(m.totalMin)} ({m.percentOfCategory}% da categoria)
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={700}>{fmtMin(m.totalMin)}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={m.percentOfCategory}
                  sx={{ mt: 0.5, height: 6, borderRadius: 3,
                    bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: category.color },
                  }} />
              </Box>
            );
          })}
          {category.tips && (
            <>
              <Divider />
              <Box sx={{
                p: 1, borderRadius: 1, bgcolor: '#3B82F608', border: '1px solid #3B82F620',
              }}>
                <Typography variant="caption" color="#3B82F6" fontWeight={600}>
                  Dica: {category.tips}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
