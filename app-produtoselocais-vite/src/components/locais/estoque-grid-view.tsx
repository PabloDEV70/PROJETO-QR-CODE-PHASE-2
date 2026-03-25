import { Grid } from '@mui/material';
import { ProdutoCard } from '@/components/locais/produto-card';
import type { EstoqueLocal } from '@/types/local-produto';

interface EstoqueGridViewProps {
  items: EstoqueLocal[];
  onSelect: (item: EstoqueLocal) => void;
}

export function EstoqueGridView({ items, onSelect }: EstoqueGridViewProps) {
  return (
    <Grid container spacing={1.5}>
      {items.map((item, idx) => (
        <Grid
          key={`${item.codProd}-${item.controle}-${idx}`}
          size={{ xs: 12, sm: 6, md: 4 }}
        >
          <ProdutoCard item={item} onClick={() => onSelect(item)} />
        </Grid>
      ))}
    </Grid>
  );
}
