import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Box, Typography,
  CircularProgress, Stack, Alert, Chip,
  ToggleButtonGroup, ToggleButton, LinearProgress,
} from '@mui/material';
import {
  WarningAmber, Folder, FolderOpen,
  CheckCircle, Cancel, ChevronRight,
  ViewColumn, ExpandMore,
} from '@mui/icons-material';
import { DataGrid, type GridColDef, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getArvoreCompleta } from '@/api/grupos';
import type { ArvoreGrupo } from '@/types/grupo-types';

// ── Helpers ──

function countNodeUsage(node: ArvoreGrupo): { total: number; naoUsados: number } {
  let total = node.servicos?.length ?? 0;
  let naoUsados = node.servicos?.filter((s) => s.utilizacoes === 0).length ?? 0;
  for (const child of node.children) {
    const sub = countNodeUsage(child);
    total += sub.total;
    naoUsados += sub.naoUsados;
  }
  return { total, naoUsados };
}

function countAll(nodes: ArvoreGrupo[]): { total: number; naoUsados: number } {
  let total = 0;
  let naoUsados = 0;
  for (const n of nodes) {
    const sub = countNodeUsage(n);
    total += sub.total;
    naoUsados += sub.naoUsados;
  }
  return { total, naoUsados };
}

function buildPathTo(arvore: ArvoreGrupo[], targetCod: number, current: number[] = []): number[] | null {
  for (const n of arvore) {
    if (n.codGrupoProd === targetCod) return [...current, targetCod];
    const sub = buildPathTo(n.children, targetCod, [...current, n.codGrupoProd]);
    if (sub) return sub;
  }
  return null;
}

type ServicoFilter = 'todos' | 'sem-uso' | 'em-uso';

// ── URL State ──

function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pathStr = searchParams.get('caminho') || '';
  const path = pathStr ? pathStr.split(',').map(Number).filter(Boolean) : [];
  const servicoFilter = (searchParams.get('filtro') as ServicoFilter) || 'todos';
  const search = searchParams.get('busca') || '';

  const update = useCallback((updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === '') next.delete(key);
        else next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return {
    path, servicoFilter, search,
    setPath: (p: number[]) => update({ caminho: p.length > 0 ? p.join(',') : null }),
    setServicoFilter: (f: ServicoFilter) => update({ filtro: f === 'todos' ? null : f }),
    setSearch: (s: string) => update({ busca: s || null }),
  };
}

// ── Sidebar Tree Node (hierarchical, like a file manager sidebar) ──

