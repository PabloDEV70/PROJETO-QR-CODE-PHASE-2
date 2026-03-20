import { useRef, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { useHstVeiStats } from '@/hooks/use-hstvei-stats';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { StatsBarV2 } from '@/components/painel-v2/stats-bar-v2';
import { FamiliaBoard } from '@/components/painel-v2/familia-board';
import { AutoScrollOverlay } from '@/components/painel/auto-scroll-overlay';
import { ClockDisplay } from '@/components/painel/clock-display';
import { usePainelStore } from '@/stores/painel-store';
import type { PainelVeiculo } from '@/types/hstvei-types';

interface FamiliaGroup {
  familia: string;
  veiculos: PainelVeiculo[];
}

function groupByFamilia(veiculos: PainelVeiculo[]): FamiliaGroup[] {
  const map = new Map<string, PainelVeiculo[]>();

  for (const v of veiculos) {
    const key = normalizeFamilia(v.tipo);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(v);
  }

  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([familia, veiculos]) => ({ familia, veiculos }));
}

function normalizeFamilia(tipo: string | null): string {
  if (!tipo) return 'Outros';
  const t = tipo.trim().toUpperCase();

  if (t.includes('EMPILHADEIRA') || t.includes('EMPILHADEIR')) return 'Empilhadeiras';
  if (t.includes('GUINDASTE')) return 'Guindastes';
  if (t.includes('GUINDAUTO')) return 'Guindautos';
  if (t.includes('CARRO') || t.includes('CAMINHONETE') || t.includes('SUV')) return 'Veiculos Leves';
  if (t.includes('CAMINHAO') || t.includes('CAMINHÃO')) return 'Caminhoes';
  if (t.includes('PLATAFORMA')) return 'Plataformas';
  if (t.includes('GERADOR')) return 'Geradores';
  if (t.includes('COMPRESSOR')) return 'Compressores';
  if (t.includes('ONIBUS') || t.includes('ÔNIBUS') || t.includes('VAN') || t.includes('MICRO')) return 'Transporte';
  if (t.includes('TRATOR') || t.includes('RETROESCAV') || t.includes('ESCAVAD')) return 'Linha Amarela';

  return tipo.trim();
}

export function PainelV2Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: painel, isLoading } = useHstVeiPainel();
  const { data: stats } = useHstVeiStats();
  const searchTerm = usePainelStore((s) => s.searchTerm);

  useAutoScroll(containerRef);

  const familias = useMemo(() => {
    if (!painel?.veiculos) return [];

    let veiculos = painel.veiculos;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      veiculos = veiculos.filter((v) =>
        v.placa?.toLowerCase().includes(term) ||
        v.tag?.toLowerCase().includes(term) ||
        v.marcaModelo?.toLowerCase().includes(term) ||
        v.tipo?.toLowerCase().includes(term) ||
        v.situacoesAtivas.some((s) => s.situacao?.toLowerCase().includes(term)),
      );
    }

    return groupByFamilia(veiculos);
  }, [painel, searchTerm]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalFiltrados = familias.reduce((acc, f) => acc + f.veiculos.length, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <StatsBarV2 painel={painel} stats={stats} />
      <Box
        ref={containerRef}
        sx={{ flex: 1, overflow: 'auto', p: 2 }}
        onMouseEnter={() => usePainelStore.getState().setIsPaused(true)}
        onMouseLeave={() => usePainelStore.getState().setIsPaused(false)}
      >
        {familias.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
            {searchTerm ? 'Nenhum veiculo encontrado' : 'Nenhum veiculo com situacoes ativas'}
          </Typography>
        ) : (
          <>
            {searchTerm && (
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1 }}>
                {totalFiltrados} veiculos encontrados
              </Typography>
            )}
            {familias.map((f) => (
              <FamiliaBoard key={f.familia} familia={f.familia} veiculos={f.veiculos} />
            ))}
          </>
        )}
      </Box>
      <AutoScrollOverlay />
      <ClockDisplay />
    </Box>
  );
}
