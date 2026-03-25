import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Collapse, alpha, Tooltip } from '@mui/material';
import {
  KeyboardArrowDown, KeyboardArrowRight,
  Inventory2, FolderOpen, Folder, Person,
} from '@mui/icons-material';
import type { ArvoreLocal } from '@/types/local-produto';

interface LocalItemProps {
  node: ArvoreLocal;
  selectedLocal: number | null;
  expandedPath: Set<number>;
  onSelect: (codLocal: number) => void;
  level?: number;
}

function sumEstoque(node: ArvoreLocal): number {
  let total = node.totalProdutosEstoque;
  for (const child of node.children) total += sumEstoque(child);
  return total;
}

export function LocalItemComponent({
  node, selectedLocal, expandedPath, onSelect, level = 0,
}: LocalItemProps) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedLocal === node.codLocal;
  const shouldAutoExpand = expandedPath.has(node.codLocal) && !isSelected;
  const [open, setOpen] = useState(shouldAutoExpand);

  useEffect(() => {
    if (shouldAutoExpand) setOpen(true);
  }, [shouldAutoExpand]);

  const totalEstoque = useMemo(() => sumEstoque(node), [node]);
  const count = node.totalProdutosEstoque || totalEstoque;

  return (
    <>
      <Box
        onClick={() => { if (hasChildren) setOpen(!open); onSelect(node.codLocal); }}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.75,
          pl: level * 2.5 + 1, pr: 1.5, py: 0.75,
          cursor: 'pointer',
          borderRadius: 1.5,
          mx: 0.5, mb: 0.25,
          bgcolor: isSelected ? (t) => alpha(t.palette.primary.main, 0.1) : 'transparent',
          '&:hover': {
            bgcolor: isSelected
              ? (t) => alpha(t.palette.primary.main, 0.15)
              : 'action.hover',
          },
          transition: 'background-color 0.12s',
        }}
      >
        {/* Seta */}
        {hasChildren ? (
          <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {open
              ? <KeyboardArrowDown sx={{ fontSize: 18, color: 'text.secondary' }} />
              : <KeyboardArrowRight sx={{ fontSize: 18, color: 'text.secondary' }} />}
          </Box>
        ) : (
          <Box sx={{ width: 20, flexShrink: 0 }} />
        )}

        {/* Icone */}
        {hasChildren
          ? (open
            ? <FolderOpen sx={{ fontSize: 20, color: '#f0a500' }} />
            : <Folder sx={{ fontSize: 20, color: '#d4950a' }} />)
          : <Inventory2 sx={{ fontSize: 18, color: count > 0 ? 'success.main' : 'text.disabled' }} />
        }

        {/* Nome */}
        <Typography sx={{
          fontSize: 13, flex: 1, minWidth: 0,
          fontWeight: isSelected ? 700 : 400,
          color: isSelected ? 'primary.dark' : 'text.primary',
        }} noWrap>
          {node.descrLocal}
        </Typography>

        {/* Responsavel */}
        {node.nomeUsuario && (
          <Tooltip title={`Responsavel: ${node.nomeUsuario}`} arrow placement="right">
            <Person sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }} />
          </Tooltip>
        )}

        {/* Contador */}
        {count > 0 && (
          <Box sx={{
            minWidth: 24, height: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, px: 0.75, flexShrink: 0,
            bgcolor: (t) => alpha(t.palette.success.main, 0.1),
            color: 'success.dark',
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>
              {count}
            </Typography>
          </Box>
        )}
      </Box>

      {hasChildren && (
        <Collapse in={open} timeout={120} unmountOnExit>
          {node.children.map((child) => (
            <LocalItemComponent
              key={child.codLocal}
              node={child}
              selectedLocal={selectedLocal}
              expandedPath={expandedPath}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </Collapse>
      )}
    </>
  );
}
