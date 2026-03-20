import { useState } from 'react';
import {
  Box, Typography, IconButton, TextField, Chip, Stack, InputAdornment,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import {
  AddRounded, SearchRounded, MoreVert, TuneRounded,
  ViewKanbanRounded, DarkMode, LightMode,
  FiberManualRecord, PostAddRounded, LogoutRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from '@/components/layout/user-menu';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useApiHealth } from '@/hooks/use-api-health';
import { useChatColors } from './use-chat-colors';

interface ChatListHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onNewChamado: () => void;
  onlineCount?: number;
}

const TI_GROUP = 13;

const MAIN_CHIPS = [
  { value: 'todos', label: 'Todos' },
  { value: 'P', label: 'Pend.' },
  { value: 'E', label: 'Atend.' },
  { value: 'A', label: 'Aguard.' },
] as const;

const MORE_CHIPS = [
  { value: 'S', label: 'Suspensos' },
  { value: 'F', label: 'Finalizados' },
  { value: 'C', label: 'Cancelados' },
] as const;

export function ChatListHeader({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onNewChamado,
  onlineCount,
}: ChatListHeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isTI = user?.codgrupo === TI_GROUP;
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const c = useChatColors();
  const { isOnline: isApiOnline } = useApiHealth();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const isMoreActive = MORE_CHIPS.some((ch) => ch.value === statusFilter);

  return (
    <Box sx={{ flexShrink: 0 }}>
      {/* Top bar — WhatsApp style */}
      <Box
        sx={{
          bgcolor: c.sidebarHeaderBg,
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 60,
        }}
      >
        <UserMenu />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: 15, fontWeight: 700, color: c.textPrimary,
            lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.nome || user?.username}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 12, color: c.textMuted, lineHeight: 1.3 }}>
              {user?.nomegrupo || 'Chamados TI'}
            </Typography>
            {/* API status dot */}
            <Box
              title={isApiOnline ? 'API online' : 'API offline'}
              sx={{
                width: 6, height: 6, borderRadius: '50%',
                bgcolor: isApiOnline ? '#22c55e' : '#ef4444',
                boxShadow: isApiOnline
                  ? '0 0 4px rgba(34,197,94,0.5)'
                  : '0 0 4px rgba(239,68,68,0.5)',
                transition: 'background-color 0.3s',
              }}
            />
            {onlineCount != null && onlineCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  bgcolor: '#22c55e',
                  boxShadow: '0 0 4px rgba(34,197,94,0.5)',
                }} />
                <Typography sx={{ fontSize: 10, color: '#22c55e', fontWeight: 600, lineHeight: 1 }}>
                  {onlineCount}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <IconButton
          onClick={onNewChamado}
          size="small"
          sx={{ color: c.textSecondary, '&:hover': { color: c.textPrimary } }}
        >
          <AddRounded />
        </IconButton>

        <IconButton
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          size="small"
          sx={{ color: c.textSecondary, '&:hover': { color: c.textPrimary } }}
        >
          <MoreVert />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { mt: 0.5, minWidth: 200 } } }}
        >
          <MenuItem onClick={() => { setMenuAnchor(null); navigate('/chamados'); }}>
            <ListItemIcon><ViewKanbanRounded fontSize="small" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Kanban / Lista</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setMenuAnchor(null); toggleTheme(); }}>
            <ListItemIcon>
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
              {mode === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </ListItemText>
          </MenuItem>
          {isTI && [
            <Divider key="d-master" />,
            <MenuItem key="master" onClick={() => { setMenuAnchor(null); navigate('/chamados/chat/novo?master=1'); }}>
              <ListItemIcon><PostAddRounded fontSize="small" /></ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Novo Avançado</ListItemText>
            </MenuItem>,
          ]}
          {onlineCount != null && onlineCount > 0 && [
            <Divider key="d-online" />,
            <MenuItem key="online" disabled>
              <ListItemIcon>
                <FiberManualRecord sx={{ fontSize: 10, color: '#22c55e' }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
                {onlineCount} {onlineCount === 1 ? 'usuario online' : 'usuarios online'}
              </ListItemText>
            </MenuItem>,
          ]}
          <Divider />
          <MenuItem onClick={() => { setMenuAnchor(null); logout(); navigate('/login'); }}>
            <ListItemIcon><LogoutRounded fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13, color: '#ef4444' }}>Sair</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Search bar */}
      <Box sx={{ px: 1, py: 0.75, bgcolor: c.searchBg }}>
        <TextField
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar ou comecar um novo chamado"
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 20, color: c.textMuted }} />
                </InputAdornment>
              ),
              sx: {
                height: 36,
                borderRadius: '8px',
                fontSize: 14,
                bgcolor: c.searchInputBg,
                color: c.textPrimary,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&::placeholder': { color: c.textMuted },
              },
            },
          }}
        />
      </Box>

      {/* Status filter chips */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          px: 1,
          py: 0.75,
          bgcolor: c.searchBg,
          borderBottom: `1px solid ${c.listDivider}`,
          overflowX: 'auto',
          alignItems: 'center',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {MAIN_CHIPS.map((chip) => {
          const active = statusFilter === chip.value;
          return (
            <Chip
              key={chip.value}
              label={chip.label}
              size="small"
              onClick={() => onStatusFilterChange(chip.value)}
              sx={{
                fontSize: 13,
                fontWeight: 400,
                height: 32,
                borderRadius: '16px',
                bgcolor: active ? c.accentBg : c.searchInputBg,
                color: active ? c.accent : c.textSecondary,
                '&:hover': { bgcolor: active ? c.accentBg : c.listDivider },
                cursor: 'pointer',
                flexShrink: 0,
                border: 'none',
              }}
            />
          );
        })}

        {/* More filters button — icon-only when inactive, shows label when active */}
        {isMoreActive ? (
          <Chip
            icon={<TuneRounded sx={{ fontSize: 16, color: c.accent }} />}
            label={MORE_CHIPS.find((ch) => ch.value === statusFilter)?.label}
            size="small"
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            sx={{
              fontSize: 13,
              fontWeight: 400,
              height: 32,
              borderRadius: '16px',
              bgcolor: c.accentBg,
              color: c.accent,
              '&:hover': { bgcolor: c.accentBg },
              cursor: 'pointer',
              flexShrink: 0,
              border: 'none',
            }}
          />
        ) : (
          <IconButton
            size="small"
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            sx={{
              width: 32,
              height: 32,
              color: c.textMuted,
              '&:hover': { bgcolor: c.listDivider },
            }}
          >
            <TuneRounded sx={{ fontSize: 18 }} />
          </IconButton>
        )}

        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
          slotProps={{ paper: { sx: { mt: 0.5, minWidth: 160 } } }}
        >
          {MORE_CHIPS.map((chip) => (
            <MenuItem
              key={chip.value}
              selected={statusFilter === chip.value}
              onClick={() => { onStatusFilterChange(chip.value); setFilterAnchor(null); }}
              sx={{ fontSize: 13, py: 0.75 }}
            >
              {chip.label}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </Box>
  );
}
