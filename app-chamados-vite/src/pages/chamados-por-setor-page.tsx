import { Box, Typography, Stack } from '@mui/material';
import { AccountTree } from '@mui/icons-material';
import { ChamadosPorSetorChart } from '@/components/chamados/chamados-por-setor-chart';
import { useChamadosPorSetor } from '@/hooks/use-chamados';

export function ChamadosPorSetorPage() {
  const { data, isLoading } = useChamadosPorSetor();

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <AccountTree sx={{ color: 'primary.main' }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>Chamados por Setor</Typography>
          <Typography variant="body2" color="text.secondary">
            Distribuicao de chamados de TI por setor
          </Typography>
        </Box>
      </Stack>

      {!isLoading && data?.length === 0 ? (
        <Typography color="text.secondary">Nenhum dado disponivel.</Typography>
      ) : (
        <Box sx={{ maxWidth: 800 }}>
          <ChamadosPorSetorChart setores={data ?? []} isLoading={isLoading} />
        </Box>
      )}
    </Box>
  );
}
