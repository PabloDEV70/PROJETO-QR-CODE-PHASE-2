import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stack, Tabs, Tab } from '@mui/material';
import { LocalShipping } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { PatrimonioMobilizacaoClientes } from '@/components/patrimonio/patrimonio-mobilizacao-clientes';
import { PatrimonioMobilizacaoVeiculos } from '@/components/patrimonio/patrimonio-mobilizacao-veiculos';
import {
  usePatrimonioMobilizacao,
  usePatrimonioMobilizacaoVeiculos,
} from '@/hooks/use-patrimonio-mobilizacao';

const VIEWS = ['clientes', 'veiculos'] as const;

export function PatrimonioMobilizacaoPage() {
  const [sp, setSp] = useSearchParams();
  const view = sp.get('view') || 'clientes';
  const tabIdx = Math.max(0, VIEWS.indexOf(view as (typeof VIEWS)[number]));
  const clientesQuery = usePatrimonioMobilizacao();
  const veiculosQuery = usePatrimonioMobilizacaoVeiculos();

  const setView = useCallback(
    (idx: number) => {
      setSp(
        (prev) => {
          const n = new URLSearchParams(prev);
          n.set('view', VIEWS[idx] ?? 'clientes');
          return n;
        },
        { replace: true },
      );
    },
    [setSp],
  );

  return (
    <PageLayout title="Mobilizacao" subtitle="Veiculos em clientes" icon={LocalShipping}>
      <Stack spacing={2.5}>
        <Tabs value={tabIdx} onChange={(_, v) => setView(v)}>
          <Tab label="Por Cliente" />
          <Tab label="Por Veiculo" />
        </Tabs>
        {tabIdx === 0 && (
          <PatrimonioMobilizacaoClientes
            data={clientesQuery.data}
            isLoading={clientesQuery.isLoading}
          />
        )}
        {tabIdx === 1 && (
          <PatrimonioMobilizacaoVeiculos
            data={veiculosQuery.data}
            isLoading={veiculosQuery.isLoading}
          />
        )}
      </Stack>
    </PageLayout>
  );
}
