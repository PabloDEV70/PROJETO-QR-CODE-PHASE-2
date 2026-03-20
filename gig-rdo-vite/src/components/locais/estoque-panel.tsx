import { useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Inventory2,
  Warning,
  NavigateNext,
  FolderOpen,
  Inventory,
} from '@mui/icons-material';
import { useEstoquePorLocal } from '@/hooks/use-locais';
import { ErrorDetail } from '@/components/locais/error-detail';
import { EstoqueToolbar, type ViewMode, type SortOption } from './estoque-toolbar';
import { EstoqueGridView } from './estoque-grid-view';
import { EstoqueListView } from './estoque-list-view';
import { EstoqueTableView } from './estoque-table-view';
import { ProdutoDetailDrawer } from '@/components/locais/produto-detail-drawer';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { ArvoreLocal, EstoqueLocal } from '@/types/local-produto';
import { isDesativado } from '@/utils/estoque-health';

interface BreadcrumbItem {
  codLocal: number;
  descrLocal: string;
  grau: number;
}

interface EstoquePanelProps {
  codLocal: number | null;
  node: ArvoreLocal | null;
  breadcrumb: BreadcrumbItem[];
  onNavigate: (codLocal: number) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedProduto: number | null;
  onSelectProduto: (codProd: number | null) => void;
  hideDesativados: boolean;
  onHideDesativadosChange: (hide: boolean) => void;
}

function sortItems(items: EstoqueLocal[], sortBy: SortOption): EstoqueLocal[] {
  const sorted = [...items];
  switch (sortBy) {
    case 'nome-asc':
      return sorted.sort((a, b) => a.descrProd.localeCompare(b.descrProd));
    case 'nome-desc':
      return sorted.sort((a, b) => b.descrProd.localeCompare(a.descrProd));
    case 'estoque-asc':
      return sorted.sort((a, b) => a.estoque - b.estoque);
    case 'estoque-desc':
      return sorted.sort((a, b) => b.estoque - a.estoque);
    case 'codigo':
      return sorted.sort((a, b) => a.codProd - b.codProd);
    default:
      return sorted;
  }
}

function sumEstoque(node: ArvoreLocal): number {
  let total = node.totalProdutosEstoque;
  for (const child of node.children) total += sumEstoque(child);
  return total;
}

