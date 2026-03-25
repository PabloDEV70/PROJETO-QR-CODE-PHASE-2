import { Box, Typography, Alert, Chip } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorDetailProps {
  error: Error;
  context: string;
}

function extractDetails(error: Error) {
  const axiosErr = error as {
    response?: { status?: number; statusText?: string; data?: unknown };
    request?: { responseURL?: string };
    config?: { url?: string; method?: string; baseURL?: string };
    code?: string;
  };

  const status = axiosErr.response?.status;
  const statusText = axiosErr.response?.statusText;
  const responseData = axiosErr.response?.data;
  const url = axiosErr.config?.url || axiosErr.request?.responseURL;
  const method = axiosErr.config?.method?.toUpperCase();
  const baseURL = axiosErr.config?.baseURL;
  const code = axiosErr.code;
  const fullUrl = url?.startsWith('http') ? url : `${baseURL || ''}${url || ''}`;

  const isNetwork = code === 'ERR_NETWORK' || !axiosErr.response;
  const isCors = error.message?.includes('CORS')
    || error.message?.includes('Network Error');
  const isTimeout = code === 'ECONNABORTED';

  let diagnostic = '';
  if (isCors || isNetwork) {
    diagnostic = 'Servidor provavelmente fora do ar ou bloqueio CORS. '
      + 'Verifique se a API está rodando.';
  } else if (isTimeout) {
    diagnostic = 'Timeout na requisição. A API demorou demais para responder.';
  } else if (status === 401) {
    diagnostic = 'Token expirado ou inválido. Faça login novamente.';
  } else if (status === 500) {
    diagnostic = 'Erro interno do servidor. Verifique os logs da API.';
  }

  return {
    status,
    statusText,
    responseData,
    fullUrl,
    method,
    code,
    isNetwork,
    diagnostic,
  };
}

export function ErrorDetail({ error, context }: ErrorDetailProps) {
  const d = extractDetails(error);

  return (
    <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
        Erro: {context}
      </Typography>

      {d.diagnostic && (
        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
          {d.diagnostic}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
        {d.status && (
          <Chip
            label={`HTTP ${d.status} ${d.statusText || ''}`}
            size="small"
            color="error"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        )}
        {d.code && (
          <Chip
            label={d.code}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem', fontFamily: 'monospace' }}
          />
        )}
        {d.isNetwork && (
          <Chip
            label="REDE"
            size="small"
            color="error"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        )}
        {d.method && d.fullUrl && (
          <Chip
            label={`${d.method} ${d.fullUrl}`}
            size="small"
            variant="outlined"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontFamily: 'monospace',
              maxWidth: '100%',
            }}
          />
        )}
      </Box>

      <Typography
        variant="body2"
        sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
      >
        {error.message}
      </Typography>

      {d.responseData != null && (
        <Box
          component="pre"
          sx={{
            mt: 1,
            p: 1,
            bgcolor: 'grey.100',
            borderRadius: 1,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            overflow: 'auto',
            maxHeight: 200,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {String(typeof d.responseData === 'string'
            ? d.responseData
            : JSON.stringify(d.responseData, null, 2))}
        </Box>
      )}
    </Alert>
  );
}
