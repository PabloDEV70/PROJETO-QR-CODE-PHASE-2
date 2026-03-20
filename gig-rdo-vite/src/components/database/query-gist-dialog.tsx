import { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert,
  Tabs, Tab, Box, List, ListItemButton, ListItemText, IconButton, Typography,
  CircularProgress, Chip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useGistList, useCreateGist, useUpdateGist, useDeleteGist } from '@/hooks/use-gist';
import type { Gist } from '@/types/gist-types';

interface QueryGistDialogProps {
  open: boolean;
  onClose: () => void;
  sql: string;
  activeGistId: string | null;
  activeGistFilename: string | null;
  onLoad: (sql: string, gistId: string, filename: string) => void;
}

export function QueryGistDialog({
  open, onClose, sql, activeGistId, activeGistFilename, onLoad,
}: QueryGistDialogProps) {
  const [tab, setTab] = useState(0);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [search, setSearch] = useState('');

  const { data: gists, isLoading } = useGistList();
  const createMut = useCreateGist();
  const updateMut = useUpdateGist();
  const deleteMut = useDeleteGist();

  const filtered = useMemo(() => {
    if (!gists) return [];
    if (!search) return gists;
    const q = search.toLowerCase();
    return gists.filter((g) =>
      g.description.toLowerCase().includes(q) ||
      Object.keys(g.files).some((f) => f.toLowerCase().includes(q)),
    );
  }, [gists, search]);

  const handleCreate = () => {
    if (!name.trim() || !sql.trim()) return;
    createMut.mutate({ name: name.trim(), sql, description: desc.trim() || undefined }, {
      onSuccess: () => { setName(''); setDesc(''); onClose(); },
    });
  };

  const handleUpdate = () => {
    if (!activeGistId || !activeGistFilename) return;
    updateMut.mutate({ id: activeGistId, sql, filename: activeGistFilename }, {
      onSuccess: () => onClose(),
    });
  };

  const handleLoad = (gist: Gist) => {
    const entry = Object.entries(gist.files)[0];
    if (!entry) return;
    const [filename, file] = entry;
    if (file.content) {
      onLoad(file.content, gist.id, filename);
      onClose();
    }
  };

  const handleDelete = (id: string) => deleteMut.mutate(id);

  const error = createMut.error || updateMut.error || deleteMut.error;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Queries Salvas (GitHub Gist)</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Salvar" />
          <Tab label="Carregar" />
        </Tabs>
        {error && (
          <Alert severity="error" sx={{ mx: 2, mt: 1, py: 0 }}>
            {(error as Error).message}
          </Alert>
        )}
        {tab === 0 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              size="small" fullWidth label="Nome da query" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="ex: top-parceiros"
            />
            <TextField
              size="small" fullWidth label="Descricao (opcional)" value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained" size="small" onClick={handleCreate}
                disabled={!name.trim() || !sql.trim() || createMut.isPending}
                startIcon={createMut.isPending ? <CircularProgress size={14} /> : undefined}
              >
                Salvar novo
              </Button>
              {activeGistId && (
                <Button
                  variant="outlined" size="small" onClick={handleUpdate}
                  disabled={updateMut.isPending}
                  startIcon={updateMut.isPending ? <CircularProgress size={14} /> : undefined}
                >
                  Atualizar &quot;{activeGistFilename}&quot;
                </Button>
              )}
            </Box>
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ p: 2, pt: 1 }}>
            <TextField
              size="small" fullWidth placeholder="Buscar..." value={search}
              onChange={(e) => setSearch(e.target.value)} sx={{ mb: 1 }}
            />
            {isLoading && <CircularProgress size={24} sx={{ mx: 'auto', display: 'block' }} />}
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filtered.map((gist) => {
                const filename = Object.keys(gist.files)[0];
                return (
                  <ListItemButton key={gist.id} onClick={() => handleLoad(gist)}>
                    <ListItemText
                      primary={filename}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" noWrap sx={{ maxWidth: 200 }}>
                            {gist.description.replace('[sankhya-query] ', '')}
                          </Typography>
                          <Chip label={new Date(gist.updated_at).toLocaleDateString('pt-BR')}
                            size="small" sx={{ height: 16, fontSize: 10 }} />
                        </Box>
                      }
                    />
                    <IconButton size="small" edge="end"
                      onClick={(e) => { e.stopPropagation(); handleDelete(gist.id); }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                );
              })}
              {!isLoading && !filtered.length && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  Nenhuma query salva encontrada.
                </Typography>
              )}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
