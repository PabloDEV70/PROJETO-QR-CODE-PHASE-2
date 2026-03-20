import { useState } from 'react';
import { Box, Typography, Collapse, Stack, Chip } from '@mui/material';
import {
  ExpandMore, ChevronRight, Folder, FolderOpen, Build,
} from '@mui/icons-material';
import type { ArvoreGrupo } from '@/types/grupo-types';

interface GrupoTreeNodeProps {
  node: ArvoreGrupo;
  depth: number;
  selectedId: number | null;
  onSelect: (grupo: ArvoreGrupo) => void;
  defaultExpanded?: boolean;
}

export function GrupoTreeNode({
  node, depth, selectedId, onSelect, defaultExpanded = false,
}: GrupoTreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || depth === 0);
  const hasChildren = node.children.length > 0;
  const servicoCount = node.servicos?.length ?? 0;
  const isSelected = selectedId === node.codGrupoProd;
  const isAnalytic = node.analitico === 'S';

  const totalServicos = countAllServicos(node);

  return (
    <Box>
      <Box
        onClick={() => onSelect(node)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          py: 0.6,
          px: 1,
          pl: 1 + depth * 2.5,
          cursor: 'pointer',
          borderRadius: '6px',
          bgcolor: isSelected ? 'primary.main' : 'transparent',
          color: isSelected ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: isSelected ? 'primary.dark' : 'action.hover',
          },
          transition: 'background-color 0.15s',
        }}
      >
        {hasChildren ? (
          <Box
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            sx={{
              display: 'flex', alignItems: 'center', cursor: 'pointer',
              color: isSelected ? 'inherit' : 'text.secondary',
            }}
          >
            {expanded ? <ExpandMore sx={{ fontSize: 18 }} /> : <ChevronRight sx={{ fontSize: 18 }} />}
          </Box>
        ) : (
          <Box sx={{ width: 18 }} />
        )}

        {expanded && hasChildren ? (
          <FolderOpen sx={{ fontSize: 18, color: isSelected ? 'inherit' : '#f9a825' }} />
        ) : (
          <Folder sx={{ fontSize: 18, color: isSelected ? 'inherit' : isAnalytic ? '#42a5f5' : '#fbc02d' }} />
        )}

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: isSelected ? 700 : hasChildren ? 600 : 400,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.descrGrupoProd}
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {servicoCount > 0 && (
            <Chip
              icon={<Build sx={{ fontSize: '12px !important' }} />}
              label={servicoCount}
              size="small"
              sx={{
                height: 20,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'action.hover',
                color: isSelected ? 'inherit' : 'text.secondary',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          )}
          {hasChildren && totalServicos > 0 && (
            <Typography
              sx={{
                fontSize: 10,
                color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.disabled',
                fontWeight: 500,
              }}
            >
              ({totalServicos})
            </Typography>
          )}
        </Stack>
      </Box>

      {hasChildren && (
        <Collapse in={expanded}>
          {node.children.map((child) => (
            <GrupoTreeNode
              key={child.codGrupoProd}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

function countAllServicos(node: ArvoreGrupo): number {
  let total = node.servicos?.length ?? 0;
  for (const child of node.children) {
    total += countAllServicos(child);
  }
  return total;
}
