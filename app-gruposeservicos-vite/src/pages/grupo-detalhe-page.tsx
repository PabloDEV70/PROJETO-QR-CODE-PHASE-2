import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Stack, Alert, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Breadcrumbs, Link,
} from '@mui/material';
import {
  ArrowBack, AccountTree, Build, FolderOpen, Tag, Layers,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getArvoreCompleta } from '@/api/grupos';
import type { ArvoreGrupo } from '@/types/grupo-types';

function findGrupo(nodes: ArvoreGrupo[], codGrupo: number): ArvoreGrupo | null {
  for (const n of nodes) {
    if (n.codGrupoProd === codGrupo) return n;
    const found = findGrupo(n.children, codGrupo);
    if (found) return found;
  }
  return null;
}

function findBreadcrumb(nodes: ArvoreGrupo[], codGrupo: number, path: ArvoreGrupo[] = []): ArvoreGrupo[] | null {
  for (const n of nodes) {
    if (n.codGrupoProd === codGrupo) return [...path, n];
    const found = findBreadcrumb(n.children, codGrupo, [...path, n]);
    if (found) return found;
  }
  return null;
}

function countAllServicos(node: ArvoreGrupo): number {
  let total = node.servicos?.length ?? 0;
  for (const child of node.children) total += countAllServicos(child);
  return total;
}

export function GrupoDetalhePage() {
  const { codGrupo } = useParams<{ codGrupo: string }>();
  const navigate = useNavigate();
  const cod = Number(codGrupo);

  const { data: arvore, isLoading, error } = useQuery({
    queryKey: ['servicos-grupo-arvore'],
    queryFn: getArvoreCompleta,
    staleTime: 10 * 60 * 1000,
  });

  const grupo = useMemo(() => (arvore ? findGrupo(arvore, cod) : null), [arvore, cod]);
  const breadcrumb = useMemo(() => (arvore ? findBreadcrumb(arvore, cod) : null), [arvore, cod]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Erro ao carregar dados</Alert>
      </Box>
    );
  }

  if (!grupo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Grupo {cod} nao encontrado</Alert>
      </Box>
    );
  }

  const servicoCount = grupo.servicos?.length ?? 0;
  const totalServicos = countAllServicos(grupo);

  return (
    <Box sx={{ p: 3, overflow: 'auto' }}>
      {/* Back + Breadcrumb */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <IconButton size="small" onClick={() => navigate(-1)}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Breadcrumbs sx={{ fontSize: 13 }}>
          <Link
            component="button"
            underline="hover"
            color="text.secondary"
            onClick={() => navigate('/arvore')}
            sx={{ fontSize: 13 }}
          >
            Arvore
          </Link>
          {breadcrumb?.map((b, i) => {
            const isLast = i === breadcrumb.length - 1;
            return isLast ? (
              <Typography key={b.codGrupoProd} sx={{ fontSize: 13, fontWeight: 600 }}>
                {b.descrGrupoProd}
              </Typography>
            ) : (
              <Link
                key={b.codGrupoProd}
                component="button"
                underline="hover"
                color="text.secondary"
                onClick={() => navigate(`/grupo/${b.codGrupoProd}`)}
                sx={{ fontSize: 13 }}
              >
                {b.descrGrupoProd}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Stack>

      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 56, height: 56, borderRadius: '6px',
            bgcolor: 'primary.main', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FolderOpen sx={{ fontSize: 28 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            {grupo.descrGrupoProd}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
            <Chip icon={<Tag sx={{ fontSize: '14px !important' }} />} label={`Cod: ${grupo.codGrupoProd}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
            <Chip icon={<Layers sx={{ fontSize: '14px !important' }} />} label={`Grau: ${grupo.grau}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
            {grupo.codGrupoPai && grupo.codGrupoPai !== -999999999 && (
              <Chip
                label={`Pai: ${grupo.codGrupoPai}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11, cursor: 'pointer' }}
                onClick={() => navigate(`/grupo/${grupo.codGrupoPai}`)}
              />
            )}
          </Stack>
        </Box>
      </Stack>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
        <StatCard icon={<AccountTree />} label="Subgrupos" value={grupo.children.length} color="#2e7d32" />
        <StatCard icon={<Build />} label="Servicos diretos" value={servicoCount} color="#1565c0" />
        <StatCard icon={<Build />} label="Total servicos (recursivo)" value={totalServicos} color="#7b1fa2" />
      </Box>

      {/* Subgroups */}
      {grupo.children.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Subgrupos ({grupo.children.length})
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {grupo.children.map((child) => (
              <Stack
                key={child.codGrupoProd}
                direction="row"
                spacing={1}
                alignItems="center"
                onClick={() => navigate(`/grupo/${child.codGrupoProd}`)}
                sx={{
                  py: 0.6, px: 1, borderRadius: '6px', cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <FolderOpen sx={{ fontSize: 18, color: '#fbc02d' }} />
                <Typography variant="body2" sx={{ flex: 1, fontSize: 13 }}>
                  {child.descrGrupoProd}
                </Typography>
                <Chip
                  label={`${child.servicos?.length ?? 0} servicos`}
                  size="small"
                  sx={{ height: 20, fontSize: 11 }}
                />
                <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                  {child.codGrupoProd}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Services Table */}
      {servicoCount > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Servicos ({servicoCount})
          </Typography>
          <TableContainer sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Codigo</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Descricao</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="right">Utilizacoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grupo.servicos!.map((s) => (
                  <TableRow key={s.codProd} hover>
                    <TableCell sx={{ fontSize: 12, fontFamily: 'monospace', color: 'text.secondary' }}>
                      {s.codProd}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{s.descrProd}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={s.utilizacoes}
                        size="small"
                        sx={{
                          height: 20, fontSize: 11, fontWeight: 600,
                          bgcolor: s.utilizacoes > 0 ? 'success.light' : 'action.hover',
                          color: s.utilizacoes > 0 ? 'success.dark' : 'text.disabled',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {servicoCount === 0 && grupo.children.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            Este grupo nao possui servicos nem subgrupos
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 40, height: 40, borderRadius: '6px',
          bgcolor: `${color}14`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    </Paper>
  );
}
