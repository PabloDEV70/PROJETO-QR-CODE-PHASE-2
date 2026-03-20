import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Skeleton,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export interface SearchResultItem {
  id: string | number;
  primary: string;
  secondary?: string;
  icon?: ReactNode;
  avatar?: ReactNode;
  onClick: () => void;
}

export interface SearchResultGroup {
  label: string;
  icon?: ReactNode;
  items: SearchResultItem[];
}

export interface SearchScreenProps {
  open: boolean;
  onClose: () => void;
  placeholder?: string;
  onSearch: (query: string) => void;
  results?: SearchResultGroup[];
  loading?: boolean;
}

export function SearchScreen({
  open,
  onClose,
  placeholder = 'Buscar...',
  onSearch,
  results,
  loading = false,
}: SearchScreenProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(value), 300);
    },
    [onSearch],
  );

  const handleItemClick = useCallback(
    (item: SearchResultItem) => {
      item.onClick();
      onClose();
    },
    [onClose],
  );

  const hasResults = results && results.some((g) => g.items.length > 0);
  const searched = query.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      sx={{ '& .MuiDialog-paper': { minHeight: isMobile ? undefined : 400 } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {loading && (
          <Box sx={{ px: 2, pb: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
            ))}
          </Box>
        )}

        {!loading && hasResults && (
          <List dense sx={{ pb: 2 }}>
            {results.map((group) =>
              group.items.length > 0 ? (
                <Box key={group.label}>
                  <ListSubheader sx={{ lineHeight: '32px' }}>
                    {group.icon && (
                      <Box component="span" sx={{ mr: 1, verticalAlign: 'middle' }}>
                        {group.icon}
                      </Box>
                    )}
                    {group.label}
                  </ListSubheader>
                  {group.items.map((item) => (
                    <ListItemButton
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                    >
                      {item.icon && <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>}
                      {item.avatar && <ListItemAvatar>{item.avatar}</ListItemAvatar>}
                      <ListItemText primary={item.primary} secondary={item.secondary} />
                    </ListItemButton>
                  ))}
                </Box>
              ) : null,
            )}
          </List>
        )}

        {!loading && searched && !hasResults && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum resultado para &apos;{query}&apos;
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
