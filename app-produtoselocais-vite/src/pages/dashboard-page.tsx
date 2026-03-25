import { Box, Typography, Paper, Stack, Chip, CircularProgress, alpha } from '@mui/material';
import { Inventory, Warehouse, Category } from '@mui/icons-material';
import { useLocaisArvore } from '@/hooks/use-locais';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
interface GrupoResponse { CODGRUPOPROD: number; nome: string; qtd: number; }

export function DashboardPage() {
  const { data: arvore, isLoading: loadingArvore } = useLocaisArvore();
  const { data: grupos, isLoading: loadingGrupos } = useQuery({
    queryKey: ['produtos', 'grupos'],
    queryFn: async () => { const { data } = await apiClient.get<GrupoResponse[]>('/produtos/grupos'); return data; },
    staleTime: 5 * 60_000,
  });

  const totalLocais = arvore?.length ?? 0;
  const totalProdutos = arvore?.reduce((acc, l) => acc + (l.totalProdutosEstoque ?? 0), 0) ?? 0;
  const totalGrupos = grupos?.length ?? 0;

  const cards = [
    { label: 'Locais de Estoque', value: totalLocais, icon: Warehouse, color: '#1565c0' },
    { label: 'Produtos em Estoque', value: totalProdutos, icon: Inventory, color: '#2e7d32' },
    { label: 'Grupos de Produto', value: totalGrupos, icon: Category, color: '#e65100' },
  ];

  if (loadingArvore || loadingGrupos) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Produtos e Locais</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
        {cards.map((c) => (
          <Paper key={c.label} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(c.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon sx={{ color: c.color, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: c.color }}>{c.value}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{c.label}</Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Box>
      {grupos && grupos.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Grupos de Produtos</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {grupos.map((g) => (
              <Chip key={g.CODGRUPOPROD} label={`${g.nome} (${g.qtd})`} size="small" sx={{ fontWeight: 600, fontSize: 11 }} />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
