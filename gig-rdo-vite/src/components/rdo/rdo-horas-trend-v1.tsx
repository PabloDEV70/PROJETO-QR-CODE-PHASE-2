/**
 * Trend chart: % Produtividade vs Meta por dia.
 * Barras empilhadas: verde (produtivo) + laranja (improdutivo pos-tolerancia).
 * Linha vermelha tracejada em 100% = meta efetiva.
 *
 * Meta por dia usa minutosPrevistos da API (TFPHOR por DIASEM),
 * respeitando jornadas diferentes (ex: sab 4h, seg-sex 8h).
 * Tolerancia (banheiro) descontada usando ratio global (toleranciaDeducaoMin/jornada).
 *
 * Improdutivo usa ratio pos-tolerancia do dashboard (exclui ALMOCO/BANH).
 */
import { useMemo } from 'react';
import { Typography, Stack, Chip, useTheme, useMediaQuery } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartContainer } from '@/components/charts/chart-container';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { RdoTimelinePoint, RdoAnalyticsResumo } from '@/types/rdo-analytics-types';
import type { ProductivityResult } from '@/utils/motivo-productivity';

interface ChartRow {
  label: string;
  pctProd: number;
  pctNaoProd: number;
  /** Minutes (integer) — no rounding loss */
  minProd: number;
  minNaoProd: number;
  minMeta: number;
  rdos: number;
  colabs: number;
  tooltip: string;
}

interface Props {
  data?: RdoTimelinePoint[];
  resumo?: RdoAnalyticsResumo;
  isLoading?: boolean;
  configMode?: string;
  productivity?: ProductivityResult;
  dataInicio?: string;
  dataFim?: string;
  totalDias?: number;
}

