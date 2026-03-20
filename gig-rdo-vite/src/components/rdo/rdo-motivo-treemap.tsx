import { useMemo, useState, useCallback } from 'react';
import { Typography, Box, Stack, Chip, useMediaQuery, useTheme } from '@mui/material';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import {
  fmtMin, CustomContent, CustomTooltip, type TreemapNode,
} from './rdo-treemap-parts';

export interface MotivoGroup {
  sigla: string;
  descricao: string;
  cod: number | null;
  count: number;
  totalMin: number;
  /** wtCategoria from DB: 'wrenchTime' | 'desloc' | 'espera' | 'buro' | 'trein' | 'pausas' | 'externos' */
  category: string;
  /** Color for the motivo (from API or derived) */
  color?: string;
  /** API produtivo flag — true when the API marks this motivo as productive */
  produtivo?: boolean;
  /** Distinct RDOs that used this motivo (for tolerance deduction) */
  rdosComMotivo?: number;
}

interface Props {
  groups: MotivoGroup[];
  totalMin: number;
  isLoading?: boolean;
  onMotivoClick?: (cod: number | null, sigla: string) => void;
  hasExcedentes?: boolean;
  rawTotalMin?: number;
  totalDias?: number;
  horasEsperadas?: number;
  metaPercent?: number;
  /** Meta efetiva (jornada - tolerancias). Used as denominator for ALL pct labels. */
  metaEfetivaMin?: number;
}

export function RdoMotivoTreemap({
  groups, totalMin, isLoading, onMotivoClick, hasExcedentes, rawTotalMin, totalDias, horasEsperadas,
  metaPercent, metaEfetivaMin,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const is4K = useMediaQuery(theme.breakpoints.up('xl'));
  const chartHeight = isMobile ? 200 : is4K ? 400 : 280;
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const handleHover = useCallback((n: string | null) => setHoveredName(n), []);
  const handleClick = useCallback(
    (cod: number | null, sigla: string) => onMotivoClick?.(cod, sigla),
    [onMotivoClick],
  );

  const data = useMemo(() => {
    if (groups.length === 0) return [];
    return groups.map((g) => {
      const isProd = g.produtivo === true || g.category === 'wrenchTime';
      // Use meta efetiva (470min) as denominator so ATVP% matches prodVsMetaPercent everywhere
      const pctDenom = (metaEfetivaMin && metaEfetivaMin > 0) ? metaEfetivaMin : totalMin;
      const pct = pctDenom > 0 ? ((g.totalMin / pctDenom) * 100).toFixed(0) : '0';
      const ex = g as MotivoGroup & {
        isExcedente?: boolean; originalTotalMin?: number; toleranciaMin?: number;
      };
      return {
        name: g.sigla, size: Math.max(g.totalMin, 1), fill: g.color ?? '#757575',
        descricao: g.descricao, count: g.count, pct: `${pct}%`,
        duracao: fmtMin(g.totalMin), categoryLabel: g.category, isProd, cod: g.cod,
        isExcedente: ex.isExcedente ?? false,
        originalDuracao: fmtMin(ex.originalTotalMin ?? g.totalMin),
        toleranciaDuracao: fmtMin(ex.toleranciaMin ?? 0),
      } satisfies TreemapNode;
    });
  }, [groups, totalMin, metaEfetivaMin]);

  if (isLoading) {
    return (
      <ChartContainer title="Distribuicao por Motivo" height={chartHeight} isLoading>
        <div />
      </ChartContainer>
    );
  }

  if (groups.length === 0) {
    return (
      <ChartContainer title="Distribuicao por Motivo" height={200} isLoading={false}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="text.secondary">Nenhum dado disponivel</Typography>
        </Box>
      </ChartContainer>
    );
  }

  const prodCount = groups.filter((g) => g.produtivo === true || g.category === 'wrenchTime').length;
  const nonProdCount = groups.length - prodCount;
  const diffMin = rawTotalMin && rawTotalMin > totalMin ? rawTotalMin - totalMin : 0;

  const parts: string[] = [];
  if (totalDias) parts.push(`${totalDias} dia${totalDias > 1 ? 's' : ''}`);
  parts.push(`${groups.length} motivos`);
  if (hasExcedentes && diffMin > 0) {
    parts.push(`${fmtMin(totalMin)} apontados (${fmtMin(diffMin)} tolerados)`);
  } else {
    parts.push(`${fmtMin(totalMin)} apontados`);
  }
  if (horasEsperadas) parts.push(`${fmtMin(Math.round(horasEsperadas * 60))} esperadas`);
  if (metaPercent != null) parts.push(`Produtividade: ${metaPercent}%`);

  return (
    <ChartContainer
      title="Distribuicao por Motivo"
      subtitle={parts.join(' | ')}
      height={chartHeight}
      isLoading={isLoading}
      action={
        <Stack direction="row" spacing={1}>
          {prodCount > 0 && (
            <Chip size="small" label={`${prodCount} produtivo${prodCount > 1 ? 's' : ''}`}
              sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600, fontSize: 11 }}
            />
          )}
          {nonProdCount > 0 && (
            <Chip size="small" label={`${nonProdCount} nao prod.`}
              sx={{ bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 600, fontSize: 11 }}
            />
          )}
        </Stack>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data} dataKey="size" nameKey="name"
          content={
            <CustomContent
              x={0} y={0} width={0} height={0}
              name="" fill="" pct="" duracao="" cod={null}
              hoveredName={hoveredName} onHover={handleHover} onClick={handleClick}
            />
          }
        >
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
            wrapperStyle={{ zIndex: 1300, pointerEvents: 'none' }}
          />
        </Treemap>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
