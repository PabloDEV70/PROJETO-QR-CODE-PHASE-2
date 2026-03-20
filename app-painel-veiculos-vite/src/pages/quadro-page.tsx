import { useRef, useMemo, useState } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { QuadroBoard } from '@/components/quadro/quadro-board';
import { ProximasSaidasSidebar } from '@/components/quadro/proximas-saidas-sidebar';
import { AutoScrollOverlay } from '@/components/painel/auto-scroll-overlay';
import { usePainelStore } from '@/stores/painel-store';
import { normalizeFamilia } from '@/utils/status-utils';
import type { PainelVeiculo } from '@/types/hstvei-types';

type FamiliaFilter = 'todos' | 'guindastes' | 'guindautos' | 'empilhadeiras' | 'outros';

const FAMILIA_FILTERS: { value: FamiliaFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'guindastes', label: 'Guindastes' },
  { value: 'guindautos', label: 'Guindautos' },
  { value: 'empilhadeiras', label: 'Empilhadeiras' },
  { value: 'outros', label: 'Outros' },
];

function matchFamilia(tipo: string | null, filter: FamiliaFilter): boolean {
  if (filter === 'todos') return true;
  const f = normalizeFamilia(tipo);
  if (filter === 'guindastes') return f === 'Guindastes';
  if (filter === 'guindautos') return f === 'Guindautos';
  if (filter === 'empilhadeiras') return f === 'Empilhadeiras';
  return !['Guindastes', 'Guindautos', 'Empilhadeiras'].includes(f);
}

interface FamiliaGroup {
  titulo: string;
  veiculos: PainelVeiculo[];
}

function agruparPorFamilia(veiculos: PainelVeiculo[], filter: FamiliaFilter): FamiliaGroup[] {
  const filtered = veiculos.filter((v) => matchFamilia(v.tipo, filter));

  if (filter !== 'todos') {
    const rotina: PainelVeiculo[] = [];
    const avulso: PainelVeiculo[] = [];
    for (const v of filtered) {
      const sit = v.situacoesAtivas[0]?.situacao?.toLowerCase() ?? '';
      if (sit.includes('locad') || sit.includes('contrato') || sit.includes('operação')) {
        rotina.push(v);
      } else {
        avulso.push(v);
      }
    }
    const groups: FamiliaGroup[] = [];
    if (rotina.length > 0) groups.push({ titulo: 'ROTINA', veiculos: rotina });
    if (avulso.length > 0) groups.push({ titulo: 'PATIO / DISPONIVEL', veiculos: avulso });
    return groups;
  }

  const map = new Map<string, PainelVeiculo[]>();
  for (const v of filtered) {
    const key = normalizeFamilia(v.tipo);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(v);
  }
  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([titulo, veiculos]) => ({ titulo, veiculos }));
}

export function QuadroPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: painel } = useHstVeiPainel();
  const [familiaFilter, setFamiliaFilter] = useState<FamiliaFilter>('todos');

  useAutoScroll(containerRef);

  const groups = useMemo(() => {
    if (!painel?.veiculos) return [];
    return agruparPorFamilia(painel.veiculos, familiaFilter);
  }, [painel, familiaFilter]);

  const totalFiltrados = groups.reduce((acc, g) => acc + g.veiculos.length, 0);

  return (
    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Filter bar */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        px: 2, py: 1,
        bgcolor: 'background.paper',
        borderBottom: 1, borderColor: 'divider',
      }}>
        <Typography sx={{
          fontWeight: 800, fontSize: '0.85rem',
          bgcolor: '#f9a825', color: '#000',
          px: 1.5, py: 0.25, borderRadius: 0.5,
          letterSpacing: '0.06em',
        }}>
          ESCALA DE SERVICOS
        </Typography>

        <ToggleButtonGroup
          value={familiaFilter}
          exclusive
          onChange={(_, v) => { if (v) setFamiliaFilter(v); }}
          size="small"
          sx={{ '& .MuiToggleButton-root': { fontSize: '0.7rem', px: 1.5, py: 0.3 } }}
        >
          {FAMILIA_FILTERS.map((f) => (
            <ToggleButton key={f.value} value={f.value}>{f.label}</ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', ml: 'auto' }}>
          {totalFiltrados} veiculos
        </Typography>
      </Box>

      {/* Main area: boards + sidebar */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Scrollable boards */}
        <Box
          ref={containerRef}
          sx={{ flex: 1, overflow: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          onMouseEnter={() => usePainelStore.getState().setIsPaused(true)}
          onMouseLeave={() => usePainelStore.getState().setIsPaused(false)}
        >
          {groups.map((g) => (
            <QuadroBoard key={g.titulo} titulo={g.titulo} veiculos={g.veiculos} />
          ))}
        </Box>

        {/* Right sidebar */}
        <ProximasSaidasSidebar />
      </Box>

      <AutoScrollOverlay />
    </Box>
  );
}
