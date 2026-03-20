import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Alert, Typography, Box, CircularProgress,
} from '@mui/material';
import { useGistStore } from '@/stores/gist-store';
import { useValidateGithubToken } from '@/hooks/use-gist';

interface QueryTokenDialogProps {
  open: boolean;
  onClose: () => void;
}

export function QueryTokenDialog({ open, onClose }: QueryTokenDialogProps) {
  const [draft, setDraft] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const setToken = useGistStore((s) => s.setGithubToken);
  const currentToken = useGistStore((s) => s.githubToken);
  const validate = useValidateGithubToken();

  const handleValidate = () => {
    validate.mutate(draft, {
      onSuccess: (data) => setUsername(data.login),
    });
  };

  const handleSave = () => {
    setToken(draft);
    onClose();
  };

  const handleClear = () => {
    setToken(null);
    setDraft('');
    setUsername(null);
    validate.reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configurar Token GitHub</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Execute <code>gh auth token</code> no terminal, ou crie um PAT em
          github.com/settings/tokens com scope <strong>gist</strong>.
        </Typography>
        <TextField
          fullWidth size="small" type="password"
          label="GitHub Token" value={draft}
          onChange={(e) => { setDraft(e.target.value); setUsername(null); validate.reset(); }}
          placeholder="ghp_xxxx ou gho_xxxx"
        />
        {validate.isError && (
          <Alert severity="error" sx={{ mt: 1, py: 0 }}>
            Token invalido: {(validate.error as Error).message}
          </Alert>
        )}
        {username && (
          <Alert severity="success" sx={{ mt: 1, py: 0 }}>
            Conectado como <strong>@{username}</strong>
          </Alert>
        )}
        {currentToken && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Token configurado. Clique &quot;Limpar&quot; para remover.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {currentToken && (
          <Button onClick={handleClear} color="error" size="small">Limpar</Button>
        )}
        <Button onClick={onClose} size="small">Cancelar</Button>
        <Button
          onClick={handleValidate} size="small" disabled={!draft || validate.isPending}
          startIcon={validate.isPending ? <CircularProgress size={14} /> : undefined}
        >
          Validar
        </Button>
        <Button
          onClick={handleSave} variant="contained" size="small"
          disabled={!username}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
