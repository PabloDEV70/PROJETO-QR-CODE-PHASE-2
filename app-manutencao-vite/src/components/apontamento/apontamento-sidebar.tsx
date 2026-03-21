import { useCallback } from 'react';
import {
  Box, Button, IconButton, Stack, TextField, ToggleButton, ToggleButtonGroup,
  Typography, InputAdornment, CircularProgress, Tooltip, Pagination,
  Chip, alpha,
} from '@mui/material';
import { Add, Refresh, Search } from '@mui/icons-material';
import { ApontamentoCard } from './apontamento-card';
import type { ApontamentoListItem } from '@/types/apontamento-types';

interface ApontamentoSidebarProps {
  items: ApontamentoListItem[];
  total: number;
  isLoading: boolean;
  selectedId: number | null;
  onSelect: (item: ApontamentoListItem) => void;
  onAdd: () => void;
  onRefresh: () => void;
  statusOs: string;
  onStatusChange: (s: string) => void;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  width?: number;
  search: string;
  onSearchChange: (search: string) => void;
}

const STATUS_TOGGLE_SX = {
  width: '100%',
  '& .MuiToggleButton-root': {
    textTransform: 'none' as const, fontSize: 10, fontWeight: 600,
    px: 0.75, py: 0.25, lineHeight: 1.6, flex: 1,
    '&.Mui-selected': {
      bgcolor: 'rgba(46,125,50,0.12)', color: '#2e7d32',
      '&:hover': { bgcolor: 'rgba(46,125,50,0.18)' },
    },
  },
};

export function ApontamentoSidebar({
  items, total, isLoading, selectedId, onSelect, onAdd, onRefresh,
  statusOs, onStatusChange, page, limit, onPageChange,
  width, search, onSearchChange,
}: ApontamentoSidebarProps) {

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = useCallback((_: unknown, p: number) => {
    onPageChange(p);
  }, [onPageChange]);

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRight: '1px solid', borderColor: 'divider',
      width: width ? `${width}px` : { xs: '100%', md: 340 },
      minWidth: 260, maxWidth: 500, flexShrink: 0,
      bgcolor: (t) => t.palette.mode === 'dark' ? 'background.default' : alpha('#f5f5f5', 0.5),
    }}>
      {/* Header */}
      <Box sx={{
        px: 1.5, py: 1.25,
        borderBottom: '1px solid', borderColor: 'divider',
        flexShrink: 0, bgcolor: 'background.paper',
      }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, flex: 1 }}>
            Apontamentos
          </Typography>
          <Chip
            label={total}
            size="small"
            sx={{ height: 20, fontSize: 10, fontWeight: 700, minWidth: 28 }}
          />
          <Tooltip title="Recarregar lista de apontamentos">
            <IconButton size="small" onClick={onRefresh} sx={{ ml: 0.5 }}>
              <Refresh sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Criar novo apontamento de manutencao">
            <Button
              variant="contained" color="success" size="small"
              startIcon={<Add />}
              onClick={onAdd}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 11, borderRadius: '6px', px: 1, py: 0.25, minWidth: 0 }}
            >
              Novo
            </Button>
          </Tooltip>
        </Stack>

        {/* Search */}
        <TextField
          size="small" fullWidth placeholder="Buscar placa, TAG, codigo..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 16, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: {
                fontSize: 12, height: 32, borderRadius: '6px',
                bgcolor: 'background.paper',
              },
            },
          }}
          sx={{ mb: 1 }}
        />

        {/* Status filter */}
        <ToggleButtonGroup
          value={statusOs} exclusive size="small"
          onChange={(_, v) => { if (v !== null) onStatusChange(v); }}
          sx={STATUS_TOGGLE_SX}
        >
          <Tooltip title="Exibir todos os apontamentos"><ToggleButton value="">Todos</ToggleButton></Tooltip>
          <Tooltip title="Filtrar por Manutencao"><ToggleButton value="MA">Manut.</ToggleButton></Tooltip>
          <Tooltip title="Filtrar por Avaliacao"><ToggleButton value="AV">Aval.</ToggleButton></Tooltip>
          <Tooltip title="Filtrar por Aguardando Pecas (Impeditivo)"><ToggleButton value="AI">Ag.Imp</ToggleButton></Tooltip>
          <Tooltip title="Filtrar por Aguardando Pecas (Nao Impeditivo)"><ToggleButton value="AN">Ag.N/I</ToggleButton></Tooltip>
          <Tooltip title="Filtrar por Servico (Impeditivo)"><ToggleButton value="SI">Sv.Imp</ToggleButton></Tooltip>
          <Tooltip title="Filtrar por Servico de Terceiros (Nao Impeditivo)"><ToggleButton value="SN">Sv.3os</ToggleButton></Tooltip>
        </ToggleButtonGroup>
      </Box>

      {/* List — scrollable area */}
      <Box sx={{
        flex: 1, minHeight: 0, overflowY: 'auto', py: 0.5,
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'action.disabled', borderRadius: 3,
          '&:hover': { bgcolor: 'action.active' },
        },
      }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
              Nenhum apontamento encontrado
            </Typography>
          </Box>
        ) : (
          items.map((item) => (
            <ApontamentoCard
              key={item.CODIGO}
              item={item}
              selected={item.CODIGO === selectedId}
              onClick={() => onSelect(item)}
            />
          ))
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{
          flexShrink: 0, borderTop: '1px solid', borderColor: 'divider',
          display: 'flex', justifyContent: 'center', py: 0.5,
          bgcolor: 'background.paper',
        }}>
          <Pagination
            count={totalPages} page={page} onChange={handlePageChange}
            size="small" siblingCount={0} boundaryCount={1}
            sx={{ '& .MuiPaginationItem-root': { fontSize: 11 } }}
          />
        </Box>
      )}
    </Box>
  );
}
