import { useRef, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { FamiliaBoard } from '@/components/painel-v2/familia-board';
import { usePainelStore } from '@/stores/painel-store';
import { normalizeFamilia } from '@/utils/status-utils';
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

export function AeroportoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: painel, isLoading } = useHstVeiPainel();

  useAutoScroll(containerRef);

  const familias = useMemo(() => {
    if (!painel?.veiculos) return [];
    return groupByFamilia(painel.veiculos);
  }, [painel]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{ flex: 1, overflow: 'auto', p: 2 }}
      onMouseEnter={() => usePainelStore.getState().setIsPaused(true)}
      onMouseLeave={() => usePainelStore.getState().setIsPaused(false)}
    >
      {familias.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
          Nenhum veiculo com situacoes ativas
        </Typography>
      ) : (
        familias.map((f) => (
          <FamiliaBoard key={f.familia} familia={f.familia} veiculos={f.veiculos} />
        ))
      )}
    </Box>
  );
}
