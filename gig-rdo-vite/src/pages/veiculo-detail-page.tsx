import { useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Alert, Box, Skeleton, Tab, Tabs } from '@mui/material';
import {
  Info, Build, Business, Description, Speed,
  Timeline as TimelineIcon, LocalGasStation, Route,
  InsertDriveFile, EventRepeat, DonutLarge,
} from '@mui/icons-material';
import {
  useVeiculoPerfil,
  useOsManutencaoAtivas,
  useVeiculoAbastecimentos,
  useVeiculoHistoricoKm,
  useVeiculoDocumentos,
  useVeiculoConsumo,
  useVeiculoPlanos,
  useVeiculoUtilizacao,
  useVeiculoHistoricoCompleto,
} from '@/hooks/use-veiculo-perfil';
import { useVehicleDetail } from '@/hooks/use-vehicle-detail';
import { VeiculoHeaderCard } from '@/components/veiculo/veiculo-header-card';
import { VeiculoIdentificacaoTab } from '@/components/veiculo/veiculo-identificacao-tab';
import { VeiculoManutencaoAtivasTab } from '@/components/veiculo/veiculo-manutencao-ativas-tab';
import { VeiculoComercialTab } from '@/components/veiculo/veiculo-comercial-tab';
import { VeiculoContratosTab } from '@/components/veiculo/veiculo-contratos-tab';
import { VehicleKpiCards } from '@/components/os/vehicle-kpi-cards';
import { VeiculoAbastecimentosTab } from '@/components/veiculo/veiculo-abastecimentos-tab';
import { VeiculoHistoricoKmTab } from '@/components/veiculo/veiculo-historico-km-tab';
import { VeiculoDocumentosTab } from '@/components/veiculo/veiculo-documentos-tab';
import { VeiculoConsumoTab } from '@/components/veiculo/veiculo-consumo-tab';
import { VeiculoPlanosTab } from '@/components/veiculo/veiculo-planos-tab';
import { VeiculoUtilizacaoTab } from '@/components/veiculo/veiculo-utilizacao-tab';
import { VeiculoHistoricoCompletoTab } from '@/components/veiculo/veiculo-historico-completo-tab';

const TAB_KEYS = [
  'utilizacao', 'identificacao', 'manutencoes', 'comerciais', 'contratos',
  'kpis', 'historico', 'abastecimentos', 'km', 'documentos', 'consumo', 'preventivos',
] as const;

function tabKeyToIndex(key: string | null): number {
  if (!key) return 0;
  const idx = TAB_KEYS.indexOf(key as typeof TAB_KEYS[number]);
  return idx >= 0 ? idx : 0;
}

