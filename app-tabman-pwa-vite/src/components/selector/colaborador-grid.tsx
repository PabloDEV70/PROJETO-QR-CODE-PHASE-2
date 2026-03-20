import { Box } from '@mui/material';
import type { ColaboradorGrid } from '@/types/funcionario-types';
import type { AtividadesMap } from '@/hooks/use-atividades-ativas';
import { ColaboradorCard } from '@/components/selector/colaborador-card';
import { useDeviceStore } from '@/stores/device-store';

interface ColaboradorGridProps {
  colaboradores: ColaboradorGrid[];
  onSelect: (codparc: number, nome: string) => void;
  atividades?: AtividadesMap;
}

export function ColaboradorGridView({
  colaboradores,
  onSelect,
  atividades,
}: ColaboradorGridProps) {
  const gridColumns = useDeviceStore((s) => s.gridColumns);
  const autoColumns = {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
    lg: 'repeat(4, 1fr)',
  };
  const fixedColumns = gridColumns > 0 ? `repeat(${gridColumns}, 1fr)` : undefined;

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: fixedColumns ?? autoColumns,
      gap: 1.25,
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {colaboradores.map((c) => (
        <ColaboradorCard
          key={c.codparc}
          colaborador={c}
          onClick={() => onSelect(c.codparc, c.nomeparc)}
          atividade={atividades?.get(c.codparc)}
        />
      ))}
    </Box>
  );
}
