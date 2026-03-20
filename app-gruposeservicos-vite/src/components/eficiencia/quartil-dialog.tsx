import { useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Stack, Chip, Tooltip, alpha,
} from '@mui/material';
import type { PerfExecucao, PerfExecutor } from '@/types/eficiencia-types';

// ── Quartile math ──

interface QuartilStats {
  min: number; q1: number; median: number; q3: number; max: number;
  iqr: number; lowerFence: number; upperFence: number;
  outliers: number[];
  count: number; mean: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function calcQuartis(values: number[]): QuartilStats | null {
  if (values.length < 4) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const median = percentile(sorted, 50);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;

  return {
    min: sorted[0], q1, median, q3, max: sorted[sorted.length - 1],
    iqr, lowerFence, upperFence, outliers,
    count: sorted.length, mean,
  };
}

function fmtMin(min: number): string {
  if (min <= 0) return '-';
  if (min < 60) return `${min.toFixed(0)}min`;
  const h = min / 60;
  return h < 24 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`;
}

// ── Box Plot (SVG) ──

function BoxPlot({ stats, width = 500, height = 120 }: { stats: QuartilStats; width?: number; height?: number }) {
  const pad = 40;
  const w = width - pad * 2;
  const cy = height / 2;
  const boxH = 36;

  const dataMin = Math.min(stats.min, stats.lowerFence);
  const dataMax = Math.max(stats.max, stats.upperFence);
  const range = dataMax - dataMin || 1;
  const x = (v: number) => pad + ((v - dataMin) / range) * w;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* Whiskers */}
      <line x1={x(Math.max(stats.min, stats.lowerFence))} x2={x(stats.q1)} y1={cy} y2={cy} stroke="#999" strokeWidth={1.5} />
      <line x1={x(stats.q3)} x2={x(Math.min(stats.max, stats.upperFence))} y1={cy} y2={cy} stroke="#999" strokeWidth={1.5} />

      {/* Whisker caps */}
      <line x1={x(Math.max(stats.min, stats.lowerFence))} x2={x(Math.max(stats.min, stats.lowerFence))} y1={cy - 12} y2={cy + 12} stroke="#999" strokeWidth={1.5} />
      <line x1={x(Math.min(stats.max, stats.upperFence))} x2={x(Math.min(stats.max, stats.upperFence))} y1={cy - 12} y2={cy + 12} stroke="#999" strokeWidth={1.5} />

      {/* IQR Box */}
      <rect x={x(stats.q1)} y={cy - boxH / 2} width={x(stats.q3) - x(stats.q1)} height={boxH}
        fill="rgba(25,118,210,0.15)" stroke="#1976d2" strokeWidth={1.5} rx={3} />

      {/* Median line */}
      <line x1={x(stats.median)} x2={x(stats.median)} y1={cy - boxH / 2} y2={cy + boxH / 2} stroke="#d32f2f" strokeWidth={2} />

      {/* Mean diamond */}
      <polygon points={`${x(stats.mean)},${cy - 6} ${x(stats.mean) + 5},${cy} ${x(stats.mean)},${cy + 6} ${x(stats.mean) - 5},${cy}`}
        fill="#2e7d32" />

      {/* Outliers */}
      {stats.outliers.map((v, i) => (
        <circle key={i} cx={x(v)} cy={cy} r={4} fill="none" stroke="#ff9800" strokeWidth={1.5} />
      ))}

      {/* Labels */}
      <text x={x(stats.min)} y={cy + boxH / 2 + 16} textAnchor="middle" fontSize={9} fill="#888">{fmtMin(stats.min)}</text>
      <text x={x(stats.q1)} y={cy - boxH / 2 - 6} textAnchor="middle" fontSize={9} fill="#1976d2">Q1: {fmtMin(stats.q1)}</text>
      <text x={x(stats.median)} y={cy - boxH / 2 - 6} textAnchor="middle" fontSize={9} fill="#d32f2f" fontWeight={700}>Med: {fmtMin(stats.median)}</text>
      <text x={x(stats.q3)} y={cy + boxH / 2 + 16} textAnchor="middle" fontSize={9} fill="#1976d2">Q3: {fmtMin(stats.q3)}</text>
      <text x={x(stats.max)} y={cy + boxH / 2 + 16} textAnchor="middle" fontSize={9} fill="#888">{fmtMin(stats.max)}</text>
    </svg>
  );
}

// ── Dialog ──

interface QuartilDialogProps {
  open: boolean;
  onClose: () => void;
  servicoNome: string;
  /** Execucoes individuais — para analise de todas as duracoes */
  execucoes: PerfExecucao[];
  /** Executores agrupados — para analise por executor (media de cada um) */
  executores: PerfExecutor[];
  /** IDs excluidos (outliers manuais) */
  excludedIds: Set<string>;
}

export function QuartilDialog({ open, onClose, servicoNome, execucoes, executores, excludedIds }: QuartilDialogProps) {
  // Stats de todas as execucoes (filtradas)
  const execStats = useMemo(() => {
    const vals = execucoes
      .filter((e) => !excludedIds.has(`${e.nuos}-${e.sequencia}-${e.codusu ?? 0}`))
      .map((e) => e.minutos)
      .filter((m) => m > 0);
    return calcQuartis(vals);
  }, [execucoes, excludedIds]);

  // Stats por executor (media de cada executor)
  const execByExecutor = useMemo(() => {
    const vals = executores
      .filter((e) => !excludedIds.has(`${e.codusu}-${e.situacao ?? 'x'}`))
      .map((e) => e.mediaMinutos)
      .filter((m) => m > 0);
    return calcQuartis(vals);
  }, [executores, excludedIds]);

  const activeExecCount = execucoes.filter((e) => !excludedIds.has(`${e.nuos}-${e.sequencia}-${e.codusu ?? 0}`)).length;
  const activeExecutorCount = executores.filter((e) => !excludedIds.has(`${e.codusu}-${e.situacao ?? 'x'}`)).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>
        Analise Quartil — {servicoNome}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Exec stats */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Todas as execucoes</Typography>
              <Chip label={`${activeExecCount} de ${execucoes.length}`} size="small" sx={{ height: 20, fontSize: 10 }} />
              {excludedIds.size > 0 && <Chip label={`${excludedIds.size} excluidas`} size="small" color="warning" sx={{ height: 20, fontSize: 10 }} />}
            </Stack>
            {execStats ? (
              <>
                <BoxPlot stats={execStats} />
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <StatChip label="Media" value={fmtMin(execStats.mean)} color="#2e7d32" />
                  <StatChip label="Mediana" value={fmtMin(execStats.median)} color="#d32f2f" />
                  <StatChip label="Q1" value={fmtMin(execStats.q1)} color="#1976d2" />
                  <StatChip label="Q3" value={fmtMin(execStats.q3)} color="#1976d2" />
                  <StatChip label="IQR" value={fmtMin(execStats.iqr)} color="#666" />
                  {execStats.outliers.length > 0 && (
                    <StatChip label="Outliers" value={String(execStats.outliers.length)} color="#ff9800" />
                  )}
                </Stack>
              </>
            ) : (
              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Minimo 4 execucoes para analise quartil</Typography>
            )}
          </Box>

          {/* Executor stats */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Por executor (media individual)</Typography>
              <Chip label={`${activeExecutorCount} executores`} size="small" sx={{ height: 20, fontSize: 10 }} />
            </Stack>
            {execByExecutor ? (
              <>
                <BoxPlot stats={execByExecutor} />
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <StatChip label="Media das medias" value={fmtMin(execByExecutor.mean)} color="#2e7d32" />
                  <StatChip label="Mediana" value={fmtMin(execByExecutor.median)} color="#d32f2f" />
                  <StatChip label="Amplitude" value={fmtMin(execByExecutor.max - execByExecutor.min)} color="#666" />
                  {execByExecutor.outliers.length > 0 && (
                    <StatChip label="Outliers" value={String(execByExecutor.outliers.length)} color="#ff9800" />
                  )}
                </Stack>
              </>
            ) : (
              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Minimo 4 executores para analise quartil</Typography>
            )}
          </Box>

          {/* Legend */}
          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', mb: 0.5 }}>Legenda:</Typography>
            <Stack direction="row" spacing={2}>
              <LegendItem color="#1976d2" label="Caixa = Q1-Q3 (50% central)" />
              <LegendItem color="#d32f2f" label="Linha vermelha = Mediana" />
              <LegendItem color="#2e7d32" label="Losango verde = Media" />
              <LegendItem color="#ff9800" label="Circulos = Outliers (>1.5x IQR)" />
            </Stack>
            <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 1 }}>
              Desmarque linhas no DataGrid (checkbox) para excluir outliers e recalcular.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Tooltip title={label}>
      <Stack alignItems="center" spacing={0}>
        <Typography sx={{ fontSize: 9, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{value}</Typography>
      </Stack>
    </Tooltip>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Box sx={{ width: 10, height: 10, bgcolor: color, borderRadius: '2px', flexShrink: 0 }} />
      <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>{label}</Typography>
    </Stack>
  );
}
