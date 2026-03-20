import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  Collapse,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Build,
  Error as ErrorIcon,
  Folder,
  FolderOpen,
} from '@mui/icons-material';
import { useServicosArvore } from '@/hooks/use-servicos-grupo';
import type { ArvoreGrupo } from '@/types/servico-grupo';
import { ServicosLista } from '@/components/servicos-grupo/servicos-lista';

interface GrupoItemProps {
  node: ArvoreGrupo;
  selectedGrupo: number | null;
  onSelect: (codGrupo: number) => void;
}

function countDescendants(node: ArvoreGrupo): number {
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}

function GrupoItem({ node, selectedGrupo, onSelect }: GrupoItemProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedGrupo === node.codGrupoProd;
  const totalDescendants = useMemo(() => countDescendants(node), [node]);
  const totalServicos = node.servicos?.length || 0;

  const formatLevel = (codigo: number, grau: number) => {
    const code = codigo.toString().padStart(5, '0');
    if (grau === 1) {
      return `${code.slice(0,2)}.${code.slice(2,4)}.${code.slice(4)}`;
    }
    if (grau === 2) {
      return `${code.slice(0,2)}.${code.slice(2,4)}.${code.slice(4)}`;
    }
    return `${code.slice(0,2)}.${code.slice(2,4)}.${code.slice(4)}`;
  };

  const getGrauColor = (grau: number) => {
    const colors: Record<number, string> = {
      1: 'primary',
      2: 'secondary',
      3: 'default',
    };
    return colors[grau] || 'default';
  };

  return (
    <>
      <ListItemButton
        onClick={() => {
          if (hasChildren) {
            setOpen(!open);
          }
          onSelect(node.codGrupoProd);
        }}
        selected={isSelected}
        sx={{
          pl: (node.grau - 1) * 3 + 1,
          pr: 1,
          py: 0.75,
          borderRadius: 1,
          mb: 0.5,
          '&.Mui-selected': {
            bgcolor: 'primary.light',
            '&:hover': {
              bgcolor: 'primary.light',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            {hasChildren ? (
              open ? (
                <FolderOpen sx={{ fontSize: 18, color: 'warning.main' }} />
              ) : (
                <Folder sx={{ fontSize: 18, color: 'warning.main' }} />
              )
            ) : (
              <Build sx={{ fontSize: 16, color: 'primary.main' }} />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSelected ? 600 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {node.descrGrupoProd.trim()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
              <Chip
                label={formatLevel(node.codGrupoProd, node.grau)}
                size="small"
                color={getGrauColor(node.grau) as 'primary' | 'secondary' | 'default'}
                variant="outlined"
                sx={{ height: 18, fontSize: '0.7rem', fontFamily: 'monospace' }}
              />
              {totalServicos > 0 && (
                <Chip
                  label={`${totalServicos} serv`}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {totalDescendants > 0 && (
                <Chip
                  label={`${totalDescendants} sub`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          </Box>
          {hasChildren && (
            <Box sx={{ ml: 1 }}>
              {open ? (
                <ExpandLess sx={{ fontSize: 20 }} />
              ) : (
                <ExpandMore sx={{ fontSize: 20 }} />
              )}
            </Box>
          )}
        </Box>
      </ListItemButton>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Divider sx={{ my: 0.5 }} />
            {node.children.map((child) => (
              <GrupoItem
                key={child.codGrupoProd}
                node={child}
                selectedGrupo={selectedGrupo}
                onSelect={onSelect}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export function ServicosGrupoPage() {
  const { data: arvore, isLoading, error } = useServicosArvore();
  const [selectedGrupo, setSelectedGrupo] = useState<number | null>(null);

  const handleSelect = (codGrupo: number) => {
    setSelectedGrupo(codGrupo);
  };

  const getErrorDetails = (): { message: string; status?: number; data?: string } | null => {
    if (!error) return null;
    const err = error as { response?: { status?: number; data?: unknown } };
    return {
      message: error.message,
      status: err.response?.status,
      data: err.response?.data ? JSON.stringify(err.response.data, null, 2) : undefined,
    };
  };

  const errorDetails = getErrorDetails();

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', gap: 2 }}>
      <Paper sx={{ width: 420, flexShrink: 0, overflow: 'auto', p: 2 }}>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
          Árvore de Serviços
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecione um grupo para ver os serviços
        </Typography>
        {isLoading && <Typography>Carregando...</Typography>}
        {error && (
          <Alert severity="error" icon={<ErrorIcon />}>
            <Typography variant="subtitle2" fontWeight={600}>
              Erro ao carregar grupos
            </Typography>
            <Typography variant="body2">
              {String(errorDetails?.message)}
            </Typography>
            {errorDetails?.status && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Status:</strong> {errorDetails.status}
              </Typography>
            )}
            {errorDetails?.data && (
              <Box
                component="pre"
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                {errorDetails.data}
              </Box>
            )}
          </Alert>
        )}
        {arvore && (
          <List>
            {arvore.map((node) => (
              <GrupoItem
                key={node.codGrupoProd}
                node={node}
                selectedGrupo={selectedGrupo}
                onSelect={handleSelect}
              />
            ))}
          </List>
        )}
      </Paper>
      <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <ServicosLista codGrupo={selectedGrupo} />
      </Paper>
    </Box>
  );
}