function SidebarTreeNode({ node, depth, selectedId, selectedPath, onSelect, indexLabel }: {
  node: ArvoreGrupo;
  depth: number;
  selectedId: number | null;
  selectedPath: number[];
  onSelect: (node: ArvoreGrupo) => void;
  indexLabel: string;
}) {
  const isInPath = selectedPath.includes(node.codGrupoProd);
  const [expanded, setExpanded] = useState(depth < 1 || isInPath);

  useEffect(() => {
    if (isInPath && !expanded) setExpanded(true);
  }, [isInPath]);
  const hasChildren = node.children.length > 0;
  const { total, naoUsados } = countNodeUsage(node);
  const directTotal = node.servicos?.length ?? 0;
  const directNaoUsados = node.servicos?.filter((s) => s.utilizacoes === 0).length ?? 0;
  const isSelected = selectedId === node.codGrupoProd;
  const pct = total > 0 ? Math.round((naoUsados / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <Box>
      <Box
        onClick={() => { onSelect(node); if (hasChildren && !expanded) setExpanded(true); }}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.8,
          py: 0.7, px: 1.2, pl: 1.2 + depth * 2,
          cursor: 'pointer', borderRadius: '4px', mx: 0.5, mb: 0.3,
          bgcolor: isSelected ? 'primary.main' : 'transparent',
          color: isSelected ? 'primary.contrastText' : 'text.primary',
          '&:hover': { bgcolor: isSelected ? 'primary.dark' : 'action.hover' },
          transition: 'background-color 0.1s',
        }}
      >
        {/* Expand/collapse */}
        {hasChildren ? (
          <Box
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            sx={{ display: 'flex', alignItems: 'center', color: isSelected ? 'inherit' : 'text.secondary', flexShrink: 0 }}
          >
            {expanded ? <ExpandMore sx={{ fontSize: 20 }} /> : <ChevronRight sx={{ fontSize: 20 }} />}
          </Box>
        ) : (
          <Box sx={{ width: 20, flexShrink: 0 }} />
        )}

        {/* Icon */}
        {expanded && hasChildren
          ? <FolderOpen sx={{ fontSize: 20, flexShrink: 0, color: isSelected ? 'inherit' : '#f9a825' }} />
          : <Folder sx={{ fontSize: 20, flexShrink: 0, color: isSelected ? 'inherit' : naoUsados > 0 ? '#ed6c02' : '#66bb6a' }} />}

        {/* Index label (grau hierarquico) */}
        <Typography
          sx={{
            fontSize: 11, fontFamily: 'monospace', fontWeight: 700, flexShrink: 0,
            color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
            minWidth: depth === 0 ? 22 : depth === 1 ? 42 : 58,
          }}
        >
          {indexLabel}
        </Typography>

        {/* Name */}
        <Typography
          sx={{
            fontSize: 13, fontWeight: isSelected ? 700 : hasChildren ? 600 : 400,
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {node.descrGrupoProd}
        </Typography>

        {/* Usage stats */}
        {directTotal > 0 && (
          <Stack direction="row" spacing={0.3} alignItems="center" sx={{ flexShrink: 0 }}>
            {directNaoUsados > 0 && (
              <Chip
                label={directNaoUsados}
                size="small"
                sx={{
                  height: 20, fontSize: 11, fontWeight: 700, minWidth: 26,
                  bgcolor: isSelected ? 'rgba(255,255,255,0.25)' : pct >= 80 ? 'error.light' : pct >= 50 ? 'warning.light' : 'action.hover',
                  color: isSelected ? 'inherit' : pct >= 80 ? 'error.dark' : pct >= 50 ? 'warning.dark' : 'text.secondary',
                }}
              />
            )}
            <Typography sx={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.6)' : 'text.disabled' }}>
              /{directTotal}
            </Typography>
          </Stack>
        )}

        {/* Recursive count for parents */}
        {hasChildren && total > directTotal && (
          <Typography sx={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.5)' : 'text.disabled', flexShrink: 0, fontWeight: 500 }}>
            ({naoUsados}/{total})
          </Typography>
        )}
      </Box>

      {/* Children */}
      {hasChildren && expanded && (
        <Box>
          {node.children.filter((c) => countNodeUsage(c).total > 0).map((child, i) => (
            <SidebarTreeNode
              key={child.codGrupoProd}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              selectedPath={selectedPath}
              onSelect={onSelect}
              indexLabel={`${indexLabel}.${String(i + 1).padStart(depth >= 1 ? 3 : 2, '0')}`}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── Service DataGrid column (final column) ──

interface ServiceGridRow {
  id: number;
  codProd: number;
  descrProd: string;
  utilizacoes: number;
  status: 'Em uso' | 'Sem uso';
}

function CustomToolbar({ grupo, stats }: {
  grupo: ArvoreGrupo;
  stats: { total: number; semUso: number; emUso: number; pct: number };
}) {
  return (
    <GridToolbarContainer sx={{ px: 1.5, py: 0.8, gap: 0.8, flexWrap: 'wrap' }}>
      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <FolderOpen sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
            {grupo.descrGrupoProd}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography sx={{ fontSize: 10, color: 'text.disabled', fontFamily: 'monospace' }}>
              Cod: {grupo.codGrupoProd}
            </Typography>
            <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
              Grau: {grupo.grau}
            </Typography>
            <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
              {grupo.analitico === 'S' ? 'Analitico' : 'Sintetico'}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center">
        <Chip label={`${stats.total} servicos`} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
        <Chip
          icon={<Cancel sx={{ fontSize: '12px !important' }} />}
          label={`${stats.semUso} sem uso`}
          size="small"
          sx={{ fontSize: 10, height: 20, bgcolor: 'error.light', color: 'error.dark', '& .MuiChip-icon': { color: 'error.dark' } }}
        />
        <Chip
          icon={<CheckCircle sx={{ fontSize: '12px !important' }} />}
          label={`${stats.emUso} em uso`}
          size="small"
          sx={{ fontSize: 10, height: 20, bgcolor: 'success.light', color: 'success.dark', '& .MuiChip-icon': { color: 'success.dark' } }}
        />
        {stats.total > 0 && (
          <Box sx={{ width: 60 }}>
            <LinearProgress
              variant="determinate"
              value={stats.pct}
              color={stats.pct >= 80 ? 'error' : stats.pct >= 50 ? 'warning' : 'info'}
              sx={{ height: 5, borderRadius: 3 }}
            />
          </Box>
        )}
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: stats.pct >= 80 ? 'error.main' : stats.pct >= 50 ? 'warning.main' : 'info.main' }}>
          {stats.pct}%
        </Typography>
      </Stack>

      <Box sx={{ '& .MuiInputBase-root': { fontSize: 12, height: 30 }, minWidth: 150 }}>
        <GridToolbarQuickFilter />
      </Box>
      <GridToolbarFilterButton />
      <GridToolbarExport
        printOptions={{ disableToolbarButton: true }}
        csvOptions={{ fileName: `servicos-${grupo.codGrupoProd}`, utf8WithBom: true }}
      />
    </GridToolbarContainer>
  );
}

const serviceColumns: GridColDef<ServiceGridRow>[] = [
  {
    field: 'status',
    headerName: 'Situacao',
    width: 110,
    renderCell: ({ row }) => {
      const usado = row.status === 'Em uso';
      return (
        <Chip
          icon={usado ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Cancel sx={{ fontSize: '14px !important' }} />}
          label={row.status}
          size="small"
          sx={{
            height: 22, fontSize: 11, fontWeight: 600,
            bgcolor: usado ? 'success.light' : 'error.light',
            color: usado ? 'success.dark' : 'error.dark',
            '& .MuiChip-icon': { color: usado ? 'success.dark' : 'error.dark' },
          }}
        />
      );
    },
  },
  {
    field: 'codProd',
    headerName: 'Codigo',
    width: 90,
    renderCell: ({ value }) => (
      <Typography sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{value}</Typography>
    ),
  },
  {
    field: 'descrProd',
    headerName: 'Descricao do Servico',
    flex: 1,
    minWidth: 300,
  },
  {
    field: 'utilizacoes',
    headerName: 'Utilizacoes em OS',
    width: 140,
    align: 'center',
    headerAlign: 'center',
    renderCell: ({ value }) => {
      const v = value as number;
      return (
        <Chip
          label={v}
          size="small"
          sx={{
            height: 22, fontSize: 12, fontWeight: 700, minWidth: 40,
            bgcolor: v > 0 ? 'success.light' : 'action.hover',
            color: v > 0 ? 'success.dark' : 'text.disabled',
          }}
        />
      );
    },
  },
];

function ServiceColumn({ grupo, filter, onFilterChange }: {
  grupo: ArvoreGrupo;
  filter: ServicoFilter;
  onFilterChange: (f: ServicoFilter) => void;
}) {
  const servicos = grupo.servicos ?? [];
  const semUso = servicos.filter((s) => s.utilizacoes === 0).length;
  const emUso = servicos.filter((s) => s.utilizacoes > 0).length;
  const pct = servicos.length > 0 ? Math.round((semUso / servicos.length) * 100) : 0;
  const stats = { total: servicos.length, semUso, emUso, pct };

  const displayed = filter === 'sem-uso' ? servicos.filter((s) => s.utilizacoes === 0)
    : filter === 'em-uso' ? servicos.filter((s) => s.utilizacoes > 0) : servicos;

  const rows: ServiceGridRow[] = displayed.map((s) => ({
    id: s.codProd,
    codProd: s.codProd,
    descrProd: s.descrProd,
    utilizacoes: s.utilizacoes,
    status: s.utilizacoes > 0 ? 'Em uso' : 'Sem uso',
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 500, flex: 1 }}>
      {/* Filter tabs */}
      <Box sx={{ px: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && onFilterChange(v)} size="small">
          <ToggleButton value="todos" sx={{ px: 1, py: 0.2 }}>
            <Typography sx={{ fontSize: 11, textTransform: 'none' }}>Todos ({servicos.length})</Typography>
          </ToggleButton>
          <ToggleButton value="sem-uso" sx={{ px: 1, py: 0.2 }}>
            <Cancel sx={{ fontSize: 12, mr: 0.3, color: 'error.main' }} />
            <Typography sx={{ fontSize: 11, textTransform: 'none' }}>Sem uso ({semUso})</Typography>
          </ToggleButton>
          <ToggleButton value="em-uso" sx={{ px: 1, py: 0.2 }}>
            <CheckCircle sx={{ fontSize: 12, mr: 0.3, color: 'success.main' }} />
            <Typography sx={{ fontSize: 11, textTransform: 'none' }}>Em uso ({emUso})</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* DataGrid */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={serviceColumns}
          density="compact"
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          slots={{ toolbar: () => <CustomToolbar grupo={grupo} stats={stats} /> }}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
            sorting: { sortModel: [{ field: 'utilizacoes', sort: 'asc' }] },
          }}
          disableColumnMenu={false}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { fontSize: 13 },
            '& .MuiDataGrid-columnHeader': { fontWeight: 700, fontSize: 12 },
            '& .MuiDataGrid-toolbarContainer': { borderBottom: '1px solid', borderColor: 'divider' },
          }}
        />
      </Box>
    </Box>
  );
}

// ── Resizable sidebar hook ──

const SIDEBAR_STORAGE_KEY = 'nao-utilizados-sidebar-width';
const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 600;
const SIDEBAR_DEFAULT = 340;

function useResizableSidebar() {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const parsed = saved ? Number(saved) : NaN;
    return !isNaN(parsed) && parsed >= SIDEBAR_MIN && parsed <= SIDEBAR_MAX ? parsed : SIDEBAR_DEFAULT;
  });
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, ev.clientX - rect.left));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setWidth((w) => { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(w)); return w; });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return { width, containerRef, handleMouseDown };
}

