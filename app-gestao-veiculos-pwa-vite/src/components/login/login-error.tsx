import { Alert, AlertTitle, Typography, Box, Chip } from '@mui/material';
import { getApiBaseUrl } from '@/api/client';
import { WifiOff, LockOutlined, ErrorOutline, TimerOff, Block } from '@mui/icons-material';

interface LoginErrorProps { error: unknown; onClose: () => void; }

function parseLoginError(error: unknown) {
  const axiosErr = error as { message?: string; code?: string; response?: { status?: number; data?: { message?: string } } };
  const status = axiosErr.response?.status;
  const code = axiosErr.code;
  const serverMsg = axiosErr.response?.data?.message || '';
  const rawMsg = axiosErr.message || 'Erro desconhecido';

  if (!axiosErr.response || code === 'ERR_NETWORK')
    return { title: 'Servidor indisponivel', message: 'Nao foi possivel conectar.', hint: 'Verifique se a API esta rodando em ' + getApiBaseUrl(), severity: 'error' as const, icon: <WifiOff />, code };
  if (code === 'ECONNABORTED')
    return { title: 'Timeout', message: 'Servidor demorou para responder.', hint: 'Tente novamente.', severity: 'warning' as const, icon: <TimerOff />, code };
  if (status === 429)
    return { title: 'Muitas tentativas', message: rawMsg, hint: 'Aguarde.', severity: 'warning' as const, icon: <Block />, status };
  if (status === 401)
    return { title: 'Credenciais invalidas', message: 'Usuario ou senha incorretos.', hint: 'Verifique MAIUSCULAS.', severity: 'error' as const, icon: <LockOutlined />, status };
  return { title: 'Erro ao fazer login', message: serverMsg || rawMsg, hint: '', severity: 'error' as const, icon: <ErrorOutline />, status, code };
}

export function LoginError({ error, onClose }: LoginErrorProps) {
  const p = parseLoginError(error);
  return (
    <Alert severity={p.severity} icon={p.icon} onClose={onClose} sx={{ mb: 2 }}>
      <AlertTitle sx={{ fontWeight: 600 }}>{p.title}</AlertTitle>
      <Typography variant="body2">{p.message}</Typography>
      {p.hint && <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>{p.hint}</Typography>}
      {(p.status || p.code) && (
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
          {p.status && <Chip label={`HTTP ${p.status}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'monospace' }} />}
          {p.code && <Chip label={p.code} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'monospace' }} />}
        </Box>
      )}
    </Alert>
  );
}
