import { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
} from 'recharts';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { useHstVeiStats } from '@/hooks/use-hstvei-stats';
import {
  contarPorDepartamento, normalizeFamilia, getStatusInfo,
} from '@/utils/status-utils';
import type { PainelVeiculo } from '@/types/hstvei-types';

function BigNumber({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center', flex: 1, minWidth: 120 }}>
      <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600, mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
    </Paper>
  );
}

function DonutChart({ data, title }: { data: { name: string; value: number; color: string }[]; title: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </Typography>
      <Box sx={{ width: 200, height: 200, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={55} outerRadius={85}
              dataKey="value" paddingAngle={2}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <RTooltip formatter={(val, name) => [`${val} (${Math.round(Number(val) / total * 100)}%)`, name]} />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{total}</Typography>
          <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>total</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: 'center' }}>
        {data.filter((d) => d.value > 0).map((d) => (
          <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
            <Typography sx={{ fontSize: '0.65rem' }}>{d.name} ({d.value})</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function FamiliaBarChart({ veiculos }: { veiculos: PainelVeiculo[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of veiculos) {
      const f = normalizeFamilia(v.tipo);
      map.set(f, (map.get(f) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [veiculos]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Veiculos por Familia
      </Typography>
      <Box sx={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 100, right: 20 }}>
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
            <RTooltip />
            <Bar dataKey="value" fill="#66bb6a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export function KpiPage() {
  const { data: painel } = useHstVeiPainel();
  const { data: stats } = useHstVeiStats();

  const veiculos = painel?.veiculos ?? [];
  const counts = useMemo(() => contarPorDepartamento(veiculos), [veiculos]);

  const statusDonut = Object.entries(counts)
    .map(([dep, value]) => {
      const info = getStatusInfo(dep);
      return { name: info.label, value, color: info.color };
    })
    .filter((d) => d.value > 0);

  const livres = Object.entries(counts)
    .filter(([dep]) => dep.toLowerCase().includes('logistica') || dep.toLowerCase().includes('livre'))
    .reduce((s, [, v]) => s + v, 0);
  const pctDisponivel = veiculos.length > 0
    ? Math.round((livres / veiculos.length) * 100)
    : 0;

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {/* Big numbers row */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <BigNumber value={veiculos.length} label="Total Frota" color="#66bb6a" />
        <BigNumber value={counts['Logistica'] ?? counts['Logistica / Patio'] ?? 0} label="Logistica" color="#4caf50" />
        <BigNumber value={counts['Comercial'] ?? 0} label="Comercial" color="#2196f3" />
        <BigNumber value={counts['Manutencao'] ?? counts['Manutenção'] ?? 0} label="Manutencao" color="#ff9800" />
        <BigNumber value={counts['Compras'] ?? 0} label="Compras" color="#ffc107" />
        <BigNumber value={pctDisponivel} label="% Disponivel" color={pctDisponivel > 50 ? '#4caf50' : '#ff9800'} />
      </Box>

      {/* Stats from backend */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <BigNumber value={stats.urgentes} label="Urgentes" color="#f44336" />
          <BigNumber value={stats.atrasadas} label="Atrasadas" color="#ff5722" />
          <BigNumber value={stats.previsao3dias} label="Previsao 3 dias" color="#ffc107" />
          <BigNumber value={stats.veiculosManutencao} label="Depto Manut." color="#1976d2" />
          <BigNumber value={stats.veiculosComercial} label="Depto Comercial" color="#c62828" />
          <BigNumber value={stats.veiculosLogistica} label="Depto Logistica" color="#00838f" />
        </Box>
      )}

      {/* Charts row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
        <DonutChart data={statusDonut} title="Distribuicao por Status" />
        <FamiliaBarChart veiculos={veiculos} />
      </Box>
    </Box>
  );
}