export function RdoHorasTrendV1({
  data, resumo, isLoading, configMode, productivity, dataInicio, dataFim, totalDias,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { chartData, avgPct, trend } = useMemo(() => {
    if (!data?.length) return { chartData: [], avgPct: 0, trend: null };

    const isEstrito = !configMode || configMode === 'ESTRITO';
    const totalMin = (productivity?.totalProdMin ?? 0) + (productivity?.totalNaoProdMin ?? 0);
    const prodRatio = !isEstrito && totalMin > 0
      ? (productivity?.totalProdMin ?? 0) / totalMin : 1;

    // Ratio nao-prod/prod from post-tolerance dashboard data.
    const naoProdRatio = (productivity?.totalProdMin ?? 0) > 0
      ? (productivity?.totalNaoProdMin ?? 0) / (productivity?.totalProdMin ?? 1) : 0;

    // Tolerance ratio: how much of jornada becomes meta efetiva (ex: 1190/1200)
    const jornadaTotal = resumo?.totalMinutosPrevistos ?? 0;
    const metaEfTotal = productivity?.totalMetaEfetivaMin ?? 0;
    const tolRatio = jornadaTotal > 0 ? metaEfTotal / jornadaTotal : 1;

    // Fallback: uniform meta per RDO (when API doesn't return minutosPrevistos)
    const totalRdos = resumo?.totalRdos ?? 0;
    const metaPerRdoMin = totalRdos > 0 ? metaEfTotal / totalRdos : 0;

    const byDate = new Map<string, RdoTimelinePoint>();
    for (const p of data) byDate.set(p.DTREF.slice(0, 10), p);

    const allDates = dataInicio && dataFim
      ? eachDayOfInterval({ start: parseISO(dataInicio), end: parseISO(dataFim) })
      : data.map((p) => parseISO(p.DTREF));

    const rows: ChartRow[] = allDates.map((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const p = byDate.get(key);
      const totH = p ? Math.max(0, Number(p.totalHoras) || 0) : 0;
      const rdos = p ? Math.max(0, Number(p.totalRdos) || 0) : 0;
      const hpH = isEstrito
        ? Math.max(0, Math.min(p ? (Number(p.horasProdutivas) || 0) : 0, totH))
        : totH * prodRatio;
      const mprod = Math.round(hpH * 60);
      // Meta por dia: usa jornada real do TFPHOR (por DIASEM) × ratio tolerancia
      const jornadaDia = p?.minutosPrevistos ? Number(p.minutosPrevistos) : 0;
      const metaMin = jornadaDia > 0
        ? Math.round(jornadaDia * tolRatio)
        : Math.round(metaPerRdoMin * rdos);
      const mnprod = Math.round(mprod * naoProdRatio);
      const pctProd = metaMin > 0 ? Math.round((mprod / metaMin) * 100) : 0;
      const pctNaoProd = metaMin > 0 ? Math.round((mnprod / metaMin) * 100) : 0;
      return {
        label: format(date, isMobile ? 'dd/MM' : "EEE dd/MM", { locale: ptBR }),
        pctProd, pctNaoProd,
        minProd: mprod, minNaoProd: mnprod, minMeta: metaMin, rdos,
        colabs: p ? (Number(p.totalColaboradores) || 0) : 0,
        tooltip: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }),
      };
    });

    const avg = rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + r.pctProd, 0) / rows.length) : 0;

    let t = null;
    if (rows.length >= 4) {
      const half = Math.floor(rows.length / 2);
      const a1 = rows.slice(0, half).reduce((s, r) => s + r.pctProd, 0) / half;
      const a2 = rows.slice(half).reduce((s, r) => s + r.pctProd, 0) / (rows.length - half);
      if (a1 > 0) {
        const d = ((a2 - a1) / a1) * 100;
        t = { pct: d.toFixed(0), up: d > 0 };
      }
    }
    return { chartData: rows, avgPct: avg, trend: t };
  }, [data, configMode, productivity, resumo, isMobile, dataInicio, dataFim]);

  const TipRow = ({ l, v, c }: { l: string; v: string; c?: string }) => (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="caption" sx={{ color: c || 'text.secondary' }}>{l}</Typography>
      <Typography variant="caption" fontWeight={700} sx={c ? { color: c } : undefined}>{v}</Typography>
    </Stack>
  );

  const renderTooltip = ({ active, payload }: {
    active?: boolean; payload?: readonly { payload: ChartRow }[];
  }) => {
    if (!active || !payload?.length) return null;
    const r = payload[0]?.payload;
    if (!r) return null;
    const sc = r.pctProd >= 100 ? '#16A34A' : r.pctProd >= 80 ? '#F59E0B' : '#d32f2f';
    const sl = r.pctProd >= 100 ? 'Atingiu meta' : r.pctProd >= 80 ? 'Proximo da meta' : 'Abaixo da meta';
    return (
      <Stack sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper',
        border: 1, borderColor: 'divider', boxShadow: 4, minWidth: 220 }}>
        <Typography variant="caption" fontWeight={700}>{r.tooltip}</Typography>
        <Stack sx={{ mt: 0.5 }} spacing={0.1}>
          <TipRow l="Produtivo:" v={`${r.pctProd}% (${fmtMin(r.minProd)})`} c="#16A34A" />
          {r.pctNaoProd > 0 && (
            <TipRow l="Improdutivo:" v={`${r.pctNaoProd}% (${fmtMin(r.minNaoProd)})`} c="#F59E0B" />
          )}
        </Stack>
        <Stack sx={{ mt: 0.5, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
          <TipRow l="Produtividade:" v={`${r.pctProd}% — ${sl}`} c={sc} />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
          Meta: {fmtMin(r.minMeta)} | {r.rdos} RDOs | {r.colabs} colabs
        </Typography>
      </Stack>
    );
  };

  return (
    <ChartContainer
      title="Produtividade vs Meta"
      subtitle={`${totalDias ? `${totalDias} dia${totalDias > 1 ? 's' : ''} | ` : ''}Media: ${avgPct}%`}
      height={isMobile ? 210 : 250}
      isLoading={isLoading}
      action={trend ? (
        <Chip size="small" label={`${trend.up ? '+' : ''}${trend.pct}% 2a metade`}
          sx={{ height: 22, fontSize: 11, fontWeight: 700,
            bgcolor: trend.up ? 'rgba(22,163,74,0.1)' : 'rgba(211,47,47,0.1)',
            color: trend.up ? '#16A34A' : '#d32f2f' }} />
      ) : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="label" interval="preserveStartEnd" tickMargin={4}
            tick={{ fontSize: 10 }} height={36} />
          <YAxis tick={{ fontSize: 10 }} width={38} tickFormatter={(v: number) => `${v}%`}
            domain={[0, (max: number) => Math.max(max + 10, 110)]} />
          <Tooltip content={renderTooltip} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="pctProd" name="% Produtivo" stackId="pct"
            fill="#16A34A" fillOpacity={0.75} maxBarSize={32} />
          <Bar dataKey="pctNaoProd" name="% Improdutivo" stackId="pct"
            fill="#F59E0B" fillOpacity={0.7} maxBarSize={32} radius={[3, 3, 0, 0]} />
          <ReferenceLine y={100} stroke="#d32f2f" strokeDasharray="6 3"
            strokeWidth={2} label={{ value: 'Meta 100%', position: 'right', fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
