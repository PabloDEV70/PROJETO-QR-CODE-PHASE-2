import Grid from '@mui/material/Grid';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BuildIcon from '@mui/icons-material/Build';
import { StatCard } from '@/components/shared/stat-card';
import type { RdoMetricas } from '@/types/rdo-types';
import { prodColor } from '@/utils/produtividade-utils';
import { formatMinutos as fmtMin } from '@/utils/hora-utils';

interface Props {
  m: RdoMetricas;
}

export function RdoStatsRow({ m }: Props) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          icon={<AccessTimeIcon fontSize="small" />}
          label="Horas"
          value={fmtMin(m.tempoNoTrabalho)}
          subtitle={m.primeiraHora && m.ultimaHora ? `${m.primeiraHora} – ${m.ultimaHora}` : undefined}
          color="#3B82F6"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          icon={<ListAltIcon fontSize="small" />}
          label="Atividades"
          value={m.totalItens}
          subtitle={`${fmtMin(m.minutosProdu)} produtivo`}
          color="primary.main"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          icon={<TrendingUpIcon fontSize="small" />}
          label="Produtividade"
          value={`${m.produtividadePercent}%`}
          subtitle={m.atingiuMeta ? 'Na meta' : 'Abaixo da meta'}
          color={m.diagnosticoFaixa?.faixa.color ?? prodColor(m.produtividadePercent)}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          icon={<BuildIcon fontSize="small" />}
          label="OS"
          value={m.qtdOs}
          subtitle={m.veiculoPlaca ? `${m.veiculoPlaca}` : undefined}
          color="#8B5CF6"
        />
      </Grid>
    </Grid>
  );
}
