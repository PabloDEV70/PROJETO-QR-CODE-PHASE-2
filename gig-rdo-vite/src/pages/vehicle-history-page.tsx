import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Skeleton, Tab, Tabs } from '@mui/material';
import {
  Info,
  Build,
  Business,
  Description,
  Speed,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  useVeiculoPerfil,
  useOsManutencaoAtivas,
  useHistoricoUnificado,
} from '@/hooks/use-veiculo-perfil';
import { useVehicleDetail } from '@/hooks/use-vehicle-detail';
import { VeiculoHeaderCard } from '@/components/veiculo/veiculo-header-card';
import { VeiculoIdentificacaoTab } from '@/components/veiculo/veiculo-identificacao-tab';
import { VeiculoManutencaoAtivasTab } from '@/components/veiculo/veiculo-manutencao-ativas-tab';
import { VeiculoComercialTab } from '@/components/veiculo/veiculo-comercial-tab';
import { VeiculoContratosTab } from '@/components/veiculo/veiculo-contratos-tab';
import { VehicleKpiCards } from '@/components/os/vehicle-kpi-cards';
import { VeiculoHistoricoUnificadoTab } from '@/components/veiculo/veiculo-historico-unificado-tab';

export function VehicleHistoryPage() {
  const { codveiculo } = useParams<{ codveiculo: string }>();
  const codveiculoNum = codveiculo ? Number(codveiculo) : null;
  const [tab, setTab] = useState(0);

  const perfil = useVeiculoPerfil(codveiculoNum);
  const detail = useVehicleDetail(codveiculoNum);
  const osAtivas = useOsManutencaoAtivas(codveiculoNum);
  const historico = useHistoricoUnificado(codveiculoNum);

  if (perfil.isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Erro ao carregar veiculo {codveiculo}: {perfil.error?.message || 'Erro desconhecido'}
        </Alert>
      </Box>
    );
  }

  if (!perfil.isLoading && !perfil.data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">Veiculo {codveiculo} nao encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <VeiculoHeaderCard perfil={perfil.data} isLoading={perfil.isLoading} />

      <Box sx={{ mt: 2 }}>
        {perfil.isLoading ? (
          <Skeleton height={48} />
        ) : (
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Info />} iconPosition="start" label="Identificacao" />
            <Tab icon={<Build />} iconPosition="start" label="Manutencoes" />
            <Tab icon={<Business />} iconPosition="start" label="OS Comerciais" />
            <Tab icon={<Description />} iconPosition="start" label="Contratos" />
            <Tab icon={<Speed />} iconPosition="start" label="KPIs" />
            <Tab icon={<TimelineIcon />} iconPosition="start" label="Historico" />
          </Tabs>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && perfil.data && (
          <VeiculoIdentificacaoTab perfil={perfil.data} />
        )}

        {tab === 1 && (
          <VeiculoManutencaoAtivasTab
            items={osAtivas.data}
            isLoading={osAtivas.isLoading}
          />
        )}

        {tab === 2 && (
          <VeiculoComercialTab items={perfil.data?.osComerciais || []} />
        )}

        {tab === 3 && (
          <VeiculoContratosTab items={perfil.data?.contratos || []} />
        )}

        {tab === 4 && (
          <VehicleKpiCards kpis={detail.data?.kpis} isLoading={detail.isLoading} />
        )}

        {tab === 5 && (
          <VeiculoHistoricoUnificadoTab
            items={historico.data}
            isLoading={historico.isLoading}
          />
        )}
      </Box>
    </Box>
  );
}
