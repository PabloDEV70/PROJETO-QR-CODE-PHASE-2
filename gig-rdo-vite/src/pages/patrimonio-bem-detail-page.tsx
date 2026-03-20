import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Stack, Tabs, Tab, Alert } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';

import { PageLayout } from '@/components/layout/page-layout';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { PatrimonioHeaderCard } from '@/components/patrimonio/patrimonio-header-card';
import { PatrimonioResumoTab } from '@/components/patrimonio/patrimonio-resumo-tab';
import { PatrimonioMobilizacaoTab } from '@/components/patrimonio/patrimonio-mobilizacao-tab';
import { PatrimonioDepreciacaoTab } from '@/components/patrimonio/patrimonio-depreciacao-tab';
import { PatrimonioLocalizacaoTab } from '@/components/patrimonio/patrimonio-localizacao-tab';
import { PatrimonioDocumentosTab } from '@/components/patrimonio/patrimonio-documentos-tab';
import { PatrimonioHistoricoOsTab } from '@/components/patrimonio/patrimonio-historico-os-tab';
import { PatrimonioComissionamentoTab } from '@/components/patrimonio/patrimonio-comissionamento-tab';
import { usePatrimonioBemDetalhe } from '@/hooks/use-patrimonio-bem-detalhe';

const TAB_KEYS = [
  'resumo', 'mobilizacao', 'depreciacao', 'localizacao',
  'documentos', 'historico-os', 'comissionamento',
] as const;

const TAB_LABELS = [
  'Resumo', 'Mobilizacao', 'Depreciacao', 'Localizacao',
  'Documentos', 'Historico OS', 'Comissionamento',
];

export function PatrimonioBemDetailPage() {
  const { codbem = '' } = useParams<{ codbem: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabKey = searchParams.get('tab') || 'resumo';
  const tabIndex = Math.max(0, TAB_KEYS.indexOf(tabKey as (typeof TAB_KEYS)[number]));
  const codprodParam = searchParams.get('codprod');
  const codprod = codprodParam ? Number(codprodParam) : undefined;

  const bemQuery = usePatrimonioBemDetalhe(codbem, codprod);

  const setTab = useCallback((idx: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (idx === 0) {
        next.delete('tab');
      } else {
        next.set('tab', TAB_KEYS[idx] ?? 'resumo');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  if (bemQuery.isLoading) return <LoadingSkeleton rows={6} height={60} />;
  if (bemQuery.error) return <Alert severity="error">Erro ao carregar bem: {codbem}</Alert>;

  const bem = bemQuery.data;
  if (!bem) return <Alert severity="warning">Bem nao encontrado: {codbem}</Alert>;

  return (
    <PageLayout
      title={bem.tag || bem.codbem}
      subtitle={bem.descricaoAbreviada || ''}
      icon={AccountBalance}
    >
      <Stack spacing={2.5}>
        <PatrimonioHeaderCard bem={bem} />

        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TAB_LABELS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>

        {tabIndex === 0 && <PatrimonioResumoTab bem={bem} />}
        {tabIndex === 1 && <PatrimonioMobilizacaoTab codbem={codbem} bem={bem} />}
        {tabIndex === 2 && <PatrimonioDepreciacaoTab codbem={codbem} />}
        {tabIndex === 3 && <PatrimonioLocalizacaoTab codbem={codbem} />}
        {tabIndex === 4 && <PatrimonioDocumentosTab codbem={codbem} />}
        {tabIndex === 5 && <PatrimonioHistoricoOsTab codbem={codbem} />}
        {tabIndex === 6 && <PatrimonioComissionamentoTab codbem={codbem} />}
      </Stack>
    </PageLayout>
  );
}
