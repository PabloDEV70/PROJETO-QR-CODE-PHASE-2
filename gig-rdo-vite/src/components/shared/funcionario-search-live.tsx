import { useState, useEffect, useRef } from 'react';
import {
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Box,
  Typography,
  Popper,
  ClickAwayListener,
  CircularProgress,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useBuscarFuncionarios } from '@/hooks/use-funcionario';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

export interface FuncionarioSearchLiveProps {
  value: { codparc: number; nomeparc: string } | null;
  onChange: (func: { codparc: number; nomeparc: string } | null) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
}

export function FuncionarioSearchLive({
  value,
  onChange,
  label,
  placeholder = 'Digite 2+ caracteres para buscar...',
  size = 'small',
}: FuncionarioSearchLiveProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const { data: funcionarios = [], isLoading } = useBuscarFuncionarios(debouncedSearch);
  const results = funcionarios.slice(0, 10);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setOpen(e.target.value.length >= 2);
  };

  const handleSelect = (func: { codparc: number; nomeparc: string }) => {
    onChange(func);
    setSearch('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearch('');
    setOpen(false);
  };

  const displayValue = value ? value.nomeparc : search;

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          value={displayValue}
          onChange={handleInputChange}
          onFocus={(e) => {
            setAnchorEl(e.currentTarget);
            if (!value && search.length >= 2) setOpen(true);
          }}
          label={label}
          placeholder={value ? undefined : placeholder}
          size={size}
          fullWidth
          slotProps={{
            input: {
              readOnly: !!value,
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {isLoading && <CircularProgress size={18} sx={{ mr: 1 }} />}
                  {(value || search) && !isLoading && (
                    <InputAdornment position="end">
                      <Clear
                        fontSize="small"
                        sx={{ cursor: 'pointer', color: 'action.active' }}
                        onClick={handleClear}
                      />
                    </InputAdornment>
                  )}
                </>
              ),
            },
          }}
        />

        <Popper
          open={open && results.length > 0}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
        >
          <Paper elevation={8} sx={{ mt: 0.5, maxHeight: 350, overflow: 'auto' }}>
            <List dense disablePadding>
              {results.map((func) => (
                <ListItem
                  key={func.codparc}
                  onClick={() => handleSelect(func)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <FuncionarioAvatar
                      codparc={func.codparc}
                      nome={func.nomeparc}
                      showFoto={func.temFoto}
                      size="small"
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={func.nomeparc}
                    secondary={
                      [func.cargo, func.departamento].filter(Boolean).join(' - ')
                      || `#${func.codparc}`
                    }
                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                    secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>

        {open && debouncedSearch.length >= 2 && !isLoading && results.length === 0 && (
          <Popper
            open
            anchorEl={anchorEl}
            placement="bottom-start"
            style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
          >
            <Paper elevation={8} sx={{ mt: 0.5, p: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Nenhum funcionario encontrado para &ldquo;{debouncedSearch}&rdquo;
              </Typography>
            </Paper>
          </Popper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
