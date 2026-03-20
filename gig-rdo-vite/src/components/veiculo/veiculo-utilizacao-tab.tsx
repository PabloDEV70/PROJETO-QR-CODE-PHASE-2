import { useMemo } from 'react';
import {
  Box, Card, CardContent, Skeleton, TextField, Typography, useTheme,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { parseISO, isValid, format } from 'date-fns';
import type { VeiculoUtilizacao } from '@/types/veiculo-tabs-types';
import { VeiculoPessoasSection } from './veiculo-pessoas-section';

interface Props {
  data?: VeiculoUtilizacao;
  isLoading: boolean;
  onPeriodChange: (ini: string, fim: string) => void;
  dataInicio: string;
  dataFim: string;
  anoFabric: number | null;
  anoModelo: number | null;
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function KpiCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <Card variant="outlined" sx={{ flex: '1 1 160px', minWidth: 160 }}>
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label, opacity }: {
  color: string; label: string; opacity?: number;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, opacity }} />
      <Typography variant="caption">{label}</Typography>
    </Box>
  );
}

export function VeiculoUtilizacaoTab({
  data, isLoading, onPeriodChange, dataInicio, dataFim, anoFabric, anoModelo,
}: Props) {
  const theme = useTheme();
  const totals = useMemo(() => {
    if (!data?.mensal?.length) return { manut: 0, comercial: 0, livre: 0, total: 0 };
    let manut = 0, comercial = 0, livre = 0, total = 0;
    for (const m of data.mensal) {
      manut += m.diasManut;
      comercial += m.diasComercial;
      livre += m.diasLivre;
      total += m.diasTotal;
    }
    return { manut, comercial, livre, total };
  }, [data?.mensal]);

  const pctManut = totals.total > 0 ? Math.round((totals.manut / totals.total) * 100) : 0;
  const pctComercial = totals.total > 0
    ? Math.round((totals.comercial / totals.total) * 100) : 0;
  const pctLivre = Math.max(0, 100 - pctManut - pctComercial);
  const manutColor = '#ed6c02';
  const comercialColor = '#2e7d32';
  const livreColor = theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={80} />)}
      </Box>
    );
  }

  const r = data?.resumo;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Utilizacao do Veiculo
        </Typography>
        <TextField type="date" size="small" label="Inicio" value={dataInicio}
          onChange={(e) => onPeriodChange(e.target.value, dataFim)}
          slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
        <TextField type="date" size="small" label="Fim" value={dataFim}
          onChange={(e) => onPeriodChange(dataInicio, e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />
      </Box>

      {totals.total > 0 && (
        <Card variant="outlined">
          <CardContent sx={{ py: 1.5, px: 2 }}>
            <Box sx={{
              display: 'flex', height: 32, borderRadius: 1, overflow: 'hidden', mb: 1,
            }}>
              {pctManut > 0 && (
                <Box sx={{ width: `${pctManut}%`, bgcolor: manutColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                    {pctManut}%</Typography>
                </Box>
              )}
              {pctComercial > 0 && (
                <Box sx={{ width: `${pctComercial}%`, bgcolor: comercialColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                    {pctComercial}%</Typography>
                </Box>
              )}
              {pctLivre > 0 && (
                <Box sx={{ width: `${pctLivre}%`, bgcolor: livreColor, opacity: 0.3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
                    {pctLivre}%</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <LegendDot color={manutColor} label={`Manutencao (${pctManut}%)`} />
              <LegendDot color={comercialColor} label={`Comercial (${pctComercial}%)`} />
              <LegendDot color={livreColor} label={`Disponivel (${pctLivre}%)`} opacity={0.3} />
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {anoFabric && (
          <KpiCard label="Idade do veiculo"
            value={`${new Date().getFullYear() - anoFabric} anos`}
            sub={`Fab: ${anoFabric}${anoModelo ? ` / Mod: ${anoModelo}` : ''}`} />
        )}
        <KpiCard label="Periodo" value={`${totals.total} dias`}
          sub={`${dataInicio} a ${dataFim}`} />
        <KpiCard label="Em manutencao" value={`${totals.manut} dias`} color={manutColor}
          sub={r ? `${r.totalOsManut} OS (${r.osManutAbertas} abertas)` : undefined} />
        <KpiCard label="Em trabalho comercial" value={`${totals.comercial} dias`}
          color={comercialColor}
          sub={r ? `${r.totalOsCom} OS · ${r.totalDiarias} diarias` : undefined} />
        <KpiCard label="Clientes" value={String(r?.clientesAtendidos ?? 0)}
          sub={r ? `${r.totalDiarias} diarias totais` : undefined} />
        <KpiCard label="Disponibilidade" value={`${pctLivre}%`} color={livreColor}
          sub={`${totals.livre} dias livres`} />
      </Box>

      {r && (r.motoristaNome || r.localParceiro || r.primeiraAtividade) && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {r.motoristaNome && r.motoristaNome.length > 1 && (
            <Typography variant="body2" color="text.secondary">
              Motorista: <strong>{r.motoristaNome}</strong></Typography>
          )}
          {r.localParceiro && r.localParceiro.length > 1 && (
            <Typography variant="body2" color="text.secondary">
              Local: <strong>{r.localParceiro}</strong></Typography>
          )}
          {r.primeiraAtividade && (
            <Typography variant="body2" color="text.secondary">
              Primeira atividade: <strong>{safeFmt(r.primeiraAtividade)}</strong></Typography>
          )}
        </Box>
      )}

      {data?.mensal && data.mensal.length > 0 && (
        <UtilizacaoChart data={data.mensal} colors={{ manutColor, comercialColor, livreColor }} />
      )}

      {data?.pessoas && <VeiculoPessoasSection pessoas={data.pessoas} />}
    </Box>
  );
}

function UtilizacaoChart({ data, colors }: {
  data: VeiculoUtilizacao['mensal'];
  colors: { manutColor: string; comercialColor: string; livreColor: string };
}) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Dias por mes — Manutencao / Comercial / Livre
        </Typography>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }}
              tickFormatter={(v: string) => {
                const p = v.split('-');
                return `${p[1] ?? ''}/${(p[0] ?? '').slice(2)}`;
              }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v, name) => [
                `${v ?? 0} dias`,
                String(name) === 'diasManut' ? 'Manutencao'
                  : String(name) === 'diasComercial' ? 'Comercial' : 'Livre',
              ]}
              labelFormatter={(v) => { const [y, m] = String(v).split('-'); return `${m}/${y}`; }}
            />
            <Legend formatter={(v: string) =>
              v === 'diasManut' ? 'Manutencao'
                : v === 'diasComercial' ? 'Comercial' : 'Livre'} />
            <Bar dataKey="diasManut" stackId="a" fill={colors.manutColor} />
            <Bar dataKey="diasComercial" stackId="a" fill={colors.comercialColor} />
            <Bar dataKey="diasLivre" stackId="a" fill={colors.livreColor} opacity={0.3}
              radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
