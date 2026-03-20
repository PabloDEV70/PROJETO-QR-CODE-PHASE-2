import { Typography, Stack, Chip, Paper } from '@mui/material';

export { fmtMin } from '@/utils/wrench-time-categories';

export interface TreemapNode {
  name: string;
  size: number;
  fill: string;
  descricao: string;
  count: number;
  pct: string;
  duracao: string;
  categoryLabel: string;
  isProd: boolean;
  cod: number | null;
  isExcedente: boolean;
  originalDuracao: string;
  toleranciaDuracao: string;
}

interface ContentProps {
  x: number; y: number; width: number; height: number;
  name: string; fill: string; pct: string; duracao: string;
  cod: number | null;
  hoveredName: string | null;
  onHover: (name: string | null) => void;
  onClick: (cod: number | null, sigla: string) => void;
}

export function CustomContent({
  x, y, width, height, name, fill, pct, duracao,
  cod, hoveredName, onHover, onClick,
}: ContentProps) {
  if (width < 2 || height < 2) return null;
  const showName = width >= 30 && height >= 20;
  const showPct = width > 60 && height > 35;
  const showDur = width > 80 && height > 50;
  const isHovered = hoveredName === name;
  const isDimmed = hoveredName != null && !isHovered;
  return (
    <g
      onMouseEnter={() => onHover(name)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(cod, name)}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={x} y={y} width={width} height={height} rx={4} ry={4}
        fill={fill} stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.6)'}
        strokeWidth={isHovered ? 3 : 2}
        opacity={isDimmed ? 0.45 : 1}
        style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
      />
      {showName && (
        <text
          x={x + width / 2} y={y + height / 2 - (showPct ? 6 : 0)}
          textAnchor="middle" dominantBaseline="central"
          fill="#fff" fontSize={width > 80 ? 13 : 11} fontWeight={700}
          style={{ pointerEvents: 'none' }}
        >{name}</text>
      )}
      {showPct && (
        <text
          x={x + width / 2} y={y + height / 2 + 12}
          textAnchor="middle" dominantBaseline="central"
          fill="rgba(255,255,255,0.9)" fontSize={11}
          style={{ pointerEvents: 'none' }}
        >{pct}</text>
      )}
      {showDur && (
        <text
          x={x + width / 2} y={y + height / 2 + 26}
          textAnchor="middle" dominantBaseline="central"
          fill="rgba(255,255,255,0.8)" fontSize={10}
          style={{ pointerEvents: 'none' }}
        >{duracao}</text>
      )}
    </g>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight={600} fontFamily="monospace">
        {value}
      </Typography>
    </Stack>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TreemapNode;
  const pctNum = parseFloat(d.pct);
  const pctColor = d.isProd
    ? (pctNum >= 100 ? '#16A34A' : pctNum >= 80 ? '#F59E0B' : '#d32f2f')
    : '#F59E0B';
  return (
    <Paper
      elevation={6}
      sx={{ px: 2, py: 1.5, maxWidth: 280, borderLeft: 4, borderColor: d.fill }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle2" fontWeight={700}>{d.name}</Typography>
        <Chip
          label={d.categoryLabel} size="small"
          sx={{
            height: 18, fontSize: 10, fontWeight: 600,
            bgcolor: d.isProd ? 'success.light' : 'warning.light',
            color: d.isProd ? 'success.dark' : 'warning.dark',
          }}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block">
        {d.descricao}
      </Typography>
      <Stack spacing={0.5} sx={{ mt: 1 }}>
        {d.isExcedente ? (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Excedente</Typography>
              <Typography variant="body2" fontWeight={700} color="error">
                +{d.duracao}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {d.toleranciaDuracao} permitidos | {d.originalDuracao} total real
            </Typography>
          </>
        ) : (
          <Row label="Tempo" value={d.duracao} />
        )}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">% da meta</Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: pctColor }}>
            {d.pct}
          </Typography>
        </Stack>
        <Row label="Apontamentos" value={String(d.count)} />
      </Stack>
    </Paper>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
