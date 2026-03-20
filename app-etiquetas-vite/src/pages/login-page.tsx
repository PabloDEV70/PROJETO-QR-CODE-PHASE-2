import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, IconButton } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { loginStandard, loginColaborador, getMe } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { LoginLeftPanel } from '@/components/login/login-left-panel';
import {
  StandardLoginForm,
  ColaboradorLoginForm,
} from '@/components/login/login-forms';
import { DatabaseSelector } from '@/components/login/database-selector';
import { TotpVerifyForm } from '@/components/login/totp-verify-form';
import { TotpRecoveryForm } from '@/components/login/totp-recovery-form';
import { LoginError } from '@/components/login/login-error';
import type { LoginResponse } from '@/types/auth-types';

type TotpState = { totpToken: string; loginType: 'standard' | 'colaborador' } | null;
type TotpView = 'code' | 'recovery';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codparc, setCodparc] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [totpState, setTotpState] = useState<TotpState>(null);
  const [totpView, setTotpView] = useState<TotpView>('code');

  const redirectPath = searchParams.get('redirect') ?? '/';

  useEffect(() => {
    if (isAuthenticated) navigate(redirectPath);
  }, [isAuthenticated, navigate, redirectPath]);

  const handleLoginResponse = (data: LoginResponse) => {
    if (data.requiresTotp && data.totpToken) {
      setTotpState({ totpToken: data.totpToken, loginType: data.type });
      setTotpView('code');
      return;
    }
    finalizeLogin(data);
  };

  const finalizeLogin = async (data: LoginResponse) => {
    const user = {
      token: data.token,
      refreshToken: data.refreshToken,
      type: data.type,
      username: data.username,
      codparc: data.codparc,
    };
    try {
      const me = await getMe(data.token);
      Object.assign(user, {
        codusu: me.codusu,
        nome: me.nome,
        codparc: me.codparc ?? data.codparc,
        codgrupo: me.codgrupo ?? undefined,
        codemp: me.codemp ?? undefined,
        codfunc: me.codfunc ?? undefined,
        pertencedp: me.pertencedp ?? undefined,
      });
    } catch {
      // /auth/me failed — proceed with basic user data
    }

    useAuthStore.getState().setUser(user);
    navigate(redirectPath);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginStandard({ username, password });
      handleLoginResponse(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleColaboradorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginColaborador({ codparc: Number(codparc), cpf });
      handleLoginResponse(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (totpState) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <LoginLeftPanel />
        <Box
          sx={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            p: { xs: 3, sm: 6 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {totpView === 'code' ? (
              <TotpVerifyForm
                totpToken={totpState.totpToken}
                onSuccess={finalizeLogin}
                onCancel={() => setTotpState(null)}
                onSwitchToRecovery={() => setTotpView('recovery')}
              />
            ) : (
              <TotpRecoveryForm
                totpToken={totpState.totpToken}
                onSuccess={finalizeLogin}
                onBack={() => setTotpView('code')}
              />
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <LoginLeftPanel />
      <Box
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          p: { xs: 3, sm: 6 }, position: 'relative',
        }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          {mode === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>

        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography
            sx={{
              fontFamily: "'STOP', 'Arial Black', sans-serif",
              fontSize: '1.8rem', fontWeight: 400, letterSpacing: '0.08em',
              color: 'primary.main', mb: 0.5,
              display: { md: 'none' },
            }}
          >
            GIGANTAO
          </Typography>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Acesse sua conta
          </Typography>

          {error != null && (
            <LoginError error={error} onClose={() => setError(null)} />
          )}

          <Tabs
            value={tab}
            onChange={(_, v: number) => { setTab(v); setError(null); }}
            sx={{ mb: 3 }} variant="fullWidth"
          >
            <Tab label="Usuario" />
            <Tab label="Colaborador" />
          </Tabs>

          {tab === 0 ? (
            <StandardLoginForm
              username={username} password={password}
              showPassword={showPassword} loading={loading}
              onUsernameChange={setUsername} onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
              onSubmit={handleStandardLogin}
            />
          ) : (
            <ColaboradorLoginForm
              codparc={codparc} cpf={cpf} loading={loading}
              onCodparcChange={setCodparc} onCpfChange={setCpf}
              onSubmit={handleColaboradorLogin}
            />
          )}

          <Box sx={{ mt: 4 }}>
            <DatabaseSelector />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
