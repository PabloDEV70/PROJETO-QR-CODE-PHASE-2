import { Alert, AlertTitle, Typography, Box, Chip } from '@mui/material';
import { getApiBaseUrl } from '@/api/client';
import {
  WifiOff,
  LockOutlined,
  ErrorOutline,
  TimerOff,
  Block,
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
  details?: string[];
  code?: string;
  status?: number;
}

function parseLoginError(error: unknown): ParsedError {
  const axiosErr = error as {
    message?: string;
    code?: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
        details?: Array<{ path?: string[]; message?: string }>;
        statusCode?: number;
      };
    };
  };

  const status = axiosErr.response?.status;
  const data = axiosErr.response?.data;
  const code = axiosErr.code;
  const serverMsg = data?.message || '';
  const rawMsg = axiosErr.message || 'Erro desconhecido';

  // Network / CORS / server down
  if (!axiosErr.response || code === 'ERR_NETWORK') {
    return {
      title: 'Servidor indisponivel',
      message: 'Nao foi possivel conectar ao servidor.',
      hint: 'Verifique se a API esta rodando em '
        + getApiBaseUrl(),
      severity: 'error',
      icon: <WifiOff />,
      code,
    };
  }

  // Timeout
  if (code === 'ECONNABORTED') {
    return {
      title: 'Timeout na conexao',
      message: 'O servidor demorou demais para responder.',
      hint: 'Tente novamente. Se persistir, a API pode estar sobrecarregada.',
      severity: 'warning',
      icon: <TimerOff />,
      code,
    };
  }

  // Rate limit
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

  // Validation errors (400)
  if (status === 400 && data?.details) {
    const fields = data.details
      .map((d) => {
        const field = d.path?.join('.') || 'campo';
        return `${field}: ${d.message}`;
      });
    return {
      title: 'Dados invalidos',
      message: 'Verifique os campos e tente novamente.',
      hint: '',
      severity: 'warning',
      icon: <ErrorOutline />,
      details: fields,
      status,
    };
  }

  // Invalid credentials (401)
  if (status === 401) {
    const isInactive = serverMsg.toLowerCase().includes('inativ')
      || serverMsg.toLowerCase().includes('bloqu');
    if (isInactive) {
      return {
        title: 'Acesso bloqueado',
        message: serverMsg,
        hint: 'Entre em contato com o administrador do sistema.',
        severity: 'error',
        icon: <Block />,
        status,
      };
    }
    return {
      title: 'Credenciais invalidas',
      message: 'Usuario ou senha incorretos.',
      hint: 'Verifique seu usuario e senha. Lembre-se que o usuario é '
        + 'em MAIÚSCULAS (ex: NOME.SOBRENOME).',
      severity: 'error',
      icon: <LockOutlined />,
      status,
    };
  }

  // 403 Forbidden
  if (status === 403) {
    return {
      title: 'Acesso negado',
      message: serverMsg || 'Voce nao tem permissao para acessar.',
      hint: 'Verifique suas permissoes com o administrador.',
      severity: 'error',
      icon: <Block />,
      status,
    };
  }

  // 500+ Server errors
  if (status && status >= 500) {
    return {
      title: 'Erro no servidor',
      message: serverMsg || 'Erro interno ao processar o login.',
      hint: 'Tente novamente. Se persistir, entre em contato com o suporte.',
      severity: 'error',
      icon: <ErrorOutline />,
      status,
    };
  }

  // Generic fallback
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
    <Alert
      severity={parsed.severity}
      icon={parsed.icon}
      onClose={onClose}
      sx={{ mb: 2 }}
    >
      <AlertTitle sx={{ fontWeight: 600 }}>{parsed.title}</AlertTitle>
      <Typography variant="body2">{parsed.message}</Typography>
      {parsed.hint && (
        <Typography
          variant="body2"
          sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}
        >
          {parsed.hint}
        </Typography>
      )}
      {parsed.details && parsed.details.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {parsed.details.map((d, i) => (
            <Typography
              key={i}
              variant="body2"
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            >
              {d}
            </Typography>
          ))}
        </Box>
      )}
      {(parsed.status || parsed.code) && (
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
          {parsed.status && (
            <Chip
              label={`HTTP ${parsed.status}`}
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'monospace' }}
            />
          )}
          {parsed.code && (
            <Chip
              label={parsed.code}
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'monospace' }}
            />
          )}
        </Box>
      )}
    </Alert>
  );
}
