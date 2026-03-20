import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Skeleton, IconButton, TextField, InputAdornment,
  Collapse, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { ArrowBack, Search, TrendingUp, TrendingDown, TrendingFlat, HelpOutline } from '@mui/icons-material';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { fetchAnalisefrota, type FrotaRow } from '@/api/analise-frota';
import { format, subMonths } from 'date-fns';

const R = 1;
const RISCO = {
  alto: { bg: '#c62828', text: '#fff', label: 'ALTO', desc: 'Considerar venda' },
  medio: { bg: '#e65100', text: '#fff', label: 'MEDIO', desc: 'Monitorar' },
  baixo: { bg: '#2e7d32', text: '#fff', label: 'OK', desc: 'Saudavel' },
} as const;
const TEND = {
  subindo: { icon: <TrendingUp sx={{ fontSize: 16, color: '#c62828' }} />, label: 'Custo subindo' },
  estavel: { icon: <TrendingFlat sx={{ fontSize: 16, color: '#888' }} />, label: 'Estavel' },
  descendo: { icon: <TrendingDown sx={{ fontSize: 16, color: '#2e7d32' }} />, label: 'Custo caindo' },
} as const;

const R$ = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const fDias = (d: number) => d >= 365 ? `${(d / 365).toFixed(1)} anos` : d >= 30 ? `${Math.round(d / 30)} meses` : `${d} dias`;
const fData = (d: string | null) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '—';

// Default: last month
const defaultDi = format(subMonths(new Date(), 1), 'yyyy-MM-01');
const defaultDf = format(new Date(), 'yyyy-MM-dd');