export function VeiculoDetailPage() {
  const { codveiculo } = useParams<{ codveiculo: string }>();
  const codveiculoNum = codveiculo ? Number(codveiculo) : null;
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = tabKeyToIndex(searchParams.get('tab'));
  const dataInicio = searchParams.get('dataInicio') || undefined;
  const dataFim = searchParams.get('dataFim') || undefined;
  const filtroHistorico = searchParams.get('filtro') || 'TODOS';

  const setParam = useCallback((key: string, value: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value && value !== '') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setTab = useCallback((idx: number) => {
    setParam('tab', idx === 0 ? undefined : TAB_KEYS[idx]);
  }, [setParam]);

  const onPeriodChange = useCallback((ini: string, fim: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('dataInicio', ini);
      next.set('dataFim', fim);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const onFiltroChange = useCallback((f: string) => {
    setParam('filtro', f === 'TODOS' ? undefined : f);
  }, [setParam]);

  const perfil = useVeiculoPerfil(codveiculoNum);
  const detail = useVehicleDetail(codveiculoNum);
  const osAtivas = useOsManutencaoAtivas(codveiculoNum);
  const abastecimentos = useVeiculoAbastecimentos(codveiculoNum);
  const historicoKm = useVeiculoHistoricoKm(codveiculoNum);
  const documentos = useVeiculoDocumentos(codveiculoNum);
  const consumo = useVeiculoConsumo(codveiculoNum);
  const planos = useVeiculoPlanos(codveiculoNum);
  const utilizacao = useVeiculoUtilizacao(codveiculoNum, dataInicio, dataFim);
  const historicoCompleto = useVeiculoHistoricoCompleto(codveiculoNum);

  useEffect(() => {
    if (utilizacao.data && !dataInicio) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!next.has('dataInicio')) {
          next.set('dataInicio', utilizacao.data!.dataInicio);
          next.set('dataFim', utilizacao.data!.dataFim);
        }
        return next;
      }, { replace: true });
    }
  }, [utilizacao.data, dataInicio, setSearchParams]);

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
            <Tab icon={<DonutLarge />} iconPosition="start" label="Utilizacao" />
            <Tab icon={<Info />} iconPosition="start" label="Identificacao" />
            <Tab icon={<Build />} iconPosition="start" label="Manutencoes" />
            <Tab icon={<Business />} iconPosition="start" label="OS Comerciais" />
            <Tab icon={<Description />} iconPosition="start" label="Contratos" />
            <Tab icon={<Speed />} iconPosition="start" label="KPIs" />
            <Tab icon={<TimelineIcon />} iconPosition="start" label="Historico Completo" />
            <Tab icon={<LocalGasStation />} iconPosition="start" label="Abastecimentos" />
            <Tab icon={<Route />} iconPosition="start" label="KM" />
            <Tab icon={<InsertDriveFile />} iconPosition="start" label="Documentos" />
            <Tab icon={<LocalGasStation />} iconPosition="start" label="Consumo" />
            <Tab icon={<EventRepeat />} iconPosition="start" label="Preventivos" />
          </Tabs>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <VeiculoUtilizacaoTab
            data={utilizacao.data}
            isLoading={utilizacao.isLoading}
            dataInicio={dataInicio || utilizacao.data?.dataInicio || ''}
            dataFim={dataFim || utilizacao.data?.dataFim || ''}
            onPeriodChange={onPeriodChange}
            anoFabric={perfil.data?.anofabric ?? null}
            anoModelo={perfil.data?.anomod ?? null}
          />
        )}
        {tab === 1 && perfil.data && <VeiculoIdentificacaoTab perfil={perfil.data} />}
        {tab === 2 && (
          <VeiculoManutencaoAtivasTab items={osAtivas.data} isLoading={osAtivas.isLoading} />
        )}
        {tab === 3 && <VeiculoComercialTab items={perfil.data?.osComerciais || []} />}
        {tab === 4 && <VeiculoContratosTab items={perfil.data?.contratos || []} />}
        {tab === 5 && <VehicleKpiCards kpis={detail.data?.kpis} isLoading={detail.isLoading} />}
        {tab === 6 && (
          <VeiculoHistoricoCompletoTab
            items={historicoCompleto.data}
            isLoading={historicoCompleto.isLoading}
            filter={filtroHistorico}
            onFilterChange={onFiltroChange}
          />
        )}
        {tab === 7 && (
          <VeiculoAbastecimentosTab
            items={abastecimentos.data}
            isLoading={abastecimentos.isLoading}
          />
        )}
        {tab === 8 && (
          <VeiculoHistoricoKmTab items={historicoKm.data} isLoading={historicoKm.isLoading} />
        )}
        {tab === 9 && (
          <VeiculoDocumentosTab items={documentos.data} isLoading={documentos.isLoading} />
        )}
        {tab === 10 && (
          <VeiculoConsumoTab items={consumo.data} isLoading={consumo.isLoading} />
        )}
        {tab === 11 && (
          <VeiculoPlanosTab items={planos.data} isLoading={planos.isLoading} />
        )}
      </Box>
    </Box>
  );
}
