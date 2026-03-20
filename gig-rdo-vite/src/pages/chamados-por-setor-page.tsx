import { Box, Typography } from '@mui/material';
import { AccountTree } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { ChamadosPorSetorChart } from '@/components/chamados/chamados-por-setor-chart';
import { useChamadosPorSetor } from '@/hooks/use-chamados';

export function ChamadosPorSetorPage() {
  const { data, isLoading } = useChamadosPorSetor();

  return (
    <PageLayout
      title="Chamados por Setor"
      subtitle="Distribuicao de chamados de TI por setor"
      icon={AccountTree}
    >
      {!isLoading && data?.length === 0 ? (
        <Typography color="text.secondary">Nenhum dado disponivel.</Typography>
      ) : (
        <Box sx={{ maxWidth: 800 }}>
          <ChamadosPorSetorChart setores={data ?? []} isLoading={isLoading} />
        </Box>
      )}
    </PageLayout>
  );
}
