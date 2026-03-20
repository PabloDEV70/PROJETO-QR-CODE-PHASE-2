import { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Chip, Divider,
  Table, TableBody, TableRow, TableCell, LinearProgress, Alert,
} from '@mui/material';
import {
  Person, VpnKey, Storage, AccessTime, Groups, Badge, Timer,
  CheckCircle, Warning, Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { getApiBaseUrl } from '@/api/client';

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]!));
  } catch {
    return null;
  }
}

function formatTimestamp(ts: unknown): string {
  if (typeof ts !== 'number') return '-';
  return new Date(ts * 1000).toLocaleString('pt-BR');
}

function formatDuration(ms: number): string {
  if (ms <= 0) return 'Expirado';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function useTokenCountdown(decoded: Record<string, unknown> | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const exp = typeof decoded?.exp === 'number' ? decoded.exp * 1000 : null;
  const iat = typeof decoded?.iat === 'number' ? decoded.iat * 1000 : null;

  const remaining = exp ? exp - now : null;
  const total = exp && iat ? exp - iat : null;
  const progress = total && remaining ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  const isExpired = remaining !== null && remaining <= 0;
  const isWarning = remaining !== null && !isExpired && remaining < 10 * 60 * 1000;

  return { remaining, progress, isExpired, isWarning, exp, iat };
}

function InfoRow({ label, value, mono }: {
  label: string; value: string | number | null | undefined; mono?: boolean;
}) {
  return (
    <TableRow sx={{ '& td': { borderBottom: 'none', py: 0.5 } }}>
      <TableCell sx={{ color: 'text.secondary', fontSize: 13, width: 140, pl: 0 }}>
        {label}
      </TableCell>
      <TableCell sx={{
        fontSize: 13, fontWeight: 500,
        fontFamily: mono ? 'monospace' : 'inherit',
        wordBreak: 'break-all',
      }}>
        {value ?? '-'}
      </TableCell>
    </TableRow>
  );
}

export function ProfilePage() {
  const { user, database } = useAuthStore();

  const decoded = useMemo(() => {
    if (!user?.token) return null;
    return decodeJwt(user.token);
  }, [user?.token]);

  const countdown = useTokenCountdown(decoded);
  const displayName = user?.nome || user?.username || 'Usuario';

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      {/* Profile header */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2.5} alignItems="center">
            <FuncionarioAvatar
              codparc={user?.codparc}
              nome={displayName}
              size="large"
              sx={{ width: 72, height: 72, fontSize: 28 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>{displayName}</Typography>
              {user?.username && user.nome && (
                <Typography variant="body2" color="text.secondary">
                  @{user.username}
                </Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<Badge sx={{ fontSize: '16px !important' }} />}
                  label={user?.type === 'colaborador' ? 'Colaborador' : 'Usuario'}
                  size="small" variant="outlined"
                />
                <Chip
                  icon={<Storage sx={{ fontSize: '16px !important' }} />}
                  label={database}
                  size="small"
                  color={database === 'PROD' ? 'success' : database === 'TREINA' ? 'secondary' : 'warning'}
                />
                {countdown.remaining !== null && (
                  <Chip
                    icon={countdown.isExpired
                      ? <ErrorIcon sx={{ fontSize: '16px !important' }} />
                      : countdown.isWarning
                        ? <Warning sx={{ fontSize: '16px !important' }} />
                        : <CheckCircle sx={{ fontSize: '16px !important' }} />}
                    label={countdown.isExpired ? 'Token expirado' : 'Token ativo'}
                    size="small"
                    color={countdown.isExpired ? 'error' : countdown.isWarning ? 'warning' : 'success'}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Token countdown - realtime */}
      {decoded && countdown.remaining !== null && (
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Timer sx={{ fontSize: 20, color: countdown.isExpired ? 'error.main' : countdown.isWarning ? 'warning.main' : 'success.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Validade do Token (tempo real)
              </Typography>
            </Stack>

            {countdown.isExpired && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                Token expirado. Faca login novamente.
              </Alert>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 32, fontWeight: 800, fontFamily: 'monospace', color: countdown.isExpired ? 'error.main' : countdown.isWarning ? 'warning.main' : 'success.main' }}>
                {formatDuration(countdown.remaining)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {Math.round(countdown.progress)}% restante
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={countdown.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.100',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: countdown.isExpired ? 'error.main' : countdown.isWarning ? 'warning.main' : 'success.main',
                },
              }}
            />

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                Emitido: {countdown.iat ? new Date(countdown.iat).toLocaleString('pt-BR') : '-'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                Expira: {countdown.exp ? new Date(countdown.exp).toLocaleString('pt-BR') : '-'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* User data */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Person sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={700}>Dados do Usuario</Typography>
          </Stack>
          <Table size="small">
            <TableBody>
              <InfoRow label="CODUSU" value={user?.codusu} />
              <InfoRow label="CODPARC" value={user?.codparc} />
              <InfoRow label="CODGRUPO" value={user?.codgrupo} />
              <InfoRow label="Nome" value={user?.nome} />
              <InfoRow label="Username" value={user?.username} />
              <InfoRow label="Tipo login" value={user?.type} />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Token info */}
      {decoded && (
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <VpnKey sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>Token JWT (payload)</Typography>
            </Stack>
            <Table size="small">
              <TableBody>
                <InfoRow label="Subject (sub)" value={String(decoded.sub ?? '-')} />
                <InfoRow label="Username" value={String(decoded.username ?? decoded.nomeusu ?? '-')} />
                {decoded.codgrupo != null && (
                  <InfoRow label="Grupo" value={String(decoded.codgrupo)} />
                )}
                {decoded.iss != null && <InfoRow label="Issuer" value={String(decoded.iss)} />}
                {decoded.aud != null && <InfoRow label="Audience" value={String(decoded.aud)} />}
                {decoded.jti != null && <InfoRow label="JWT ID (jti)" value={String(decoded.jti)} mono />}
              </TableBody>
            </Table>

            <Divider sx={{ my: 1.5 }} />

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Timestamps
              </Typography>
            </Stack>
            <Table size="small">
              <TableBody>
                <InfoRow label="Emitido (iat)" value={formatTimestamp(decoded.iat)} />
                <InfoRow label="Expira (exp)" value={formatTimestamp(decoded.exp)} />
                {decoded.nbf != null && (
                  <InfoRow label="Valido a partir" value={formatTimestamp(decoded.nbf)} />
                )}
                {typeof decoded.iat === 'number' && typeof decoded.exp === 'number' && (
                  <InfoRow
                    label="Duracao total"
                    value={formatDuration((decoded.exp as number - (decoded.iat as number)) * 1000)}
                  />
                )}
              </TableBody>
            </Table>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="caption" fontWeight={600} color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}>
              Token raw (primeiros 80 chars)
            </Typography>
            <Box sx={{
              bgcolor: 'grey.100', borderRadius: 1, p: 1.5,
              fontFamily: 'monospace', fontSize: 11,
              wordBreak: 'break-all', lineHeight: 1.5,
              maxHeight: 120, overflow: 'auto',
              color: 'text.secondary',
            }}>
              {user?.token ? `${user.token.substring(0, 80)}...` : '-'}
            </Box>

            <Typography variant="caption" fontWeight={600} color="text.secondary"
              sx={{ display: 'block', mb: 0.5, mt: 1.5 }}>
              Payload decodificado
            </Typography>
            <Box sx={{
              bgcolor: 'grey.100', borderRadius: 1, p: 1.5,
              fontFamily: 'monospace', fontSize: 11,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              lineHeight: 1.5, maxHeight: 200, overflow: 'auto',
              color: 'text.secondary',
            }}>
              {JSON.stringify(decoded, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Session info */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Groups sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={700}>Sessao</Typography>
          </Stack>
          <Table size="small">
            <TableBody>
              <InfoRow label="Database" value={database} />
              <InfoRow label="Tem refresh" value={user?.refreshToken ? 'Sim' : 'Nao'} />
              <InfoRow label="API Base" value={getApiBaseUrl()} mono />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
