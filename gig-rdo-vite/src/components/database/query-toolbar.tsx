import {
  Box, Button, Chip, CircularProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  PlayArrow, Save, FolderOpen, ContentCopy, GitHub, FormatAlignLeft,
} from '@mui/icons-material';

interface QueryToolbarProps {
  onExecute: () => void;
  onSave: () => void;
  onLoad: () => void;
  onCopy: () => void;
  onFormat: () => void;
  isPending: boolean;
  canExecute: boolean;
  rowCount?: number;
  execTimeMs?: number;
  hasToken: boolean;
  hasResults: boolean;
  activeGistName?: string;
}

export function QueryToolbar({
  onExecute, onSave, onLoad, onCopy, onFormat,
  isPending, canExecute, rowCount, execTimeMs,
  hasToken, hasResults, activeGistName,
}: QueryToolbarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      <Button
        variant="contained" size="small"
        startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <PlayArrow />}
        onClick={onExecute}
        disabled={isPending || !canExecute}
        sx={{ fontSize: 12 }}
      >
        Executar
      </Button>
      <Tooltip title="Salvar no Gist (Ctrl+S)">
        <IconButton size="small" onClick={onSave}>
          <Save fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Carregar do Gist (Ctrl+O)">
        <IconButton size="small" onClick={onLoad}>
          <FolderOpen fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Formatar SQL (Shift+Alt+F)">
        <IconButton size="small" onClick={onFormat}>
          <FormatAlignLeft fontSize="small" />
        </IconButton>
      </Tooltip>
      {hasResults && (
        <>
          <Tooltip title="Copiar resultados">
            <IconButton size="small" onClick={onCopy}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
          {rowCount !== undefined && (
            <Chip label={`${rowCount} linhas`} size="small" color="primary"
              variant="outlined" sx={{ height: 20, fontSize: 11 }} />
          )}
          {execTimeMs !== undefined && (
            <Chip label={`${execTimeMs}ms`} size="small" variant="outlined"
              sx={{ height: 20, fontSize: 11 }} />
          )}
        </>
      )}
      {activeGistName && (
        <Chip label={activeGistName} size="small" variant="outlined" color="secondary"
          sx={{ height: 20, fontSize: 11, ml: 'auto' }} />
      )}
      <Tooltip title={hasToken ? 'GitHub conectado' : 'GitHub nao configurado'}>
        <GitHub sx={{
          fontSize: 16, ml: activeGistName ? 0 : 'auto',
          color: hasToken ? 'success.main' : 'text.disabled',
        }} />
      </Tooltip>
    </Box>
  );
}
