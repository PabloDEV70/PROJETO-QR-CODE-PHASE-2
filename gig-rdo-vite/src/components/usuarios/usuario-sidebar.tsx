import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box, TextField, List, ListItemButton, ListItemAvatar, ListItemText,
  Typography, ToggleButtonGroup, ToggleButton, InputAdornment,
  CircularProgress, Chip, Stack, IconButton,
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { useBuscarUsuarios } from '@/hooks/use-usuarios';
import type { UsuarioSearch } from '@/api/usuarios';

interface UsuarioSidebarProps {
  selectedId: number | null;
  ativo: 'S' | 'N';
  onSelect: (u: UsuarioSearch) => void;
  onAtivoChange: (v: 'S' | 'N') => void;
}

export function UsuarioSidebar({
  selectedId, ativo, onSelect, onAtivoChange,
}: UsuarioSidebarProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedSearch(localSearch), 300);
    return () => clearTimeout(timerRef.current);
  }, [localSearch]);

  const { data: usuarios = [], isLoading } = useBuscarUsuarios(debouncedSearch, ativo);

  const filtered = useMemo(() => {
    if (!localSearch) return usuarios;
    const q = localSearch.toLowerCase();
    return usuarios.filter((u) =>
      u.nomeusu.toLowerCase().includes(q)
      || u.nomeparc?.toLowerCase().includes(q)
      || u.email?.toLowerCase().includes(q),
    );
  }, [usuarios, localSearch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 1.5, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filtrar usuarios..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              ),
              endAdornment: isLoading ? (
                <InputAdornment position="end"><CircularProgress size={18} /></InputAdornment>
              ) : localSearch ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => { setLocalSearch(''); setDebouncedSearch(''); }}
                    edge="end"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        <ToggleButtonGroup
          value={ativo}
          exclusive
          onChange={(_, v) => v && onAtivoChange(v)}
          size="small"
          sx={{ mt: 1, width: '100%' }}
        >
          <ToggleButton value="S" sx={{ flex: 1, fontSize: 12 }}>Ativos</ToggleButton>
          <ToggleButton value="N" sx={{ flex: 1, fontSize: 12 }}>Inativos</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {filtered.map((u) => (
          <ListItemButton
            key={u.codusu}
            selected={selectedId === u.codusu}
            onClick={() => onSelect(u)}
            sx={{ py: 1, px: 1.5 }}
          >
            <ListItemAvatar sx={{ minWidth: 44 }}>
              <FuncionarioAvatar
                codparc={u.codparc}
                codemp={u.codemp ?? undefined}
                codfunc={u.codfunc ?? undefined}
                nome={u.nomeparc}
                size="small"
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={500} noWrap>
                  {u.nomeparc || u.nomeusu}
                </Typography>
              }
              secondary={
                <Stack component="span" spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" noWrap component="span">
                    {u.nomeusu}
                  </Typography>
                  {u.nomegrupo && (
                    <Chip
                      component="span"
                      label={u.nomegrupo}
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: 10 }}
                    />
                  )}
                </Stack>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
