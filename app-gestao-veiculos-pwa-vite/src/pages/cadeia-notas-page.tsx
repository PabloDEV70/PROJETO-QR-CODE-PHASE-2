import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { useCadeiaNotas, useItensNota } from '@/hooks/use-hstvei-notas';
import { CadeiaNotasList } from '@/components/notas/cadeia-notas-list';
import { ItemNotaTable } from '@/components/notas/item-nota-table';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export function CadeiaNotasPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const { data: cadeia, isLoading: loadingCadeia } = useCadeiaNotas(numId);
  const { data: itens, isLoading: loadingItens } = useItensNota(numId);

  if (loadingCadeia || loadingItens) return <LoadingSkeleton />;

  return (
    <>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Cadeia de Notas</Typography>
      <CadeiaNotasList items={cadeia ?? []} />
      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1.5 }}>Itens da Nota</Typography>
      <ItemNotaTable items={itens ?? []} />
    </>
  );
}
