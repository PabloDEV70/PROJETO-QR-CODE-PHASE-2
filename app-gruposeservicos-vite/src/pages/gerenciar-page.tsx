import { useState, useMemo, useCallback, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box, Typography,
  CircularProgress, Stack, Alert, Chip,
  FormControlLabel, Switch, Tooltip,
  Divider, Badge, Menu, MenuItem, TextField, InputAdornment, IconButton,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  Folder, FolderOpen, Add, Edit, SwapHoriz,
  ToggleOff, ToggleOn, CheckCircle, Cancel, ViewColumn,
  DeleteOutline, FilterList, FileDownload, Search,
  Cancel as CancelIcon, AccountTree,
} from '@mui/icons-material';
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
  GridActionsCellItem,
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterTrigger,
  QuickFilterControl,
  QuickFilterClear,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getArvoreTodos } from '@/api/grupos-mutation';
import type { ArvoreGrupo, ServicoItem } from '@/types/grupo-types';
import {
  useCreateGrupo,
  useUpdateGrupo,
  useToggleGrupoAtivo,
  useCreateServico,
  useUpdateServico,
  useMoveServico,
  useToggleServicoAtivo,
} from '@/hooks/use-grupo-mutations';
import { GerenciarTreeNode } from '@/components/gerenciar/gerenciar-tree-node';
import { GrupoFormDrawer } from '@/components/gerenciar/grupo-form-drawer';
import { ServicoFormDrawer } from '@/components/gerenciar/servico-form-drawer';
import { ConfirmDialog } from '@/components/gerenciar/confirm-dialog';

// ── Helpers ──

function buildPathTo(arvore: ArvoreGrupo[], targetCod: number, current: number[] = []): number[] | null {
  for (const n of arvore) {
    if (n.codGrupoProd === targetCod) return [...current, targetCod];
    const sub = buildPathTo(n.children, targetCod, [...current, n.codGrupoProd]);
    if (sub) return sub;
  }
  return null;
}

function buildBreadcrumb(arvore: ArvoreGrupo[], pathIds: number[]): string[] {
  const names: string[] = [];
  let nodes = arvore;
  for (const id of pathIds) {
    const found = nodes.find((n) => n.codGrupoProd === id);
    if (!found) break;
    names.push(found.descrGrupoProd);
    nodes = found.children;
  }
  return names;
}

function countServicos(node: ArvoreGrupo): number {
  let total = node.servicos?.length ?? 0;
  for (const child of node.children) total += countServicos(child);
  return total;
}

function countSubgrupos(node: ArvoreGrupo): number {
  let total = node.children.length;
  for (const child of node.children) total += countSubgrupos(child);
  return total;
}

type ServicoFilter = 'todos' | 'ativos' | 'inativos';

// ── URL State ──

function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pathStr = searchParams.get('caminho') || '';
  const path = pathStr ? pathStr.split(',').map(Number).filter(Boolean) : [];
  const showInativos = searchParams.get('mostrar-inativos') === '1';
  const servicoFilter = (searchParams.get('filtro') as ServicoFilter) || 'todos';
  const drawerRaw = searchParams.get('drawer') || '';
  const drawerParts = drawerRaw.split(':');
  const drawerType = drawerParts[0] || '';
  const drawerParam = drawerParts[1] ? Number(drawerParts[1]) : null;

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
    path, showInativos, servicoFilter, drawerType, drawerParam,
    setPath: (p: number[]) => update({ caminho: p.length > 0 ? p.join(',') : null }),
    setShowInativos: (v: boolean) => update({ 'mostrar-inativos': v ? '1' : null }),
    setServicoFilter: (f: ServicoFilter) => update({ filtro: f === 'todos' ? null : f }),
    openDrawer: (type: string, param?: number) => update({ drawer: param ? `${type}:${param}` : type }),
    closeDrawer: () => update({ drawer: null }),
  };
}

// ── Resizable sidebar ──

const SIDEBAR_STORAGE_KEY = 'gerenciar-sidebar-width';

