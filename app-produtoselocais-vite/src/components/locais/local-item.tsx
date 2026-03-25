import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Collapse,
  Chip,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Inventory,
  Folder,
  FolderOpen,
  Person,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import type { ArvoreLocal } from '@/types/local-produto';

interface LocalItemProps {
  node: ArvoreLocal;
  selectedLocal: number | null;
  expandedPath: Set<number>;
  onSelect: (codLocal: number) => void;
}

function sumEstoque(node: ArvoreLocal): number {
  let total = node.totalProdutosEstoque;
  for (const child of node.children) {
    total += sumEstoque(child);
  }
  return total;
}

function formatLevel(codLocal: number, grau: number): string {
  const code = codLocal.toString().padStart(6, '0');
  if (grau === 1) return `${code.slice(0,2)}.${code.slice(2)}`;
  if (grau === 2) return `${code.slice(0,2)}.${code.slice(2,4)}.${code.slice(4)}`;
  return `${code.slice(0,2)}.${code.slice(2,4)}.${code.slice(4)}`;
}

function getGrauLabel(grau: number): string {
  const labels: Record<number, string> = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5' };
  return labels[grau] || `N${grau}`;
}

function getGrauColor(grau: number): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
  const colors: Record<number, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
    1: 'primary',
    2: 'secondary',
    3: 'success',
    4: 'warning',
    5: 'error',
  };
  return colors[grau] || 'primary';
}

export function LocalItemComponent({
  node,
  selectedLocal,
  expandedPath,
  onSelect,
}: LocalItemProps) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedLocal === node.codLocal;
  const shouldAutoExpand = expandedPath.has(node.codLocal) && !isSelected;
  const [open, setOpen] = useState(shouldAutoExpand);

  useEffect(() => {
    if (shouldAutoExpand) setOpen(true);
  }, [shouldAutoExpand]);

  const totalEstoque = useMemo(() => sumEstoque(node), [node]);
  const isLeaf = node.analitico === 'S';

  return (
    <>
      <ListItemButton
        onClick={() => {
          if (hasChildren) setOpen(!open);
          onSelect(node.codLocal);
        }}
        selected={isSelected}
        sx={{
          pl: node.grau * 2 + 1,
          pr: 1,
          py: 0.5,
          borderRadius: 1,
          mb: 0.25,
          '&.Mui-selected': {
            bgcolor: 'primary.light',
            '&:hover': { bgcolor: 'primary.light' },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            {hasChildren ? (
              open ? (
                <FolderOpen sx={{ fontSize: 18, color: 'warning.main' }} />
              ) : (
                <Folder sx={{ fontSize: 18, color: 'warning.main' }} />
              )
            ) : (
              <Inventory
                sx={{
                  fontSize: 16,
                  color: node.totalProdutosEstoque > 0
                    ? 'success.main'
                    : 'text.disabled',
                }}
              />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: isSelected ? 600 : 400 }}
            >
              {node.descrLocal}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
              <Chip
                label={getGrauLabel(node.grau)}
                size="small"
                color={getGrauColor(node.grau)}
                sx={{ height: 16, fontSize: '0.6rem', fontWeight: 600 }}
              />
              <Chip
                label={formatLevel(node.codLocal, node.grau)}
                size="small"
                variant="outlined"
                sx={{ height: 16, fontSize: '0.6rem', fontFamily: 'monospace' }}
              />
              <Chip
                label={`ID:${node.codLocal}`}
                size="small"
                variant="outlined"
                sx={{ height: 16, fontSize: '0.55rem', color: 'text.disabled' }}
              />
              {isLeaf && node.totalProdutosEstoque > 0 && (
                <Chip
                  label={`${node.totalProdutosEstoque} itens`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              )}
              {!isLeaf && totalEstoque > 0 && (
                <Chip
                  label={`${totalEstoque} total`}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              )}
              {node.nomeUsuario && (
                <Tooltip title={node.nomeUsuario} arrow>
                  <Chip
                    icon={<Person sx={{ fontSize: '0.7rem !important' }} />}
                    label={node.nomeUsuario.split('.')[0]}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    sx={{ height: 16, fontSize: '0.55rem' }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
          {hasChildren && (
            <Box sx={{ ml: 0.5 }}>
              {open
                ? <ExpandLess sx={{ fontSize: 18 }} />
                : <ExpandMore sx={{ fontSize: 18 }} />}
            </Box>
          )}
        </Box>
      </ListItemButton>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            {node.children.map((child) => (
              <LocalItemComponent
                key={child.codLocal}
                node={child}
                selectedLocal={selectedLocal}
                expandedPath={expandedPath}
                onSelect={onSelect}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