export function EstoquePanel({
  codLocal,
  node,
  breadcrumb,
  onNavigate,
  viewMode,
  onViewChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedProduto,
  onSelectProduto,
  hideDesativados,
  onHideDesativadosChange,
}: EstoquePanelProps) {
  const { data: estoque, isLoading, error } = useEstoquePorLocal(codLocal);

  const filtered = useMemo(() => {
    if (!estoque) return [];
    let items = estoque;
    if (hideDesativados) {
      items = items.filter((item) => !isDesativado(item));
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.descrProd.toLowerCase().includes(term)
          || String(item.codProd).includes(term)
          || (item.localizacao && item.localizacao.toLowerCase().includes(term)),
      );
    }
    if (viewMode !== 'table') {
      items = sortItems(items, sortBy);
    }
    return items;
  }, [estoque, searchTerm, sortBy, viewMode, hideDesativados]);

  const selectedItem = useMemo(() => {
    if (!selectedProduto || !estoque) return null;
    return estoque.find((i) => i.codProd === selectedProduto) || null;
  }, [selectedProduto, estoque]);

  const handleSelect = useCallback(
    (item: EstoqueLocal) => onSelectProduto(item.codProd),
    [onSelectProduto],
  );

  if (!codLocal) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">
          Selecione um local para ver o estoque
        </Typography>
      </Box>
    );
  }

  const isLeaf = node?.analitico === 'S';
  const isBranch = node?.analitico === 'N';
  const children = node?.children || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {breadcrumb.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 1.5 }}
        >
          {breadcrumb.map((item, idx) => {
            const isLast = idx === breadcrumb.length - 1;
            return isLast ? (
              <Typography
                key={item.codLocal}
                variant="body2"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {item.descrLocal}
              </Typography>
            ) : (
              <Link
                key={item.codLocal}
                component="button"
                variant="body2"
                underline="hover"
                color="text.secondary"
                onClick={() => onNavigate(item.codLocal)}
                sx={{ cursor: 'pointer' }}
              >
                {item.descrLocal}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Inventory2 color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {node?.descrLocal || `Local ${codLocal}`}
        </Typography>
        <Chip
          label={String(codLocal)}
          size="small"
          variant="outlined"
          sx={{ fontFamily: 'monospace' }}
        />
        {isLeaf && (
          <Chip label="Folha" size="small" color="success" variant="outlined" />
        )}
        {isBranch && (
          <Chip label="Grupo" size="small" color="info" variant="outlined" />
        )}
        {node?.codparcUsuario && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <FuncionarioAvatar
              codparc={node.codparcUsuario}
              nome={node.nomeUsuario || undefined}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {node.nomeUsuario}
            </Typography>
          </Box>
        )}
      </Box>

      {children.length > 0 && (
        <SubLocaisList children={children} onNavigate={onNavigate} />
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 4 }}>
          <CircularProgress size={20} />
          <Typography>Carregando estoque...</Typography>
        </Box>
      )}

      {error && (
        <ErrorDetail
          error={error}
          context={`Carregar estoque do local ${codLocal}`}
        />
      )}

      {estoque && estoque.length === 0 && !isLoading && (
        <Alert severity="info" icon={<Warning />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Nenhum produto com estoque neste local
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {isBranch
              ? 'Este local é um agrupador (não-analítico). '
                + 'Produtos ficam nos sub-locais filhos.'
              : 'Este local analítico não possui movimentação de '
                + 'estoque registrada em TGFEST.'}
          </Typography>
        </Alert>
      )}

      {estoque && estoque.length > 0 && (
        <>
          <EstoqueToolbar
            viewMode={viewMode}
            onViewChange={onViewChange}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            totalCount={estoque.length}
            filteredCount={filtered.length}
            hideDesativados={hideDesativados}
            onHideDesativadosChange={onHideDesativadosChange}
          />

          {filtered.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Nenhum produto encontrado para "{searchTerm}"
            </Typography>
          ) : (
            <>
              {viewMode === 'grid' && (
                <EstoqueGridView items={filtered} onSelect={handleSelect} />
              )}
              {viewMode === 'list' && (
                <EstoqueListView items={filtered} onSelect={handleSelect} />
              )}
              {viewMode === 'table' && (
                <EstoqueTableView items={filtered} onSelect={handleSelect} />
              )}
            </>
          )}
        </>
      )}

      <ProdutoDetailDrawer
        open={!!selectedItem}
        onClose={() => onSelectProduto(null)}
        item={selectedItem}
        localNode={node}
      />
    </Box>
  );
}

function SubLocaisList(
  { children, onNavigate }:
  { children: ArvoreLocal[]; onNavigate: (codLocal: number) => void },
) {
  return (
    <>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mt: 1, mb: 0.5 }}
      >
        Sub-locais ({children.length})
      </Typography>
      <List dense disablePadding sx={{ mb: 1 }}>
        {children.map((child) => {
          const childTotal = sumEstoque(child);
          const hasChildChildren = child.children.length > 0;
          return (
            <ListItemButton
              key={child.codLocal}
              onClick={() => onNavigate(child.codLocal)}
              sx={{ py: 0.25, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                {hasChildChildren ? (
                  <FolderOpen sx={{ fontSize: 16, color: 'warning.main' }} />
                ) : (
                  <Inventory
                    sx={{
                      fontSize: 14,
                      color: child.totalProdutosEstoque > 0
                        ? 'success.main'
                        : 'text.disabled',
                    }}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={child.descrLocal}
                primaryTypographyProps={{ variant: 'body2' }}
              />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Chip
                  label={String(child.codLocal)}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'monospace' }}
                />
                {child.totalProdutosEstoque > 0 && (
                  <Chip
                    label={`${child.totalProdutosEstoque} itens`}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
                {hasChildChildren && childTotal > 0 && (
                  <Chip
                    label={`${childTotal} total`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ mb: 1.5 }} />
    </>
  );
}
