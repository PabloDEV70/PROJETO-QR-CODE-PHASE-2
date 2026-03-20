import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { AxiosError } from 'axios';

interface ApiErrorBannerProps {
  error: Error | null;
  onRetry?: () => void;
  context?: string;
}

function extractErrorDetails(error: Error | null) {
  if (!error) return { status: 0, message: 'Erro desconhecido', details: '' };

  const axiosErr = error as AxiosError<{
    statusCode?: number;
    error?: string;
    message?: string;
    details?: unknown;
    motherStatus?: number;
    motherUrl?: string;
    motherData?: unknown;
  }>;

  const status = axiosErr.response?.status ?? 0;
  const data = axiosErr.response?.data;
  const url = axiosErr.config?.url ?? '';
  const method = axiosErr.config?.method?.toUpperCase() ?? '';
  const params = axiosErr.config?.params;

  const serverMsg = data?.message ?? data?.error ?? error.message;
  const details = data?.details;

  const lines = [
    `Status: ${status || 'N/A'}`,
    `${method} ${url}`,
  ];

  if (params && Object.keys(params).length > 0) {
    lines.push(`Params: ${JSON.stringify(params)}`);
  }
  if (serverMsg) lines.push(`Mensagem: ${serverMsg}`);
  if (details) lines.push(`Detalhes: ${JSON.stringify(details, null, 2)}`);
  if (data?.motherStatus) lines.push(`API Mother Status: ${data.motherStatus}`);
  if (data?.motherUrl) lines.push(`API Mother URL: ${data.motherUrl}`);
  if (data?.motherData) lines.push(`API Mother Response: ${JSON.stringify(data.motherData, null, 2)}`);
  lines.push(`Timestamp: ${new Date().toISOString()}`);

  return {
    status,
    message: typeof serverMsg === 'string' ? serverMsg : error.message,
    details: lines.join('\n'),
  };
}

export function ApiErrorBanner({ error, onRetry, context }: ApiErrorBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const { status, message, details } = extractErrorDetails(error);

  const severity = status === 502 ? 'error'
    : status === 401 ? 'warning'
    : status >= 500 ? 'error'
    : 'warning';

  const title = status === 502 ? 'Erro de comunicacao com servidor Sankhya'
    : status === 401 ? 'Sessao expirada'
    : status === 400 ? 'Requisicao invalida'
    : status >= 500 ? `Erro no servidor (${status})`
    : `Erro (${status || 'rede'})`;

  const fullText = [
    `--- Erro API [${context ?? 'app'}] ---`,
    details,
    '---',
  ].join('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Alert
      severity={severity}
      sx={{ mx: 2, my: 1 }}
      action={
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onRetry && (
            <Tooltip title="Tentar novamente">
              <IconButton size="small" onClick={onRetry} color="inherit">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={copied ? 'Copiado!' : 'Copiar erro'}>
            <IconButton size="small" onClick={handleCopy} color="inherit">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={expanded ? 'Recolher' : 'Ver detalhes'}>
            <IconButton
              size="small"
              onClick={() => setExpanded((p) => !p)}
              color="inherit"
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
      <Collapse in={expanded}>
        <Typography
          component="pre"
          variant="caption"
          sx={{
            mt: 1,
            p: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            maxHeight: 300,
            overflow: 'auto',
            userSelect: 'all',
          }}
        >
          {details}
        </Typography>
      </Collapse>
    </Alert>
  );
}
