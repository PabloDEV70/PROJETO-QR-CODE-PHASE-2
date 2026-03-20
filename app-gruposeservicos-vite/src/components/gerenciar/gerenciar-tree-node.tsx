import { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText,
} from '@mui/material';
import {
  ChevronRight, ExpandMore, Folder, FolderOpen,
  MoreVert, Edit, AddCircle, ToggleOff, ToggleOn,
} from '@mui/icons-material';
import type { ArvoreGrupo } from '@/types/grupo-types';

function countServicos(node: ArvoreGrupo): number {
  let total = node.servicos?.length ?? 0;
  for (const child of node.children) {
    total += countServicos(child);
  }
  return total;
}

interface GerenciarTreeNodeProps {
  node: ArvoreGrupo;
  depth: number;
  selectedId: number | null;
  selectedPath: number[];
  onSelect: (node: ArvoreGrupo) => void;
  onEditGrupo: (node: ArvoreGrupo) => void;
  onNewSubgrupo: (parentNode: ArvoreGrupo) => void;
  onToggleAtivo: (node: ArvoreGrupo) => void;
  showInativos: boolean;
  indexLabel: string;
  isProd: boolean;
}

export function GerenciarTreeNode({
  node, depth, selectedId, selectedPath, onSelect,
  onEditGrupo, onNewSubgrupo, onToggleAtivo,
  showInativos, indexLabel, isProd,
}: GerenciarTreeNodeProps) {
  const isInPath = selectedPath.includes(node.codGrupoProd);
  const [expanded, setExpanded] = useState(depth < 1 || isInPath);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (isInPath && !expanded) setExpanded(true);
  }, [isInPath]);

  const isInativo = node.ativo === 'N';
  if (isInativo && !showInativos) return null;

  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.codGrupoProd;
  const servicoCount = node.servicos?.length ?? 0;
  const totalServicos = countServicos(node);

  const visibleChildren = showInativos
    ? node.children
    : node.children.filter((c) => c.ativo !== 'N');

  return (
    <Box>
      <Box
        onClick={() => { onSelect(node); if (hasChildren && !expanded) setExpanded(true); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          py: 0.6, px: 1, pl: 1 + depth * 2,
          cursor: 'pointer', borderRadius: '4px', mx: 0.5, mb: 0.2,
          bgcolor: isSelected ? 'primary.main' : 'transparent',
          color: isSelected ? 'primary.contrastText' : isInativo ? 'text.disabled' : 'text.primary',
          opacity: isInativo ? 0.6 : 1,
          '&:hover': { bgcolor: isSelected ? 'primary.dark' : 'action.hover' },
          transition: 'background-color 0.1s',
        }}
      >
        {hasChildren ? (
          <Box
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            sx={{ display: 'flex', alignItems: 'center', color: isSelected ? 'inherit' : 'text.secondary', flexShrink: 0 }}
          >
            {expanded ? <ExpandMore sx={{ fontSize: 18 }} /> : <ChevronRight sx={{ fontSize: 18 }} />}
          </Box>
        ) : (
          <Box sx={{ width: 18, flexShrink: 0 }} />
        )}

        {expanded && hasChildren
          ? <FolderOpen sx={{ fontSize: 18, flexShrink: 0, color: isSelected ? 'inherit' : isInativo ? 'text.disabled' : '#f9a825' }} />
          : <Folder sx={{ fontSize: 18, flexShrink: 0, color: isSelected ? 'inherit' : isInativo ? 'text.disabled' : '#1976d2' }} />}

        <Typography
          sx={{
            fontSize: 10, fontFamily: 'monospace', fontWeight: 700, flexShrink: 0,
            color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.disabled',
            minWidth: depth === 0 ? 22 : depth === 1 ? 42 : 58,
          }}
        >
          {indexLabel}
        </Typography>

        <Typography
          sx={{
            fontSize: 12, fontWeight: isSelected ? 700 : hasChildren ? 600 : 400,
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: isInativo ? 'line-through' : 'none',
          }}
        >
          {node.descrGrupoProd}
        </Typography>

        {isInativo && (
          <Typography sx={{ fontSize: 9, color: isSelected ? 'rgba(255,255,255,0.5)' : 'text.disabled', fontStyle: 'italic', flexShrink: 0 }}>
            inativo
          </Typography>
        )}

        {servicoCount > 0 && (
          <Typography sx={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary', flexShrink: 0 }}>
            {servicoCount}
          </Typography>
        )}

        {hasChildren && totalServicos > servicoCount && (
          <Typography sx={{ fontSize: 9, color: isSelected ? 'rgba(255,255,255,0.4)' : 'text.disabled', flexShrink: 0 }}>
            ({totalServicos})
          </Typography>
        )}

        {(hovered || Boolean(menuAnchor)) && !isProd && (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
            sx={{
              p: 0.2, flexShrink: 0,
              color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
            }}
          >
            <MoreVert sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { setMenuAnchor(null); onEditGrupo(node); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Renomear</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onNewSubgrupo(node); }}>
          <ListItemIcon><AddCircle fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Novo Subgrupo</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onToggleAtivo(node); }}>
          <ListItemIcon>
            {isInativo ? <ToggleOn fontSize="small" color="success" /> : <ToggleOff fontSize="small" color="warning" />}
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
            {isInativo ? 'Ativar' : 'Desativar'}
          </ListItemText>
        </MenuItem>
      </Menu>

      {hasChildren && expanded && (
        <Box>
          {visibleChildren.map((child, i) => (
            <GerenciarTreeNode
              key={child.codGrupoProd}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onEditGrupo={onEditGrupo}
              onNewSubgrupo={onNewSubgrupo}
              onToggleAtivo={onToggleAtivo}
              showInativos={showInativos}
              indexLabel={`${indexLabel}.${String(i + 1).padStart(depth >= 1 ? 3 : 2, '0')}`}
              isProd={isProd}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
