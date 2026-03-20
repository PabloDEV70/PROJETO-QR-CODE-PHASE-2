import { useState, useMemo } from 'react';
import {
  Stack, TextField, MenuItem, Select, InputAdornment,
  FormControl, InputLabel, CircularProgress, Alert, Box,
} from '@mui/material';
import { Search, BuildCircle } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { PreventivKpiBar } from '@/components/veiculo/preventiv-kpi-bar';
import { PreventivBoard } from '@/components/veiculo/preventiv-board';
import { usePreventivQuadro } from '@/hooks/use-preventivas';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ATRASADA', label: 'Atrasados' },
  { value: 'EM_DIA', label: 'Em Dia' },
  { value: 'SEM_HISTORICO', label: 'Sem Historico' },
];

export function VeiculosAcompanhamentoPage() {
  const { data, isLoading, error } = usePreventivQuadro();
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const categoriaOptions = useMemo(() => {
    if (!data) return [];
    return data.categorias;
  }, [data]);

  if (isLoading) {
    return (
      <PageLayout title="Acompanhamento de Veiculos" subtitle="Quadro de Preventivas" icon={BuildCircle}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error || !data) {
    return (
      <PageLayout title="Acompanhamento de Veiculos" subtitle="Quadro de Preventivas" icon={BuildCircle}>
        <Alert severity="error">Erro ao carregar dados de preventivas da frota.</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Acompanhamento de Veiculos" subtitle="Quadro de Preventivas" icon={BuildCircle}>
      <Stack spacing={2.5}>
        <PreventivKpiBar resumo={data.resumoGeral} />
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <TextField
            size="small"
            placeholder="Buscar por placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={categoriaFilter}
              label="Categoria"
              onChange={(e) => setCategoriaFilter(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {categoriaOptions.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <PreventivBoard
          veiculos={data.data}
          categorias={data.categorias}
          searchQuery={search}
          categoriaFilter={categoriaFilter || null}
          statusFilter={statusFilter || null}
        />
      </Stack>
    </PageLayout>
  );
}
