import { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment,
  CircularProgress, Stack, Chip, Alert,
} from '@mui/material';
import { Search, AccountTree, Inventory2 } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getArvoreCompleta } from '@/api/grupos';
import type { ArvoreGrupo } from '@/types/grupo-types';
import { GrupoTreeNode } from '@/components/grupos/grupo-tree-node';
import { GrupoDetailPanel } from '@/components/grupos/grupo-detail-panel';

function countNodes(nodes: ArvoreGrupo[]): { grupos: number; servicos: number } {
  let grupos = 0;
  let servicos = 0;
  for (const n of nodes) {
    grupos++;
    servicos += n.servicos?.length ?? 0;
    const sub = countNodes(n.children);
    grupos += sub.grupos;
    servicos += sub.servicos;
  }
  return { grupos, servicos };
}

function filterTree(nodes: ArvoreGrupo[], query: string): ArvoreGrupo[] {
  if (!query) return nodes;
  const q = query.toLowerCase();

  return nodes.reduce<ArvoreGrupo[]>((acc, node) => {
    const nameMatch = node.descrGrupoProd.toLowerCase().includes(q);
    const codeMatch = String(node.codGrupoProd).includes(q);
    const servicoMatch = node.servicos?.some(
      (s) => s.descrProd.toLowerCase().includes(q) || String(s.codProd).includes(q),
    );
    const filteredChildren = filterTree(node.children, query);

    if (nameMatch || codeMatch || servicoMatch || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren,
        servicos: servicoMatch
          ? node.servicos?.filter(
              (s) => s.descrProd.toLowerCase().includes(q) || String(s.codProd).includes(q),
            )
          : node.servicos,
      });
    }
    return acc;
  }, []);
}

export function ArvorePage() {
  const [search, setSearch] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState<ArvoreGrupo | null>(null);

  const { data: arvore, isLoading, error } = useQuery({
    queryKey: ['servicos-grupo-arvore'],
    queryFn: getArvoreCompleta,
    staleTime: 10 * 60 * 1000,
  });

  const filtered = useMemo(
    () => (arvore ? filterTree(arvore, search.trim()) : []),
    [arvore, search],
  );

  const stats = useMemo(
    () => (arvore ? countNodes(arvore) : { grupos: 0, servicos: 0 }),
    [arvore],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Carregando arvore de grupos...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erro ao carregar grupos: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* Left panel — tree */}
      <Box
        sx={{
          width: selectedGrupo ? '50%' : '100%',
          transition: 'width 0.2s',
          display: 'flex',
          flexDirection: 'column',
          borderRight: selectedGrupo ? '1px solid' : 'none',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <AccountTree sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>
              Grupos e Servicos
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Chip
              icon={<AccountTree sx={{ fontSize: '14px !important' }} />}
              label={`${stats.grupos} grupos`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Inventory2 sx={{ fontSize: '14px !important' }} />}
              label={`${stats.servicos} servicos`}
              size="small"
              variant="outlined"
            />
          </Stack>

          <TextField
            placeholder="Buscar grupo ou servico..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 20, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {search ? 'Nenhum resultado encontrado' : 'Nenhum grupo encontrado'}
              </Typography>
            </Box>
          ) : (
            filtered.map((grupo) => (
              <GrupoTreeNode
                key={grupo.codGrupoProd}
                node={grupo}
                depth={0}
                selectedId={selectedGrupo?.codGrupoProd ?? null}
                onSelect={setSelectedGrupo}
                defaultExpanded={!!search}
              />
            ))
          )}
        </Box>
      </Box>

      {/* Right panel — detail */}
      {selectedGrupo && (
        <GrupoDetailPanel
          grupo={selectedGrupo}
          onClose={() => setSelectedGrupo(null)}
        />
      )}
    </Box>
  );
}
