import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { loginStandard, getMe } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { LoginLeftPanel } from '@/components/login/login-left-panel';
import { StandardLoginForm } from '@/components/login/login-forms';
import { DatabaseSelector } from '@/components/login/database-selector';
import { LoginError } from '@/components/login/login-error';
import type { LoginResponse } from '@/types/auth-types';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const redirectPath = searchParams.get('redirect') ?? '/';

  useEffect(() => { if (isAuthenticated) navigate(redirectPath); }, [isAuthenticated, navigate, redirectPath]);

  const finalizeLogin = async (data: LoginResponse) => {
    const user = { token: data.token, refreshToken: data.refreshToken, type: data.type, username: data.username, codparc: data.codparc };
    try {
      const me = await getMe(data.token);
      Object.assign(user, { codusu: me.codusu, nome: me.nome, nomecompleto: me.nomecompleto ?? undefined, codparc: me.codparc ?? data.codparc, codgrupo: me.codgrupo ?? undefined, codemp: me.codemp ?? undefined, codfunc: me.codfunc ?? undefined, pertencedp: me.pertencedp ?? undefined, nomegrupo: me.nomegrupo ?? undefined });
    } catch { /* proceed */ }
    useAuthStore.getState().setUser(user);
    navigate(redirectPath);
  };

  const handleStandard = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try { await finalizeLogin(await loginStandard({ username, password })); } catch (err) { setError(err); } finally { setLoading(false); }
  };


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <LoginLeftPanel />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 3, sm: 6 }, position: 'relative' }}>
        <IconButton onClick={toggleTheme} sx={{ position: 'absolute', top: 16, right: 16 }}>{mode === 'dark' ? <LightMode /> : <DarkMode />}</IconButton>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography sx={{ fontFamily: "'STOP', 'Arial Black', sans-serif", fontSize: '1.8rem', fontWeight: 400, letterSpacing: '0.08em', color: 'primary.main', mb: 0.5, display: { md: 'none' } }}>GIGANTAO</Typography>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Acesse sua conta</Typography>
          {error != null && <LoginError error={error} onClose={() => setError(null)} />}
          <StandardLoginForm username={username} password={password} showPassword={showPassword} loading={loading} onUsernameChange={setUsername} onPasswordChange={setPassword} onTogglePassword={() => setShowPassword((p) => !p)} onSubmit={handleStandard} />
          <Box sx={{ mt: 4 }}><DatabaseSelector /></Box>
        </Box>
      </Box>
    </Box>
  );
}