export function AnaliseFrotaPage() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const search = sp.get('q') ?? '';
  const tipo = sp.get('tipo') ?? '';
  const dataInicio = sp.get('di') ?? defaultDi;
  const dataFim = sp.get('df') ?? defaultDf;
  const help = sp.get('help') === '1';

  const setParam = (key: string, val: string) => {
    const n = new URLSearchParams(sp);
    if (val) n.set(key, val); else n.delete(key);
    setSp(n, { replace: true });
  };

  const { data: ranking, isLoading } = useQuery({ queryKey: ['analise-frota'], queryFn: fetchAnalisefrota, staleTime: 5 * 60_000 });

  const tipos = useMemo(() => {
    if (!ranking) return [];
    const counts = new Map<string, number>();
    for (const r of ranking) { const g = r.tipoGrupo ?? 'OUTROS'; counts.set(g, (counts.get(g) ?? 0) + 1); }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [ranking]);

  const filtered = useMemo(() => {
    let list = ranking ?? [];
    if (tipo) list = list.filter((r) => (r.tipoGrupo ?? 'OUTROS') === tipo);
    if (dataInicio || dataFim) {
      list = list.filter((r) => {
        if (!r.primeiraOS && !r.ultimaOS) return false;
        if (dataInicio && (r.ultimaOS ?? '0') < dataInicio) return false;
        if (dataFim && (r.primeiraOS ?? '9') > dataFim) return false;
        return true;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.placa.toLowerCase().includes(q) || r.tag?.toLowerCase().includes(q) || r.marcamodelo.toLowerCase().includes(q));
    }
    return list;
  }, [ranking, tipo, search, dataInicio, dataFim]);

  const alto = filtered.filter((r) => r.risco === 'alto').length;
  const medio = filtered.filter((r) => r.risco === 'medio').length;
  const custo6m = filtered.reduce((s, r) => s + r.custo6m, 0);

  return (
    <Box sx={{ pb: 4, px: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <IconButton onClick={() => nav(-1)} size="small" sx={{ minWidth: 44, minHeight: 44 }}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800 }}>Analise de Frota</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#888' }}>Ranking de risco para gestao</Typography>
        </Box>
        <IconButton onClick={() => setParam('help', help ? '' : '1')} size="small" sx={{ minWidth: 44, minHeight: 44, bgcolor: help ? '#e3f2fd' : undefined }}>
          <HelpOutline />
        </IconButton>
      </Box>

      {/* Help */}
      <Collapse in={help}>
        <Paper sx={{ p: 2, mb: 1.5, borderRadius: R, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, mb: 0.75 }}>Como funciona?</Typography>
          <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#444' }}>
            Cada veiculo recebe um <strong>score de 0 a 100</strong>. Quanto maior, maior o risco.
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {[['Idade do veiculo', '30%'], ['Custo acumulado', '25%'], ['Tempo parado', '25%'], ['Frequencia de OS', '20%']].map(([l, p]) => (
              <Box key={l} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#555' }}>{l}</Typography>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{p}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Box sx={{ flex: 1, textAlign: 'center', p: 0.75, borderRadius: R, bgcolor: '#c62828', color: '#fff' }}><Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>65+</Typography><Typography sx={{ fontSize: '0.65rem' }}>Vender</Typography></Box>
            <Box sx={{ flex: 1, textAlign: 'center', p: 0.75, borderRadius: R, bgcolor: '#e65100', color: '#fff' }}><Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>40-64</Typography><Typography sx={{ fontSize: '0.65rem' }}>Monitorar</Typography></Box>
            <Box sx={{ flex: 1, textAlign: 'center', p: 0.75, borderRadius: R, bgcolor: '#2e7d32', color: '#fff' }}><Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>&lt;40</Typography><Typography sx={{ fontSize: '0.65rem' }}>OK</Typography></Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Filters */}
      <Paper sx={{ p: 1.5, mb: 1.5, borderRadius: R, bgcolor: '#fff', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <TextField value={search} onChange={(e) => setParam('q', e.target.value)} placeholder="Buscar placa, tag ou modelo" size="small" fullWidth
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20, color: '#999' }} /></InputAdornment> } }}
          sx={{ '& .MuiOutlinedInput-root': { height: 44, fontSize: '0.9rem', borderRadius: R, bgcolor: '#fafafa' } }}
        />

        <FormControl size="small" fullWidth>
          <InputLabel sx={{ fontSize: '0.85rem' }}>Tipo de equipamento</InputLabel>
          <Select value={tipo} label="Tipo de equipamento"
            onChange={(e) => setParam('tipo', e.target.value)}
            sx={{ borderRadius: R, fontSize: '0.88rem', bgcolor: '#fafafa', height: 44 }}
          >
            <MenuItem value="">Todos ({ranking?.length ?? 0})</MenuItem>
            {tipos.map((t) => <MenuItem key={t.name} value={t.name}>{t.name} ({t.count})</MenuItem>)}
          </Select>
        </FormControl>

        <TextField type="date" value={dataInicio} label="Periodo inicio" size="small" fullWidth
          onChange={(e) => setParam('di', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: R, fontSize: '0.88rem', bgcolor: '#fafafa', height: 44 } }}
        />

        <TextField type="date" value={dataFim} label="Periodo fim" size="small" fullWidth
          onChange={(e) => setParam('df', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: R, fontSize: '0.88rem', bgcolor: '#fafafa', height: 44 } }}
        />
      </Paper>

      {/* Period context */}
      {!isLoading && (dataInicio || dataFim) && (
        <Paper sx={{ p: 1, mb: 1, borderRadius: R, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#1565c0', textAlign: 'center' }}>
            Exibindo veiculos com OS entre {fData(dataInicio || null)} e {fData(dataFim || null)}
            {tipo ? ` · Tipo: ${tipo}` : ''}
            {` · ${filtered.length} veiculos encontrados`}
          </Typography>
        </Paper>
      )}

      {/* KPIs */}
      {!isLoading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0.75, mb: 1.5 }}>
          <KpiBox label="Veiculos" value={String(filtered.length)} color="#333" />
          <KpiBox label="Alto risco" value={String(alto)} color="#c62828" />
          <KpiBox label="Medio" value={String(medio)} color="#e65100" />
          <KpiBox label="Custo 6m" value={R$(custo6m)} color="#1565c0" />
        </Box>
      )}

      {/* Loading */}
      {isLoading && [1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" height={160} sx={{ mb: 1, borderRadius: R }} />)}

      {/* Cards */}
      {!isLoading && filtered.map((r, i) => (
        <FrotaCard key={r.codveiculo} row={r} pos={i + 1} onTap={() => nav(`/analise-frota/${r.codveiculo}`)} />
      ))}

      {!isLoading && filtered.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: R, border: '1px solid #e0e0e0' }}>
          <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>Nenhum veiculo encontrado</Typography>
          <Typography sx={{ color: '#ccc', fontSize: '0.75rem', mt: 0.5 }}>Ajuste os filtros acima</Typography>
        </Paper>
      )}

      {/* Detail is now a separate page: /analise-frota/:codveiculo */}
    </Box>
  );
}

