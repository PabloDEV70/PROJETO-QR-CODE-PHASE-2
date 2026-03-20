import { Alert, AlertTitle, Typography, Box, Chip } from '@mui/material';
import { getApiBaseUrl } from '@/api/client';
import {
  WifiOff, LockOutlined, ErrorOutline, TimerOff, Block,
} from '@mui/icons-material';

interface LoginErrorProps {
  error: unknown;
  onClose: () => void;
}

interface ParsedError {
  title: string;
  message: string;
  hint: string;
  severity: 'error' | 'warning';
  icon: React.ReactNode;
  status?: number;
  code?: string;
}

function parseLoginError(error: unknown): ParsedError {
  const axiosErr = error as {
    message?: string;
    code?: string;
    response?: {
      status?: number;
      data?: { message?: string; error?: string; statusCode?: number };
    };
  };

  const status = axiosErr.response?.status;
  const code = axiosErr.code;
  const serverMsg = axiosErr.response?.data?.message || '';
  const rawMsg = axiosErr.message || 'Erro desconhecido';

  // Plain Error (not Axios) — show its message directly
  if (error instanceof Error && !('response' in error) && !('code' in error)) {
    return {
      title: 'Erro ao fazer login',
      message: error.message,
      hint: '',
      severity: 'error',
      icon: <ErrorOutline />,
    };
  }

  if (!axiosErr.response || code === 'ERR_NETWORK') {
    return {
      title: 'Servidor indisponivel',
      message: 'Nao foi possivel conectar ao servidor.',
      hint: 'Verifique se a API esta rodando em ' + getApiBaseUrl(),
      severity: 'error',
      icon: <WifiOff />,
      code,
    };
  }

  if (code === 'ECONNABORTED') {
    return {
      title: 'Timeout na conexao',
      message: 'O servidor demorou demais para responder.',
      hint: 'Tente novamente.',
      severity: 'warning',
      icon: <TimerOff />,
      code,
    };
  }

  if (status === 429) {
    return {
      title: 'Muitas tentativas',
      message: rawMsg,
      hint: 'Aguarde antes de tentar novamente.',
      severity: 'warning',
      icon: <Block />,
      status,
    };
  }

  if (status === 401) {
    return {
      title: 'Credenciais invalidas',
      message: 'Usuario ou senha incorretos.',
      hint: 'Verifique seu usuario e senha (MAIUSCULAS).',
      severity: 'error',
      icon: <LockOutlined />,
      status,
    };
  }

  if (status === 403) {
    return {
      title: 'Acesso negado',
      message: serverMsg || 'Voce nao tem permissao.',
      hint: 'Verifique suas permissoes com o administrador.',
      severity: 'error',
      icon: <Block />,
      status,
    };
  }

  return {
    title: 'Erro ao fazer login',
    message: serverMsg || rawMsg,
    hint: '',
    severity: 'error',
    icon: <ErrorOutline />,
    status,
    code,
  };
}

export function LoginError({ error, onClose }: LoginErrorProps) {
  const parsed = parseLoginError(error);

  return (
    <Alert severity={parsed.severity} icon={parsed.icon} onClose={onClose} sx={{ mb: 2 }}>
      <AlertTitle sx={{ fontWeight: 600 }}>{parsed.title}</AlertTitle>
      <Typography variant="body2">{parsed.message}</Typography>
      {parsed.hint && (
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
          {parsed.hint}
        </Typography>
      )}
      {(parsed.status || parsed.code) && (
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
          {parsed.status && (
            <Chip label={`HTTP ${parsed.status}`} size="small" variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'monospace' }} />
          )}
          {parsed.code && (
            <Chip label={parsed.code} size="small" variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'monospace' }} />
          )}
        </Box>
      )}
    </Alert>
  );
}
