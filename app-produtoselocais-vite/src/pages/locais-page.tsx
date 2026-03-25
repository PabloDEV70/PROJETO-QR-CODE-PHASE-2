import { useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
} from '@mui/material';
import { useLocaisArvore } from '@/hooks/use-locais';
import { LocalItemComponent } from '@/components/locais/local-item';
import { EstoquePanel } from '@/components/locais/estoque-panel';
import { ErrorDetail } from '@/components/locais/error-detail';
import { loadLocaisPrefs, saveLocaisPrefs } from '@/utils/locais-prefs-storage';
import type { ArvoreLocal } from '@/types/local-produto';
import type { ViewMode, SortOption } from '@/components/locais/estoque-toolbar';

interface BreadcrumbItem {
  codLocal: number;
  descrLocal: string;
  grau: number;
}

function findAncestors(
  tree: ArvoreLocal[],
  codLocal: number,
): BreadcrumbItem[] {
  for (const node of tree) {
    if (node.codLocal === codLocal) {
      return [{ codLocal: node.codLocal, descrLocal: node.descrLocal, grau: node.grau }];
    }
    const sub = findAncestors(node.children, codLocal);
    if (sub.length > 0) {
      return [
        { codLocal: node.codLocal, descrLocal: node.descrLocal, grau: node.grau },
        ...sub,
      ];
    }
  }
  return [];
}

const VALID_VIEWS: ViewMode[] = ['grid', 'list', 'table'];
const VALID_SORTS: SortOption[] = [
  'nome-asc', 'nome-desc', 'estoque-asc', 'estoque-desc', 'codigo',
];

const DEFAULTS: { view: ViewMode; sort: SortOption; hideDesativ: boolean } = {
  view: 'table',
  sort: 'nome-asc',
  hideDesativ: true,
};

function resolveView(params: URLSearchParams, saved: string | undefined): ViewMode {
  const p = params.get('view');
  if (p && VALID_VIEWS.includes(p as ViewMode)) return p as ViewMode;
  if (saved && VALID_VIEWS.includes(saved as ViewMode)) return saved as ViewMode;
  return DEFAULTS.view;
}

function resolveSort(params: URLSearchParams, saved: string | undefined): SortOption {
  const p = params.get('sort');
  if (p && VALID_SORTS.includes(p as SortOption)) return p as SortOption;
  if (saved && VALID_SORTS.includes(saved as SortOption)) return saved as SortOption;
  return DEFAULTS.sort;
}

function resolveHideDesativ(params: URLSearchParams, saved: string | undefined): boolean {
  if (params.has('hideDesativ')) return params.get('hideDesativ') !== '0';
  if (saved !== undefined) return saved !== '0';
  return DEFAULTS.hideDesativ;
}

export function LocaisPage() {
  const { data: arvore, isLoading, error } = useLocaisArvore();
  const [params, setParams] = useSearchParams();
  const prefsRef = useRef(loadLocaisPrefs());

  const selectedLocal = params.get('local')
    ? Number(params.get('local'))
    : null;

  const viewMode = resolveView(params, prefsRef.current.view);
  const sortBy = resolveSort(params, prefsRef.current.sort);
  const searchTerm = params.get('search') || '';
  const hideDesativados = resolveHideDesativ(params, prefsRef.current.hideDesativ);

  const selectedProduto = params.get('produto')
    ? Number(params.get('produto'))
    : null;

  const breadcrumb = useMemo(() => {
    if (!arvore || selectedLocal === null) return [];
    return findAncestors(arvore, selectedLocal);
  }, [arvore, selectedLocal]);

  const expandedPath = useMemo(() => {
    return new Set(breadcrumb.map((b) => b.codLocal));
  }, [breadcrumb]);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === null || value === '') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const handleSelect = useCallback((codLocal: number) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (Number(next.get('local')) === codLocal) {
          next.delete('local');
        } else {
          next.set('local', String(codLocal));
        }
        next.delete('produto');
        next.delete('search');
        return next;
      },
      { replace: true },
    );
  }, [setParams]);

  const handleViewChange = useCallback(
    (mode: ViewMode) => {
      saveLocaisPrefs({ view: mode });
      prefsRef.current = { ...prefsRef.current, view: mode };
      updateParam('view', mode === DEFAULTS.view ? null : mode);
    },
    [updateParam],
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      saveLocaisPrefs({ sort });
      prefsRef.current = { ...prefsRef.current, sort };
      updateParam('sort', sort === DEFAULTS.sort ? null : sort);
    },
    [updateParam],
  );

  const handleSearchChange = useCallback(
    (term: string) => updateParam('search', term || null),
    [updateParam],
  );

  const handleSelectProduto = useCallback(
    (codProd: number | null) => updateParam('produto', codProd ? String(codProd) : null),
    [updateParam],
  );

  const handleHideDesativadosChange = useCallback(
    (hide: boolean) => {
      const val = hide ? undefined : '0';
      saveLocaisPrefs({ hideDesativ: val ?? '1' });
      prefsRef.current = { ...prefsRef.current, hideDesativ: val };
      updateParam('hideDesativ', hide ? null : '0');
    },
    [updateParam],
  );

  const selectedNode = useMemo(() => {
    if (!arvore || selectedLocal === null) return null;
    const find = (nodes: ArvoreLocal[]): ArvoreLocal | null => {
      for (const n of nodes) {
        if (n.codLocal === selectedLocal) return n;
        const sub = find(n.children);
        if (sub) return sub;
      }
      return null;
    };
    return find(arvore);
  }, [arvore, selectedLocal]);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: 2 }}>
      <Paper sx={{ width: 400, flexShrink: 0, overflow: 'auto', p: 2 }}>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
          Locais
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecione um local para ver o estoque real (TGFEST)
        </Typography>
        {isLoading && <Typography>Carregando...</Typography>}
        {error && (
          <ErrorDetail error={error} context="Carregar árvore de locais" />
        )}
        {arvore && arvore.length > 0 && (
          <List dense>
            {arvore.map((node) => (
              <LocalItemComponent
                key={node.codLocal}
                node={node}
                selectedLocal={selectedLocal}
                expandedPath={expandedPath}
                onSelect={handleSelect}
              />
            ))}
          </List>
        )}
      </Paper>
      <Paper sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
        <EstoquePanel
          codLocal={selectedLocal}
          node={selectedNode}
          breadcrumb={breadcrumb}
          onNavigate={handleSelect}
          viewMode={viewMode}
          onViewChange={handleViewChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          selectedProduto={selectedProduto}
          onSelectProduto={handleSelectProduto}
          hideDesativados={hideDesativados}
          onHideDesativadosChange={handleHideDesativadosChange}
        />
      </Paper>
    </Box>
  );
}
