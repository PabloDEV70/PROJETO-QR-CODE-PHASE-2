import { Box, Paper, IconButton, Tooltip, Typography } from '@mui/material';
import { ContentCopy, Close } from '@mui/icons-material';
import { AxiosError } from 'axios';
import { copyToClipboard } from '@/utils/clipboard';

interface QueryErrorPanelProps {
  error: Error;
  onDismiss: () => void;
}

/** Dig through nested API Mother response to find the real error message. */
function extractDetail(err: unknown): { status: number | null; detail: string } {
  if (!(err instanceof AxiosError)) {
    return { status: null, detail: (err as Error).message || String(err) };
  }

  const status = err.response?.status ?? null;
  const body = err.response?.data;

  if (!body) {
    return { status, detail: err.message || 'Erro de rede — sem resposta do servidor' };
  }

  // body can be string (HTML error page)
  if (typeof body === 'string') {
    return { status, detail: body.substring(0, 2000) };
  }

  // Recursive dig: API Mother wraps in { data: { data: ... } }
  const parts: string[] = [];

  function dig(obj: unknown, depth: number): void {
    if (depth > 4 || !obj || typeof obj !== 'object') return;
    const o = obj as Record<string, unknown>;

    // Collect known error fields
    for (const key of [
      'message', 'mensagem', 'error', 'erro', 'detail', 'detalhe',
      'queryComErro', 'mensagemErro', 'sqlMessage', 'originalError',
    ]) {
      const v = o[key];
      if (v && typeof v === 'string') parts.push(v);
      if (v && typeof v === 'object') dig(v, depth + 1);
    }

    // NestJS { statusCode, message, error } shape
    if (o.statusCode && o.message && !parts.includes(String(o.message))) {
      parts.push(String(o.message));
    }

    // Dive into nested data envelope
    if (o.data && typeof o.data === 'object') dig(o.data, depth + 1);
  }

  dig(body, 0);

  if (parts.length === 0) {
    // Fallback: stringify the whole body
    try {
      parts.push(JSON.stringify(body, null, 2).substring(0, 2000));
    } catch {
      parts.push(err.message);
    }
  }

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique = parts.filter((p) => { if (seen.has(p)) return false; seen.add(p); return true; });

  return { status, detail: unique.join('\n\n') };
}

export function QueryErrorPanel({ error, onDismiss }: QueryErrorPanelProps) {
  const { status, detail } = extractDetail(error);

  const copyError = () => {
    const text = status ? `[${status}] ${detail}` : detail;
    copyToClipboard(text);
  };

  return (
    <Paper sx={{
      flexShrink: 0, maxHeight: 200, overflow: 'auto',
      border: '1px solid', borderColor: 'error.main', bgcolor: 'error.main',
      color: 'error.contrastText', borderRadius: 1,
    }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.5,
        px: 1.5, py: 0.5, borderBottom: '1px solid rgba(255,255,255,0.15)',
        position: 'sticky', top: 0, bgcolor: 'error.dark', zIndex: 1,
      }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, flex: 1 }}>
          {status ? `Erro ${status}` : 'Erro'}
        </Typography>
        <Tooltip title="Copiar erro">
          <IconButton size="small" onClick={copyError} sx={{ color: 'inherit' }}>
            <ContentCopy sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fechar">
          <IconButton size="small" onClick={onDismiss} sx={{ color: 'inherit' }}>
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography component="pre" sx={{
          fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap',
          wordBreak: 'break-word', m: 0, lineHeight: 1.5,
        }}>
          {detail}
        </Typography>
      </Box>
    </Paper>
  );
}
