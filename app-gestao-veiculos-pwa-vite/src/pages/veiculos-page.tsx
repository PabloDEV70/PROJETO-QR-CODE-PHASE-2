import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip, alpha, useTheme } from '@mui/material';
import {
  DirectionsCar, Warning, Schedule, CheckCircle,
} from '@mui/icons-material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { VeiculoSearchBar } from '@/components/veiculos/veiculo-search-bar';
import { VeiculoListItem } from '@/components/veiculos/veiculo-list-item';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

type SortMode = 'prioridade' | 'previsao' | 'nome';

export function VeiculosPage() {
  const { data: painel, isLoading } = useHstVeiPainel();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('prioridade');
  const theme = useTheme();

  const filtered = useMemo(() => {
    if (!painel?.veiculos) return [];
    const q = search.toLowerCase();
    let list = painel.veiculos;
    if (q) {
      list = list.filter((v) =>
        v.placa.toLowerCase().includes(q)
        || v.tag?.toLowerCase().includes(q)
        || v.marcaModelo?.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sort === 'prioridade') {
        const pa = a.prioridadeMaxima ?? 99;
        const pb = b.prioridadeMaxima ?? 99;
        return pa - pb || b.totalSituacoes - a.totalSituacoes;
      }
      if (sort === 'previsao') {
        const da = a.previsaoMaisProxima ?? '9999';
        const db = b.previsaoMaisProxima ?? '9999';
        return da.localeCompare(db);
      }
      return a.placa.localeCompare(b.placa);
    });
  }, [painel, search, sort]);

  if (isLoading) return <LoadingSkeleton />;

  // Stats
  const total = painel?.totalVeiculos ?? 0;
  const totalSit = painel?.totalSituacoesAtivas ?? 0;
  const urgentes = painel?.veiculos.reduce(
    (acc, v) => acc + v.situacoesAtivas.filter((s) => s.idpri === 0).length, 0,
  ) ?? 0;
  const atrasados = painel?.veiculos.reduce(
    (acc, v) => acc + v.situacoesAtivas.filter((s) => {
      if (!s.dtprevisao) return false;
      return new Date(s.dtprevisao.replace(' ', 'T')) < new Date();
    }).length, 0,
  ) ?? 0;

  return (
    <>
      {/* Summary cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          mb: 2,
        }}
      >
        <StatMini
          icon={<DirectionsCar sx={{ fontSize: 18 }} />}
          value={total}
          label="Veiculos"
          color={theme.palette.primary.main}
        />
        <StatMini
          icon={<CheckCircle sx={{ fontSize: 18 }} />}
          value={totalSit}
          label="Situacoes"
          color={theme.palette.secondary.main}
        />
        <StatMini
          icon={<Warning sx={{ fontSize: 18 }} />}
          value={urgentes}
          label="Urgentes"
          color="#f44336"
        />
        <StatMini
          icon={<Schedule sx={{ fontSize: 18 }} />}
          value={atrasados}
          label="Atrasados"
          color="#ff9800"
        />
      </Box>

      <VeiculoSearchBar value={search} onChange={setSearch} />

      {/* Sort chips */}
      <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5 }}>
        {([
          { key: 'prioridade', label: 'Prioridade' },
          { key: 'previsao', label: 'Previsao' },
          { key: 'nome', label: 'Placa' },
        ] as const).map(({ key, label }) => (
          <Chip
            key={key}
            label={label}
            size="small"
            variant={sort === key ? 'filled' : 'outlined'}
            onClick={() => setSort(key)}
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 28,
              ...(sort === key
                ? { bgcolor: 'primary.main', color: '#fff' }
                : { color: 'text.secondary' }),
            }}
          />
        ))}
        <Typography
          variant="caption"
          sx={{ ml: 'auto', color: 'text.disabled', alignSelf: 'center' }}
        >
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {filtered.length === 0 ? (
        <EmptyState message="Nenhum veiculo com situacoes ativas" />
      ) : (
        filtered.map((v) => <VeiculoListItem key={v.codveiculo} veiculo={v} />)
      )}
    </>
  );
}

/* ── Mini stat card ── */
function StatMini({ icon, value, label, color }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <Paper
      sx={{
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.25,
        bgcolor: alpha(color, 0.06),
        borderColor: alpha(color, 0.15),
      }}
    >
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1, color }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 600, textAlign: 'center' }}>
        {label}
      </Typography>
    </Paper>
  );
}