function useResizableSidebar() {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const parsed = saved ? Number(saved) : NaN;
    return !isNaN(parsed) && parsed >= 260 && parsed <= 600 ? parsed : 340;
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
      setWidth(Math.min(600, Math.max(260, ev.clientX - rect.left)));
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

// ── DataGrid row ──

interface ServiceGridRow {
  id: number;
  codProd: number;
  descrProd: string;
  utilizacoes: number;
  ativo: string;
}

// ── Styled QuickFilter (MUI v8 official pattern) ──

type OwnerState = { expanded: boolean };

const StyledQuickFilter = styled(QuickFilter)({ display: 'grid', alignItems: 'center' });

const StyledSearchBtn = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1', width: 'min-content', height: 'min-content', zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? 'none' : 'auto',
    transition: theme.transitions.create(['opacity']),
  }),
);

const StyledSearchInput = styled(TextField)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1', overflowX: 'clip',
    width: ownerState.expanded ? 220 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
  }),
);

// ── Toolbar — integrada com filtros rapidos e acoes ──

interface ServicosToolbarProps {
  servicoFilter: ServicoFilter;
  setServicoFilter: (f: ServicoFilter) => void;
  stats: { total: number; ativos: number; inativos: number };
  selectedNode: ArvoreGrupo;
  breadcrumb: string[];
  selectedIds: (string | number)[];
  onAddServico: () => void;
  onBatchActivate: () => void;
  onBatchDeactivate: () => void;
}

function ServicosToolbar({
  servicoFilter, setServicoFilter, stats,
  selectedNode, breadcrumb, selectedIds,
  onAddServico, onBatchActivate, onBatchDeactivate,
}: ServicosToolbarProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      {/* ── Esquerda: titulo do grupo ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', mr: 'auto' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, textDecoration: selectedNode.ativo === 'N' ? 'line-through' : 'none' }}>
          {selectedNode.descrGrupoProd}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
            {breadcrumb.length > 1
              ? breadcrumb.slice(0, -1).join(' > ') + ' > '
              : ''}
            <Box component="span" sx={{ fontFamily: 'monospace' }}>
              #{selectedNode.codGrupoProd} &middot; G{selectedNode.grau}
            </Box>
          </Typography>
          {selectedNode.ativo === 'N' && <Chip label="INATIVO" size="small" color="warning" sx={{ height: 16, fontSize: 9, '& .MuiChip-label': { px: 0.5 } }} />}
        </Stack>
      </Box>

      {/* ── Direita: acoes + filtros ── */}

      <Tooltip title="Adicionar servico ao grupo">
        <IconButton size="small" color="primary" onClick={onAddServico}>
          <Add sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* Filtros rapidos de servicos */}
      <ToggleButtonGroup
        value={servicoFilter}
        exclusive
        onChange={(_, v) => { if (v) setServicoFilter(v); }}
        size="small"
        sx={{ height: 26, '& .MuiToggleButton-root': { fontSize: 11, fontWeight: 600, px: 1.2, py: 0, textTransform: 'none' } }}
      >
        <ToggleButton value="todos">Todos {stats.total}</ToggleButton>
        <ToggleButton value="ativos" sx={{ '&.Mui-selected': { bgcolor: 'success.light', color: 'success.dark', '&:hover': { bgcolor: 'success.light' } } }}>Ativos {stats.ativos}</ToggleButton>
        <ToggleButton value="inativos" sx={{ '&.Mui-selected': { bgcolor: 'warning.light', color: 'warning.dark', '&:hover': { bgcolor: 'warning.light' } } }}>Inativos {stats.inativos}</ToggleButton>
      </ToggleButtonGroup>

      {/* Batch actions (servicos selecionados) */}
      {selectedIds.length > 0 && (
        <>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
          <Chip label={`${selectedIds.length} sel.`} size="small" color="primary" sx={{ fontSize: 10, height: 22, fontWeight: 700 }} />
          <Tooltip title="Ativar selecionados"><IconButton size="small" onClick={onBatchActivate}><ToggleOn sx={{ fontSize: 16 }} color="success" /></IconButton></Tooltip>
          <Tooltip title="Desativar selecionados"><IconButton size="small" onClick={onBatchDeactivate}><DeleteOutline sx={{ fontSize: 16 }} color="warning" /></IconButton></Tooltip>
        </>
      )}

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* Standard toolbar actions */}
      <Tooltip title="Colunas">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumn fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filtros">
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton {...props} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterList fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>

      <Tooltip title="Exportar">
        <ToolbarButton ref={exportMenuRef} onClick={() => setExportMenuOpen(true)}>
          <FileDownload fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        anchorEl={exportMenuRef.current}
        open={exportMenuOpen}
        onClose={() => setExportMenuOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ExportCsv render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>Exportar CSV</ExportCsv>
        <ExportPrint render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>Imprimir</ExportPrint>
      </Menu>

      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Buscar" enterDelay={0}>
              <StyledSearchBtn {...triggerProps} ownerState={{ expanded: state.expanded }} color="default" aria-disabled={state.expanded}>
                <Search fontSize="small" />
              </StyledSearchBtn>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledSearchInput
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              placeholder="Buscar servico..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear edge="end" size="small" material={{ sx: { marginRight: -0.75 } }}>
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...controlProps.slotProps?.input,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}