/* ── Card ── */
function FrotaCard({ row: r, pos, onTap }: { row: FrotaRow; pos: number; onTap: () => void }) {
  const rc = RISCO[r.risco];
  const td = TEND[r.tendencia];

  return (
    <Paper elevation={0} onClick={onTap} sx={{
      mb: 1, borderRadius: R, overflow: 'hidden',
      border: '1px solid', borderColor: r.risco === 'alto' ? '#ef9a9a' : r.risco === 'medio' ? '#ffe0b2' : '#e0e0e0',
      bgcolor: '#fff', cursor: 'pointer', '&:active': { bgcolor: '#fafafa' },
    }}>
      {/* Header: colored bar */}
      <Box sx={{ bgcolor: rc.bg, px: 1.5, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: rc.text }}>
          #{pos} — Risco {rc.label}
        </Typography>
        <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: rc.text }}>{r.scoreRisco}</Typography>
      </Box>

      {/* Body */}
      <Box sx={{ p: 1.5, pb: 1 }}>
        {/* Placa centralizada */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <PlacaVeiculo placa={r.placa} label={r.tag || r.tipoGrupo || 'VEI'} scale={0.9} />
        </Box>

        {/* Info */}
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, textAlign: 'center' }} noWrap>{r.marcamodelo}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', mb: 1 }}>{r.tipoEqpto} · {r.idadeAnos} anos</Typography>

        {/* Metrics 3-col */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 1 }}>
          <MetricCell label="Total de OS" value={String(r.totalOS)} warn={r.osAbertas > 0 ? `${r.osAbertas} abertas` : undefined} />
          <MetricCell label="Tempo em manut." value={fDias(r.diasEmManutencao)} />
          <MetricCell label="Custo acumulado" value={R$(r.custoTotal)} />
        </Box>

        {/* Bottom: custo recente + tendencia + ultima OS */}
        <Box sx={{ display: 'flex', alignItems: 'center', pt: 1, borderTop: '1px solid #f0f0f0' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#999' }}>Custo ultimos 6 meses</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: r.custo6m > 0 ? '#c62828' : '#333' }}>{R$(r.custo6m)}</Typography>
              {td.icon}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#999' }}>Ultima OS</Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>{fData(r.ultimaOS)}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function MetricCell({ label, value, warn }: { label: string; value: string; warn?: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.68rem', color: '#999', fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#333' }}>{value}</Typography>
      {warn && <Typography sx={{ fontSize: '0.65rem', color: '#c62828', fontWeight: 600 }}>{warn}</Typography>}
    </Box>
  );
}

/* KpiBox used by listing page */
function KpiBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: R, border: '1px solid #e0e0e0' }}>
      <Typography sx={{ fontSize: '0.65rem', color: '#999', fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color }} noWrap>{value}</Typography>
    </Paper>
  );
}
