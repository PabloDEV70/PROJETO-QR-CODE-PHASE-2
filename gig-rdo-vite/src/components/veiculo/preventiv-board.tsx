import { useMemo } from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { VeiculoQuadro } from '@/types/preventiva-types';
import { PreventivVehicleCard } from '@/components/veiculo/preventiv-vehicle-card';

interface PreventivBoardProps {
  veiculos: VeiculoQuadro[];
  categorias: string[];
  searchQuery: string;
  categoriaFilter: string | null;
  statusFilter: string | null;
}

function sortByUrgency(a: VeiculoQuadro, b: VeiculoQuadro): number {
  const aAtrasadas = a.resumo.atrasadas;
  const bAtrasadas = b.resumo.atrasadas;
  if (aAtrasadas !== bAtrasadas) return bAtrasadas - aAtrasadas;
  return a.placa.localeCompare(b.placa);
}

function matchesStatus(v: VeiculoQuadro, statusFilter: string | null): boolean {
  if (!statusFilter) return true;
  if (statusFilter === 'ATRASADA') return v.resumo.atrasadas > 0;
  if (statusFilter === 'EM_DIA') return v.resumo.atrasadas === 0 && v.resumo.emDia > 0;
  if (statusFilter === 'SEM_HISTORICO') {
    return v.preventivas.every((p) => p.status === 'SEM_HISTORICO');
  }
  return true;
}

export function PreventivBoard({
  veiculos,
  categorias,
  searchQuery,
  categoriaFilter,
  statusFilter,
}: PreventivBoardProps) {
  const filteredByCategory = useMemo(() => {
    const displayCategorias = categoriaFilter
      ? categorias.filter((c) => c === categoriaFilter)
      : categorias;

    return displayCategorias.map((cat) => {
      const catVeiculos = veiculos
        .filter((v) => v.tipoEquipamento === cat)
        .filter((v) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            v.placa.toLowerCase().includes(q) ||
            v.marcaModelo.toLowerCase().includes(q) ||
            (v.tag && v.tag.toLowerCase().includes(q))
          );
        })
        .filter((v) => matchesStatus(v, statusFilter))
        .sort(sortByUrgency);

      return { categoria: cat, veiculos: catVeiculos };
    });
  }, [veiculos, categorias, searchQuery, categoriaFilter, statusFilter]);

  const noSemCategoria = useMemo(() => {
    return veiculos
      .filter((v) => !v.tipoEquipamento)
      .filter((v) => {
        if (categoriaFilter) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return v.placa.toLowerCase().includes(q) || v.marcaModelo.toLowerCase().includes(q);
      })
      .filter((v) => matchesStatus(v, statusFilter))
      .sort(sortByUrgency);
  }, [veiculos, searchQuery, categoriaFilter, statusFilter]);

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ minWidth: 'fit-content' }}>
        {filteredByCategory.map(({ categoria, veiculos: catVeiculos }) => (
          <CategoryColumn key={categoria} categoria={categoria} veiculos={catVeiculos} />
        ))}
        {noSemCategoria.length > 0 && (
          <CategoryColumn categoria="Sem Categoria" veiculos={noSemCategoria} />
        )}
      </Stack>
    </Box>
  );
}

interface CategoryColumnProps {
  categoria: string;
  veiculos: VeiculoQuadro[];
}

function CategoryColumn({ categoria, veiculos }: CategoryColumnProps) {
  if (veiculos.length === 0) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ minWidth: 220, maxWidth: 260, flex: '0 0 auto', borderRadius: 2 }}
    >
      <Box
        sx={{
          px: 1.5, py: 1, bgcolor: 'grey.50',
          borderBottom: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {categoria}
        </Typography>
        <Chip label={veiculos.length} size="small" sx={{ height: 20, fontWeight: 700 }} />
      </Box>
      <Stack spacing={1} sx={{ p: 1, maxHeight: '70vh', overflowY: 'auto' }}>
        {veiculos.map((v) => (
          <PreventivVehicleCard key={v.codveiculo} veiculo={v} />
        ))}
      </Stack>
    </Paper>
  );
}
