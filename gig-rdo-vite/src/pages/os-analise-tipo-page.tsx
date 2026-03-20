import { useState, useCallback } from 'react';
import { Stack, TextField, Button, Typography } from '@mui/material';
import { Build, Clear } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { OsAnaliseKpis } from '@/components/os/os-analise-kpis';
import { OsAnaliseGrid } from '@/components/os/os-analise-grid';
import { OsAnaliseDrawer } from '@/components/os/os-analise-drawer';
import { useAnaliseTipoVeiculo } from '@/hooks/use-os-analise';
import type { OsAnaliseTipoVeiculo } from '@/types/os-analise-types';

function getDefaultDates() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return {
    inicio: `${y}-${m}-01`,
    fim: `${y}-${m}-${String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`,
  };
}

export function OsAnaliseTipoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = getDefaultDates();

  const dataInicio = searchParams.get('dataInicio') || defaults.inicio;
  const dataFim = searchParams.get('dataFim') || defaults.fim;

  const { data, isLoading } = useAnaliseTipoVeiculo({ dataInicio, dataFim });

  const [selectedRow, setSelectedRow] = useState<OsAnaliseTipoVeiculo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRowClick = useCallback((tipoVeiculo: string) => {
    const row = data?.find((r) => r.tipoVeiculo === tipoVeiculo);
    if (row) {
      setSelectedRow(row);
      setDrawerOpen(true);
    }
  }, [data]);

  const handleDateChange = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      });
    },
    [setSearchParams],
  );

  const handleClear = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const totalOs = data?.reduce((s, r) => s + r.totalOs, 0) ?? 0;

  return (
    <PageLayout
      title="Analise por Tipo de Veiculo"
      subtitle="Tempo de execucao de OS por equipamento"
      icon={Build}
    >
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            type="date"
            label="Data Inicio"
            size="small"
            value={dataInicio}
            onChange={(e) => handleDateChange('dataInicio', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            label="Data Fim"
            size="small"
            value={dataFim}
            onChange={(e) => handleDateChange('dataFim', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={handleClear}
          >
            Limpar
          </Button>
          {!isLoading && (
            <Typography variant="body2" color="text.secondary">
              Total: {totalOs.toLocaleString('pt-BR')} OS
            </Typography>
          )}
        </Stack>

        <OsAnaliseKpis data={data} isLoading={isLoading} />

        <OsAnaliseGrid
          rows={data ?? []}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />
      </Stack>

      <OsAnaliseDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={selectedRow}
      />
    </PageLayout>
  );
}
