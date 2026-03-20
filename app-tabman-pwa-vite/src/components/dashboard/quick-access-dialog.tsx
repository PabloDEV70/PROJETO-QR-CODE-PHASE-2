import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Avatar, Box, Dialog, DialogContent, InputAdornment,
  List, ListItemAvatar, ListItemButton, ListItemText,
  TextField, Typography, alpha,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useColaboradores } from '@/hooks/use-colaboradores';
import { getFotoUrl } from '@/api/funcionarios';
import type { ColaboradorGrid } from '@/types/funcionario-types';

interface QuickAccessDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (colab: ColaboradorGrid) => void;
}

export function QuickAccessDialog({ open, onClose, onSelect }: QuickAccessDialogProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { allColaboradores } = useColaboradores();

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 150); }
  }, [open]);

  const results = useMemo(() => {
    if (!allColaboradores || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    const isNum = /^\d+$/.test(q) || (q.includes('.') && digits.length >= 3);
    return allColaboradores
      .filter((c) => isNum
        ? String(c.codparc).startsWith(digits) || (c.cgcCpf && c.cgcCpf.replace(/\D/g, '').includes(digits))
        : c.nomeparc.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [allColaboradores, query]);

  const handleSelect = (c: ColaboradorGrid) => {
    setQuery('');
    onSelect(c);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, overflow: 'hidden' } } }}
    >
      <DialogContent sx={{ p: 2 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 1.5, textAlign: 'center' }}>
          Identificar colaborador
        </Typography>

        <TextField
          inputRef={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Codigo, CPF ou nome..."
          fullWidth autoComplete="off" size="small"
          slotProps={{ input: {
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
            sx: { fontSize: '0.9rem', fontFamily: query && /^\d+$/.test(query) ? '"JetBrains Mono", monospace' : 'inherit' },
          }}}
          sx={{ mb: 1 }}
        />

        {/* Results */}
        {query.trim() && results.length === 0 && (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', textAlign: 'center', py: 2 }}>
            Nenhum colaborador encontrado
          </Typography>
        )}

        {results.length > 0 && (
          <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
            {results.map((c) => (
              <ListItemButton
                key={c.codparc}
                onClick={() => handleSelect(c)}
                sx={{ borderRadius: 1, mb: 0.5, '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) } }}
              >
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar src={c.temFoto ? getFotoUrl(c.codparc) : undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
                    {c.nomeparc.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.nomeparc}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontFamily: 'monospace' }}>#{c.codparc}</Typography>
                    </Box>
                  }
                  secondary={
                    <Typography component="span" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                      {[c.cargo, c.departamento].filter(Boolean).join(' — ')}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {!query.trim() && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', textAlign: 'center', py: 2 }}>
            Digite seu codigo, CPF ou nome para se identificar
          </Typography>
        )}

        <Typography
          onClick={onClose}
          sx={{ fontSize: '0.72rem', color: 'text.disabled', textAlign: 'center', mt: 1.5, cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}
        >
          Cancelar
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
