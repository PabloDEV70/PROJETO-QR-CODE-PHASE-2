import { useSearchParams } from 'react-router-dom';
import { Stack, Grid, Typography, Skeleton } from '@mui/material';
import { Category } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { PatrimonioCategoriaCard } from '@/components/patrimonio/patrimonio-categoria-card';
import { usePatrimonioCategorias } from '@/hooks/use-patrimonio-categorias';

export function PatrimonioCategoriasPage() {
  const [sp] = useSearchParams();
  const selected = sp.get('categoria') || '';
  const { data, isLoading } = usePatrimonioCategorias();

  const filtered = selected
    ? data?.filter((c) => c.categoria === selected)
    : data;

  if (isLoading) {
    return (
      <PageLayout title="Categorias" subtitle="Resumo por categoria de equipamento" icon={Category}>
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Categorias" subtitle="Resumo por categoria de equipamento" icon={Category}>
      <Stack spacing={2.5}>
        {!filtered?.length ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Nenhuma categoria encontrada.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((cat) => (
              <Grid key={cat.codprod} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <PatrimonioCategoriaCard categoria={cat} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </PageLayout>
  );
}
