import {
  Box, Paper, Typography, IconButton, Tooltip, Chip, Button,
} from '@mui/material';
import { PlayArrow, ContentCopy, Delete, DeleteSweep } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { copyToClipboard } from '@/utils/clipboard';
import {
  useQueryHistoryStore,
  type QueryHistoryEntry,
} from '@/stores/query-history-store';

interface QueryHistoryPanelProps {
  onLoad: (sql: string) => void;
  onRun: (sql: string) => void;
}

const iconSx = { fontSize: 14 } as const;

function HistoryRow({
  entry, onLoad, onRun,
}: { entry: QueryHistoryEntry; onLoad: (sql: string) => void; onRun: (sql: string) => void }) {
  const remove = useQueryHistoryStore((s) => s.removeEntry);
  const ago = formatDistanceToNow(new Date(entry.executedAt), { locale: ptBR, addSuffix: true });
  const preview = entry.sql.replace(/\s+/g, ' ').trim().slice(0, 120);

  return (
    <Paper variant="outlined"
      sx={{
        p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' },
        display: 'flex', flexDirection: 'column', gap: 0.5,
      }}
      onClick={() => onLoad(entry.sql)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Chip label={entry.tableName} size="small" variant="outlined"
          sx={{ height: 18, fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }} />
        <Chip label={`${entry.rowCount} rows`} size="small"
          sx={{ height: 18, fontSize: 10 }} />
        <Chip label={`${entry.execTimeMs}ms`} size="small" variant="outlined"
          sx={{ height: 18, fontSize: 10 }} />
        <Typography sx={{ fontSize: 10, color: 'text.disabled', ml: 'auto' }}>
          {ago}
        </Typography>
      </Box>
      <Typography sx={{
        fontSize: 11, fontFamily: 'monospace', color: 'text.secondary',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {preview}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.25, mt: 0.25 }} onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Executar" arrow>
          <IconButton size="small" color="primary" onClick={() => onRun(entry.sql)}>
            <PlayArrow sx={iconSx} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copiar SQL" arrow>
          <IconButton size="small" onClick={() => copyToClipboard(entry.sql)}>
            <ContentCopy sx={iconSx} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remover" arrow>
          <IconButton size="small" onClick={() => remove(entry.id)}>
            <Delete sx={iconSx} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}

export function QueryHistoryPanel({ onLoad, onRun }: QueryHistoryPanelProps) {
  const entries = useQueryHistoryStore((s) => s.entries);
  const clearAll = useQueryHistoryStore((s) => s.clearAll);

  if (entries.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Nenhuma query no historico. Execute um SELECT para comecar.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
          {entries.length} queries recentes
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button size="small" startIcon={<DeleteSweep sx={{ fontSize: 14 }} />}
          onClick={clearAll} color="error"
          sx={{ fontSize: 11, textTransform: 'none' }}>
          Limpar
        </Button>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {entries.map((e) => (
          <HistoryRow key={e.id} entry={e} onLoad={onLoad} onRun={onRun} />
        ))}
      </Box>
    </Box>
  );
}