// ── Main Page ──

export function NaoUtilizadosPage() {
  const { path, servicoFilter, setPath, setServicoFilter } = useUrlState();
  const selectedId = path.length > 0 ? path[path.length - 1] : null;
  const { width: sidebarWidth, containerRef, handleMouseDown } = useResizableSidebar();

  const { data: arvore, isLoading, error } = useQuery({
    queryKey: ['servicos-grupo-arvore'],
    queryFn: getArvoreCompleta,
    staleTime: 10 * 60 * 1000,
  });

  const stats = useMemo(() => (arvore ? countAll(arvore) : { total: 0, naoUsados: 0 }), [arvore]);

  const selectedNode = useMemo(() => {
    if (!arvore || !selectedId) return null;
    function find(nodes: ArvoreGrupo[]): ArvoreGrupo | null {
      for (const n of nodes) {
        if (n.codGrupoProd === selectedId) return n;
        const f = find(n.children);
        if (f) return f;
      }
      return null;
    }
    return find(arvore);
  }, [arvore, selectedId]);

  const handleSelectNode = useCallback((node: ArvoreGrupo) => {
    if (!arvore) return;
    const p = buildPathTo(arvore, node.codGrupoProd);
    if (p) setPath(p);
  }, [arvore, setPath]);

  const hasServices = selectedNode && (selectedNode.servicos?.length ?? 0) > 0;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Carregando servicos...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Erro: {error instanceof Error ? error.message : 'Erro desconhecido'}</Alert>
      </Box>
    );
  }

  const percent = stats.total > 0 ? Math.round((stats.naoUsados / stats.total) * 100) : 0;

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* Sidebar tree */}
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : '#fafafa',
        }}
      >
        {/* Sidebar header */}
        <Box sx={{ px: 1.5, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
            <ViewColumn sx={{ fontSize: 22, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Grupos e Servicos</Typography>
          </Stack>
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Chip
              icon={<WarningAmber sx={{ fontSize: '14px !important' }} />}
              label={`${stats.naoUsados} sem uso`}
              size="small"
              sx={{ fontSize: 12, height: 24, bgcolor: '#ed6c0218', color: '#ed6c02', '& .MuiChip-icon': { color: '#ed6c02' } }}
            />
            <Chip label={`${stats.total} total`} size="small" variant="outlined" sx={{ fontSize: 12, height: 24 }} />
            <Chip
              label={`${percent}%`}
              size="small"
              sx={{ fontSize: 12, height: 24, fontWeight: 700, bgcolor: percent > 30 ? '#d32f2f18' : '#1976d218', color: percent > 30 ? '#d32f2f' : '#1976d2' }}
            />
          </Stack>
        </Box>

        {/* Tree */}
        <Box sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>
          {arvore?.filter((n) => countNodeUsage(n).total > 0).map((node, i) => (
            <SidebarTreeNode
              key={node.codGrupoProd}
              node={node}
              depth={0}
              selectedId={selectedId}
              selectedPath={path}
              onSelect={handleSelectNode}
              indexLabel={String(i + 1).padStart(2, '0')}
            />
          ))}
        </Box>
      </Box>

      {/* Resize handle */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          width: 5,
          flexShrink: 0,
          cursor: 'col-resize',
          bgcolor: 'divider',
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: 'primary.main' },
          '&:active': { bgcolor: 'primary.dark' },
        }}
      />

      {/* Right: DataGrid or empty state */}
      {hasServices && selectedNode ? (
        <ServiceColumn
          grupo={selectedNode}
          filter={servicoFilter}
          onFilterChange={setServicoFilter}
        />
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={1} alignItems="center">
            <Folder sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>
              {selectedNode
                ? selectedNode.children.length > 0
                  ? 'Este grupo possui subgrupos. Selecione um subgrupo com servicos.'
                  : 'Este grupo nao possui servicos.'
                : 'Selecione um grupo na arvore para ver seus servicos.'}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
