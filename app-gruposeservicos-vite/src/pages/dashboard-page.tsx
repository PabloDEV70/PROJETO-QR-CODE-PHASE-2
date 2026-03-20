import { useMemo } from 'react';
import {
  Box, Typography, CircularProgress, Stack, Alert, Paper, Chip,
} from '@mui/material';
import {
  AccountTree, Build, FolderOff, TrendingUp,
  Layers, Category,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getArvoreCompleta } from '@/api/grupos';
import type { ArvoreGrupo, ServicoItem } from '@/types/grupo-types';

interface Stats {
  totalGrupos: number;
  totalServicos: number;
  gruposRaiz: number;
  gruposSemServicos: number;
  gruposSemFilhos: number;
  maxDepth: number;
  topServicos: ServicoItem[];
  topGrupos: { nome: string; cod: number; count: number }[];
  gruposVazios: { nome: string; cod: number }[];
  distribuicaoPorGrau: { grau: number; count: number }[];
}

function collectStats(arvore: ArvoreGrupo[]): Stats {
  let totalGrupos = 0;
  let totalServicos = 0;
  let gruposSemServicos = 0;
  let gruposSemFilhos = 0;
  let maxDepth = 0;

  const allServicos: ServicoItem[] = [];
  const grupoCountMap: { nome: string; cod: number; count: number }[] = [];
  const vazios: { nome: string; cod: number }[] = [];
  const grauMap = new Map<number, number>();

  function walk(nodes: ArvoreGrupo[]) {
    for (const n of nodes) {
      totalGrupos++;
      const sCount = n.servicos?.length ?? 0;
      totalServicos += sCount;
      if (n.grau > maxDepth) maxDepth = n.grau;

      grauMap.set(n.grau, (grauMap.get(n.grau) ?? 0) + 1);

      if (n.servicos) {
        for (const s of n.servicos) allServicos.push(s);
      }

      grupoCountMap.push({ nome: n.descrGrupoProd, cod: n.codGrupoProd, count: sCount });

      if (sCount === 0 && n.children.length === 0) {
        gruposSemFilhos++;
        vazios.push({ nome: n.descrGrupoProd, cod: n.codGrupoProd });
      }
      if (sCount === 0) gruposSemServicos++;

      walk(n.children);
    }
  }

  walk(arvore);

  allServicos.sort((a, b) => b.utilizacoes - a.utilizacoes);
  grupoCountMap.sort((a, b) => b.count - a.count);

  const distribuicaoPorGrau = Array.from(grauMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([grau, count]) => ({ grau, count }));

  return {
    totalGrupos,
    totalServicos,
    gruposRaiz: arvore.length,
    gruposSemServicos,
    gruposSemFilhos,
    maxDepth,
    topServicos: allServicos.slice(0, 10),
    topGrupos: grupoCountMap.filter((g) => g.count > 0).slice(0, 10),
    gruposVazios: vazios.slice(0, 10),
    distribuicaoPorGrau,
  };
}

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: arvore, isLoading, error } = useQuery({
    queryKey: ['servicos-grupo-arvore'],
    queryFn: getArvoreCompleta,
    staleTime: 10 * 60 * 1000,
  });

  const stats = useMemo(() => (arvore ? collectStats(arvore) : null), [arvore]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Carregando dados...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erro ao carregar dados: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, overflow: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <KpiCard
          icon={<AccountTree />}
          label="Total Grupos"
          value={stats.totalGrupos}
          color="#2e7d32"
        />
        <KpiCard
          icon={<Build />}
          label="Total Servicos"
          value={stats.totalServicos}
          color="#1565c0"
        />
        <KpiCard
          icon={<Category />}
          label="Grupos Raiz"
          value={stats.gruposRaiz}
          color="#7b1fa2"
        />
        <KpiCard
          icon={<Layers />}
          label="Profundidade Max"
          value={stats.maxDepth}
          color="#e65100"
        />
        <KpiCard
          icon={<FolderOff />}
          label="Grupos Vazios"
          value={stats.gruposSemFilhos}
          color="#c62828"
          subtitle="sem servicos nem subgrupos"
        />
        <KpiCard
          icon={<TrendingUp />}
          label="Com Servicos"
          value={stats.totalGrupos - stats.gruposSemServicos}
          color="#00695c"
          subtitle={`de ${stats.totalGrupos} grupos`}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        {/* Distribution by depth */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Distribuicao por Grau (profundidade)
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {stats.distribuicaoPorGrau.map((d) => {
              const pct = Math.round((d.count / stats.totalGrupos) * 100);
              return (
                <Box key={d.grau}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                      Grau {d.grau}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {d.count} ({pct}%)
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%', borderRadius: 3, bgcolor: 'primary.main',
                        width: `${pct}%`, transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Paper>

        {/* Top Groups by service count */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Top 10 Grupos (por qtd servicos)
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {stats.topGrupos.map((g, i) => (
              <Stack
                key={g.cod}
                direction="row"
                spacing={1}
                alignItems="center"
                onClick={() => navigate(`/grupo/${g.cod}`)}
                sx={{
                  py: 0.6, px: 1, borderRadius: '6px', cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: 'text.disabled', width: 20, textAlign: 'right' }}
                >
                  {i + 1}.
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, fontSize: 13 }}>
                  {g.nome}
                </Typography>
                <Chip label={g.count} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700 }} />
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* Top Services */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Top 10 Servicos (mais utilizados)
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {stats.topServicos.map((s, i) => (
              <Stack
                key={s.codProd}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ py: 0.5, px: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: 'text.disabled', width: 20, textAlign: 'right' }}
                >
                  {i + 1}.
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: 13 }}>{s.descrProd}</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                    #{s.codProd}
                  </Typography>
                </Box>
                <Chip
                  label={s.utilizacoes}
                  size="small"
                  sx={{
                    height: 20, fontSize: 11, fontWeight: 700,
                    bgcolor: 'success.light', color: 'success.dark',
                  }}
                />
              </Stack>
            ))}
            {stats.topServicos.length === 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                Nenhum servico com utilizacoes
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Empty Groups */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Grupos Vazios (sem servicos nem subgrupos)
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {stats.gruposVazios.map((g) => (
              <Stack
                key={g.cod}
                direction="row"
                spacing={1}
                alignItems="center"
                onClick={() => navigate(`/grupo/${g.cod}`)}
                sx={{
                  py: 0.5, px: 1, borderRadius: '6px', cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <FolderOff sx={{ fontSize: 16, color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ flex: 1, fontSize: 13 }}>{g.nome}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                  {g.cod}
                </Typography>
              </Stack>
            ))}
            {stats.gruposVazios.length === 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                Nenhum grupo vazio
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

function KpiCard({ icon, label, value, color, subtitle }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  subtitle?: string;
}) {
  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 44, height: 44, borderRadius: '6px',
          bgcolor: `${color}14`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1 }}>
          {value.toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 10 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
