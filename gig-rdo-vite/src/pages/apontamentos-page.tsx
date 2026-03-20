import { Stack } from '@mui/material';
import { Handyman } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { ApontamentosKpiRow } from '@/components/apontamentos/apontamentos-kpi-row';
import { ServicosFrequentesTable } from '@/components/apontamentos/servicos-frequentes-table';
import { ProdutosUtilizadosTable } from '@/components/apontamentos/produtos-utilizados-table';
import { VeiculosResumoTable } from '@/components/apontamentos/veiculos-resumo-table';
import {
  useApontamentosResumo,
  useServicosFrequentes,
  useProdutosUtilizados,
  useApontamentosByVeiculo,
} from '@/hooks/use-apontamentos';

export function ApontamentosPage() {
  const resumoQuery = useApontamentosResumo();
  const servicosQuery = useServicosFrequentes();
  const produtosQuery = useProdutosUtilizados();
  const veiculosQuery = useApontamentosByVeiculo();

  return (
    <PageLayout
      title="Apontamentos de Solicitacao"
      subtitle="Servicos solicitados, pendencias de OS e produtos utilizados"
      icon={Handyman}
    >
      <Stack spacing={2.5}>
        <ApontamentosKpiRow
          resumo={resumoQuery.data}
          isLoading={resumoQuery.isLoading}
        />
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>
          <ServicosFrequentesTable
            servicos={servicosQuery.data}
            isLoading={servicosQuery.isLoading}
          />
          <ProdutosUtilizadosTable
            produtos={produtosQuery.data}
            isLoading={produtosQuery.isLoading}
          />
        </Stack>
        <VeiculosResumoTable
          veiculos={veiculosQuery.data}
          isLoading={veiculosQuery.isLoading}
        />
      </Stack>
    </PageLayout>
  );
}