// ── Main Page ──

export function GerenciarPage() {
  const {
    path, showInativos, servicoFilter, drawerType, drawerParam,
    setPath, setShowInativos, setServicoFilter, openDrawer, closeDrawer,
  } = useUrlState();
  const selectedId = path.length > 0 ? path[path.length - 1] : null;
  const { width: sidebarWidth, containerRef, handleMouseDown } = useResizableSidebar();

  const { data: arvore, isLoading, error } = useQuery({
    queryKey: ['servicos-grupo', 'arvore-todos'],
    queryFn: getArvoreTodos,
    staleTime: 5 * 60 * 1000,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string; impact?: string; onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });

  const createGrupo = useCreateGrupo();
  const updateGrupo = useUpdateGrupo();
  const toggleGrupoAtivo = useToggleGrupoAtivo();
  const createServicoMut = useCreateServico();
  const updateServico = useUpdateServico();
  const moveServicoMut = useMoveServico();
  const toggleServicoAtivo = useToggleServicoAtivo();

  const findNode = useCallback((cod: number | null): ArvoreGrupo | null => {
    if (!arvore || !cod) return null;
    function find(nodes: ArvoreGrupo[]): ArvoreGrupo | null {
      for (const n of nodes) {
        if (n.codGrupoProd === cod) return n;
        const f = find(n.children);
        if (f) return f;
      }
      return null;
    }
    return find(arvore);
  }, [arvore]);

  const selectedNode = useMemo(() => findNode(selectedId), [findNode, selectedId]);

  const grupoDrawerOpen = drawerType === 'novo-grupo' || drawerType === 'editar-grupo' || drawerType === 'novo-subgrupo';
  const grupoDrawerMode = drawerType === 'editar-grupo' ? 'edit' as const : 'create' as const;
  const grupoDrawerGrupo = drawerType === 'editar-grupo' && drawerParam ? findNode(drawerParam) : null;
  const grupoDrawerDefaultPai = drawerType === 'novo-subgrupo' && drawerParam ? drawerParam : null;

  const servicoDrawerOpen = drawerType === 'novo-servico' || drawerType === 'editar-servico' || drawerType === 'mover-servico';
  const servicoDrawerMode = drawerType === 'novo-servico' ? 'create' as const : drawerType === 'mover-servico' ? 'move' as const : 'edit' as const;
  const servicoDrawerItem = useMemo((): ServicoItem | null => {
    if (drawerType === 'novo-servico') return null;
    if (!servicoDrawerOpen || !drawerParam || !selectedNode?.servicos) return null;
    return selectedNode.servicos.find((s) => s.codProd === drawerParam) ?? null;
  }, [servicoDrawerOpen, drawerType, drawerParam, selectedNode]);

  const handleSelectNode = useCallback((node: ArvoreGrupo) => {
    if (!arvore) return;
    const p = buildPathTo(arvore, node.codGrupoProd);
    if (p) setPath(p);
    setSelectionModel({ type: 'include', ids: new Set() });
  }, [arvore, setPath]);

  const handleEditGrupo = (node: ArvoreGrupo) => openDrawer('editar-grupo', node.codGrupoProd);
  const handleNewSubgrupo = (parentNode: ArvoreGrupo) => openDrawer('novo-subgrupo', parentNode.codGrupoProd);

  const handleToggleGrupoAtivo = (node: ArvoreGrupo) => {
    if (node.ativo === 'N') {
      toggleGrupoAtivo.mutate({ codGrupo: node.codGrupoProd, input: { ativo: 'S' } });
    } else {
      const parts: string[] = [];
      const srv = countServicos(node); const sub = countSubgrupos(node);
      if (srv > 0) parts.push(`${srv} servico(s)`);
      if (sub > 0) parts.push(`${sub} subgrupo(s)`);
      setConfirmDialog({
        open: true, title: 'Desativar grupo?',
        message: `"${node.descrGrupoProd}" sera marcado como inativo.`,
        impact: parts.length > 0 ? `Contem: ${parts.join(', ')}` : undefined,
        onConfirm: () => {
          toggleGrupoAtivo.mutate({ codGrupo: node.codGrupoProd, input: { ativo: 'N' } });
          setConfirmDialog((s) => ({ ...s, open: false }));
        },
      });
    }
  };

  const handleSaveGrupo = (data: { codGrupoProd?: number; descr: string; codGrupoPai: number | null }) => {
    if (grupoDrawerMode === 'create' && data.codGrupoProd) {
      createGrupo.mutate({ CODGRUPOPROD: data.codGrupoProd, DESCRGRUPOPROD: data.descr, CODGRUPAI: data.codGrupoPai }, { onSuccess: closeDrawer });
    } else if (grupoDrawerGrupo) {
      updateGrupo.mutate({ codGrupo: grupoDrawerGrupo.codGrupoProd, input: { DESCRGRUPOPROD: data.descr } }, { onSuccess: closeDrawer });
    }
  };

  const handleEditServico = (s: ServicoItem) => openDrawer('editar-servico', s.codProd);
  const handleMoveServico = (s: ServicoItem) => openDrawer('mover-servico', s.codProd);

  const handleToggleServicoAtivo = (servico: ServicoItem) => {
    if (servico.ativo === 'N') {
      toggleServicoAtivo.mutate({ codProd: servico.codProd, input: { ativo: 'S' } });
    } else {
      setConfirmDialog({
        open: true, title: 'Desativar servico?',
        message: `"${servico.descrProd}" (${servico.codProd}) sera marcado como inativo.`,
        onConfirm: () => {
          toggleServicoAtivo.mutate({ codProd: servico.codProd, input: { ativo: 'N' } });
          setConfirmDialog((s) => ({ ...s, open: false }));
        },
      });
    }
  };

  const selectedIds = selectionModel.type === 'include' ? [...selectionModel.ids] : [];

  const handleBatchDeactivate = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      open: true, title: `Desativar ${selectedIds.length} servico(s)?`,
      message: `${selectedIds.length} servicos selecionados serao desativados.`,
      impact: `${selectedIds.length} servico(s)`,
      onConfirm: () => {
        for (const id of selectedIds) toggleServicoAtivo.mutate({ codProd: id as number, input: { ativo: 'N' } });
        setConfirmDialog((s) => ({ ...s, open: false }));
        setSelectionModel({ type: 'include', ids: new Set() });
      },
    });
  };

  const handleBatchActivate = () => {
    for (const id of selectedIds) toggleServicoAtivo.mutate({ codProd: id as number, input: { ativo: 'S' } });
    setSelectionModel({ type: 'include', ids: new Set() });
  };

  const buildServico = (row: ServiceGridRow): ServicoItem => ({
    codProd: row.codProd, descrProd: row.descrProd,
    codGrupoProd: selectedNode?.codGrupoProd ?? 0, utilizacoes: row.utilizacoes, ativo: row.ativo,
  });

  const serviceColumns: GridColDef<ServiceGridRow>[] = useMemo(() => [
    {
      field: 'ativo', headerName: 'Situacao', width: 100,
      type: 'singleSelect', valueOptions: ['Ativo', 'Inativo'],
      valueGetter: (_v: unknown, row: ServiceGridRow) => row.ativo === 'S' ? 'Ativo' : 'Inativo',
      renderCell: ({ row }) => {
        const ok = row.ativo === 'S';
        return <Chip icon={ok ? <CheckCircle sx={{ fontSize: '13px !important' }} /> : <Cancel sx={{ fontSize: '13px !important' }} />}
          label={ok ? 'Ativo' : 'Inativo'} size="small"
          sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: ok ? 'success.light' : 'warning.light', color: ok ? 'success.dark' : 'warning.dark', '& .MuiChip-icon': { color: ok ? 'success.dark' : 'warning.dark' } }} />;
      },
    },
    {
      field: 'codProd', headerName: 'Codigo', width: 80, type: 'number',
      renderCell: ({ value }) => <Typography sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{value}</Typography>,
    },
    { field: 'descrProd', headerName: 'Descricao', flex: 1, minWidth: 250 },
    {
      field: 'utilizacoes', headerName: 'Uso em OS', width: 100, type: 'number', align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => {
        const v = value as number;
        return <Chip label={v} size="small" sx={{ height: 22, fontSize: 12, fontWeight: 700, minWidth: 36, bgcolor: v > 0 ? 'success.light' : 'action.hover', color: v > 0 ? 'success.dark' : 'text.disabled' }} />;
      },
    },
    {
      field: 'actions', type: 'actions', headerName: 'Acoes', width: 120,
      getActions: (params) => {
        const s = buildServico(params.row);
        const off = params.row.ativo === 'N';
        return [
          <GridActionsCellItem icon={<Edit />} label="Editar nome" onClick={() => handleEditServico(s)} />,
          <GridActionsCellItem icon={<SwapHoriz />} label="Mover grupo" onClick={() => handleMoveServico(s)} />,
          <GridActionsCellItem icon={off ? <ToggleOn color="success" /> : <ToggleOff color="warning" />} label={off ? 'Ativar' : 'Desativar'} onClick={() => handleToggleServicoAtivo(s)} showInMenu />,
        ];
      },
    },
  ], [selectedNode]);

  const rows: ServiceGridRow[] = useMemo(() => {
    if (!selectedNode?.servicos) return [];
    let list = selectedNode.servicos;
    if (servicoFilter === 'ativos') list = list.filter((s) => s.ativo !== 'N');
    if (servicoFilter === 'inativos') list = list.filter((s) => s.ativo === 'N');
    return list.map((s) => ({ id: s.codProd, codProd: s.codProd, descrProd: s.descrProd, utilizacoes: s.utilizacoes, ativo: s.ativo ?? 'S' }));
  }, [selectedNode, servicoFilter]);

  const stats = useMemo(() => {
    if (!selectedNode?.servicos) return { total: 0, ativos: 0, inativos: 0 };
    const total = selectedNode.servicos.length;
    const inativos = selectedNode.servicos.filter((s) => s.ativo === 'N').length;
    return { total, ativos: total - inativos, inativos };
  }, [selectedNode]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error instanceof Error ? error.message : 'Erro'}</Alert></Box>;

  const visibleRoots = showInativos ? arvore ?? [] : (arvore ?? []).filter((n) => n.ativo !== 'N');

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* ── SIDEBAR ── */}
      <Box sx={{ width: sidebarWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <AccountTree sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, flex: 1 }}>Grupos</Typography>
          <FormControlLabel
            control={<Switch checked={showInativos} onChange={(_, v) => setShowInativos(v)} size="small" />}
            label={<Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Inativos</Typography>}
            sx={{ m: 0, '& .MuiFormControlLabel-label': { ml: 0.3 } }}
          />
          <Tooltip title="Novo Grupo">
            <IconButton size="small" onClick={() => openDrawer('novo-grupo')} color="primary">
              <Add sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>
          {visibleRoots.map((node, i) => (
            <GerenciarTreeNode key={node.codGrupoProd} node={node} depth={0} selectedId={selectedId} selectedPath={path}
              onSelect={handleSelectNode} onEditGrupo={handleEditGrupo} onNewSubgrupo={handleNewSubgrupo}
              onToggleAtivo={handleToggleGrupoAtivo} showInativos={showInativos}
              indexLabel={String(i + 1).padStart(2, '0')} isProd={false} />
          ))}
        </Box>
      </Box>

      {/* Resize */}
      <Box onMouseDown={handleMouseDown} sx={{ width: 4, flexShrink: 0, cursor: 'col-resize', '&:hover': { bgcolor: 'primary.main' } }} />

      {/* ── CONTENT ── */}
      {selectedNode ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          {/* DataGrid — servicos do grupo selecionado */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid rows={rows} columns={serviceColumns} density="compact"
              localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              slots={{
                toolbar: () => (
                  <ServicosToolbar
                    servicoFilter={servicoFilter}
                    setServicoFilter={setServicoFilter}
                    stats={stats}
                    selectedNode={selectedNode}
                    breadcrumb={buildBreadcrumb(arvore ?? [], path)}
                    selectedIds={selectedIds}
                    onAddServico={() => openDrawer('novo-servico')}
                    onBatchActivate={handleBatchActivate}
                    onBatchDeactivate={handleBatchDeactivate}
                  />
                ),
              }} showToolbar
              checkboxSelection disableRowSelectionOnClick
              rowSelectionModel={selectionModel} onRowSelectionModelChange={setSelectionModel}
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 50 } }, sorting: { sortModel: [{ field: 'descrProd', sort: 'asc' }] } }}
              getRowClassName={(p) => p.row.ativo === 'N' ? 'row-off' : ''}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { fontSize: 13 },
                '& .MuiDataGrid-columnHeader': { fontWeight: 700, fontSize: 12 },
                '& .row-off': { opacity: 0.5 },
                '& .row-off .MuiDataGrid-cell': { textDecoration: 'line-through', textDecorationColor: 'rgba(0,0,0,0.25)' },
                '& .row-off .MuiDataGrid-cell[data-field="ativo"], & .row-off .MuiDataGrid-cell[data-field="actions"]': { textDecoration: 'none' },
              }}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={1} alignItems="center">
            <Folder sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>Selecione um grupo na arvore.</Typography>
          </Stack>
        </Box>
      )}

      {/* Drawers */}
      <GrupoFormDrawer open={grupoDrawerOpen} onClose={closeDrawer} mode={grupoDrawerMode} arvore={arvore ?? []}
        editGrupo={grupoDrawerGrupo} defaultPaiCod={grupoDrawerDefaultPai} onSave={handleSaveGrupo}
        saving={createGrupo.isPending || updateGrupo.isPending} />
      <ServicoFormDrawer open={servicoDrawerOpen} onClose={closeDrawer} servico={servicoDrawerItem} arvore={arvore ?? []}
        mode={servicoDrawerMode}
        currentGrupoCod={selectedNode?.codGrupoProd ?? null}
        currentGrupoNome={selectedNode?.descrGrupoProd ?? ''}
        onCreate={(nome, codGrupo) => createServicoMut.mutate({ DESCRPROD: nome, CODGRUPOPROD: codGrupo }, { onSuccess: closeDrawer })}
        onSaveName={(codProd, nome) => updateServico.mutate({ codProd, input: { DESCRPROD: nome } }, { onSuccess: closeDrawer })}
        onMove={(codProd, g) => moveServicoMut.mutate({ codProd, input: { CODGRUPOPROD: g } }, { onSuccess: closeDrawer })}
        saving={createServicoMut.isPending || updateServico.isPending || moveServicoMut.isPending} />
      <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message}
        impactLabel={confirmDialog.impact} confirmLabel="Confirmar" onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((s) => ({ ...s, open: false }))}
        loading={toggleGrupoAtivo.isPending || toggleServicoAtivo.isPending} />
    </Box>
  );
}
