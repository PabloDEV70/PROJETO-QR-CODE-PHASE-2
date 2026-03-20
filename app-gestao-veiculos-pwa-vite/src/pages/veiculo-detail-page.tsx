import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Skeleton, Tab, Tabs } from '@mui/material';
import {
  Info, Build, Business, Description, LocalGasStation,
  Route, InsertDriveFile, EventRepeat, Timeline as TimelineIcon,
  Assignment,
} from '@mui/icons-material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import {
  useVeiculoPerfil, useOsManutencaoAtivas,
  useVeiculoAbastecimentos, useVeiculoHistoricoKm,
  useVeiculoDocumentos, useVeiculoConsumo,
  useVeiculoPlanos, useVeiculoHistoricoCompleto,
} from '@/hooks/use-veiculo-perfil';
import { VeiculoDetailHeader } from '@/components/veiculos/veiculo-detail-header';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { VeiculoSituacoesTab } from '@/components/veiculo/veiculo-situacoes-tab';
import { VeiculoIdentificacaoTab } from '@/components/veiculo/veiculo-identificacao-tab';
import { VeiculoManutencaoTab } from '@/components/veiculo/veiculo-manutencao-tab';
import { VeiculoComercialTab } from '@/components/veiculo/veiculo-comercial-tab';
import { VeiculoContratosTab } from '@/components/veiculo/veiculo-contratos-tab';
import { VeiculoHistoricoCompletoTab } from '@/components/veiculo/veiculo-historico-completo-tab';
import { VeiculoAbastecimentosTab } from '@/components/veiculo/veiculo-abastecimentos-tab';
import { VeiculoHistoricoKmTab } from '@/components/veiculo/veiculo-historico-km-tab';
import { VeiculoDocumentosTab } from '@/components/veiculo/veiculo-documentos-tab';
import { VeiculoConsumoTab } from '@/components/veiculo/veiculo-consumo-tab';
import { VeiculoPlanosTab } from '@/components/veiculo/veiculo-planos-tab';

const TAB_KEYS = [
  'situacoes', 'ficha', 'manut', 'comercial', 'contratos',
  'historico', 'abastec', 'km', 'docs', 'consumo', 'prevent',
] as const;

function tabKeyToIndex(key: string | null): number {
  if (!key) return 0;
  const idx = TAB_KEYS.indexOf(key as typeof TAB_KEYS[number]);
  return idx >= 0 ? idx : 0;
}

export function VeiculoDetailPage() {
  const { codveiculo } = useParams<{ codveiculo: string }>();
  const codv = Number(codveiculo);
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = tabKeyToIndex(searchParams.get('tab'));

  const setTab = useCallback((idx: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (idx === 0) { next.delete('tab'); } else { next.set('tab', TAB_KEYS[idx] ?? 'situacoes'); }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const { data: painel, isLoading: loadingPainel } = useHstVeiPainel();
  const veiculo = painel?.veiculos.find((v) => v.codveiculo === codv);

  const perfil = useVeiculoPerfil(codv > 0 ? codv : null);
  const osAtivas = useOsManutencaoAtivas(tab === 2 ? codv : null);
  const abastecimentos = useVeiculoAbastecimentos(tab === 6 ? codv : null);
  const historicoKm = useVeiculoHistoricoKm(tab === 7 ? codv : null);
  const documentos = useVeiculoDocumentos(tab === 8 ? codv : null);
  const consumo = useVeiculoConsumo(tab === 9 ? codv : null);
  const planos = useVeiculoPlanos(tab === 10 ? codv : null);
  const historicoCompleto = useVeiculoHistoricoCompleto(tab === 5 ? codv : null);

  if (loadingPainel && !veiculo && !perfil.data) return <LoadingSkeleton />;
  if (!veiculo && !perfil.data && !perfil.isLoading) return <EmptyState message="Veiculo nao encontrado" />;

  return (
    <>
      <VeiculoDetailHeader veiculo={veiculo} perfil={perfil.data} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          mx: -2,
          px: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 44,
            minWidth: 44,
            py: 1,
            px: 1.5,
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'none',
            gap: 0.5,
          },
          '& .Mui-selected': { color: 'primary.main' },
          '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
        }}
      >
        <Tab icon={<Assignment sx={{ fontSize: 18 }} />} label="Situacoes" />
        <Tab icon={<Info sx={{ fontSize: 18 }} />} label="Ficha" />
        <Tab icon={<Build sx={{ fontSize: 18 }} />} label="Manut" />
        <Tab icon={<Business sx={{ fontSize: 18 }} />} label="Comercial" />
        <Tab icon={<Description sx={{ fontSize: 18 }} />} label="Contratos" />
        <Tab icon={<TimelineIcon sx={{ fontSize: 18 }} />} label="Historico" />
        <Tab icon={<LocalGasStation sx={{ fontSize: 18 }} />} label="Abastec" />
        <Tab icon={<Route sx={{ fontSize: 18 }} />} label="KM" />
        <Tab icon={<InsertDriveFile sx={{ fontSize: 18 }} />} label="Docs" />
        <Tab icon={<LocalGasStation sx={{ fontSize: 18 }} />} label="Consumo" />
        <Tab icon={<EventRepeat sx={{ fontSize: 18 }} />} label="Prevent" />
      </Tabs>

      <Box sx={{ pb: 4 }}>
        {tab === 0 && <VeiculoSituacoesTab codveiculo={codv} veiculo={veiculo} />}
        {tab === 1 && (perfil.isLoading ? <Skeleton height={200} /> : perfil.data ? <VeiculoIdentificacaoTab perfil={perfil.data} /> : null)}
        {tab === 2 && <VeiculoManutencaoTab items={osAtivas.data} isLoading={osAtivas.isLoading} />}
        {tab === 3 && <VeiculoComercialTab items={perfil.data?.osComerciais ?? []} />}
        {tab === 4 && <VeiculoContratosTab items={perfil.data?.contratos ?? []} />}
        {tab === 5 && <VeiculoHistoricoCompletoTab items={historicoCompleto.data} isLoading={historicoCompleto.isLoading} />}
        {tab === 6 && <VeiculoAbastecimentosTab items={abastecimentos.data} isLoading={abastecimentos.isLoading} />}
        {tab === 7 && <VeiculoHistoricoKmTab items={historicoKm.data} isLoading={historicoKm.isLoading} />}
        {tab === 8 && <VeiculoDocumentosTab items={documentos.data} isLoading={documentos.isLoading} />}
        {tab === 9 && <VeiculoConsumoTab items={consumo.data} isLoading={consumo.isLoading} />}
        {tab === 10 && <VeiculoPlanosTab items={planos.data} isLoading={planos.isLoading} />}
      </Box>
    </>
  );
}
