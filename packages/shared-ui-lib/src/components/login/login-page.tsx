import { useState } from 'react';
import { Box, Typography, IconButton, Tabs, Tab } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { LoginLeftPanel } from './login-left-panel';
import { StandardLoginForm } from './standard-login-form';
import { ColaboradorLoginForm } from './colaborador-login-form';
import { TotpVerifyForm } from './totp-verify-form';
import { TotpRecoveryForm } from './totp-recovery-form';
import { DatabaseSelector } from './database-selector';
import { LoginError } from './login-error';
import { TurnstileWidget } from './turnstile-widget';
import type {
  LoginResponse,
  DatabaseEnv,
  StandardLoginPayload,
  ColaboradorLoginPayload,
} from '../../types/auth-types';

export interface LoginPageProps {
  appName: string;
  appSubtitle?: string;
  enableColaborador?: boolean;
  enableTotp?: boolean;
  enableDbSelector?: boolean;
  enableTurnstile?: boolean;
  turnstileSiteKey?: string;
  database: DatabaseEnv;
  onDatabaseChange: (db: DatabaseEnv) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onLoginStandard: (payload: StandardLoginPayload) => Promise<LoginResponse>;
  onLoginColaborador?: (payload: ColaboradorLoginPayload) => Promise<LoginResponse>;
  onVerifyTotp?: (totpToken: string, code: string) => Promise<LoginResponse>;
  onRecoverTotp?: (totpToken: string, code: string) => Promise<LoginResponse>;
  onLoginSuccess: (data: LoginResponse) => void;
  apiBaseUrl?: string;
}

type TotpState = { totpToken: string } | null;
type TotpView = 'code' | 'recovery';

export function LoginPage({
  appName,
  appSubtitle,
  enableColaborador = false,
  enableTotp = true,
  enableDbSelector = true,
  enableTurnstile = false,
  turnstileSiteKey,
  database,
  onDatabaseChange,
  themeMode,
  onToggleTheme,
  onLoginStandard,
  onLoginColaborador,
  onVerifyTotp,
  onRecoverTotp,
  onLoginSuccess,
  apiBaseUrl,
}: LoginPageProps) {
  const isDark = themeMode === 'dark';

  // Form state
  const [loginTab, setLoginTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codparc, setCodparc] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // TOTP state
  const [totpState, setTotpState] = useState<TotpState>(null);
  const [totpView, setTotpView] = useState<TotpView>('code');

  const handleLoginResponse = (data: LoginResponse) => {
    if (enableTotp && data.requiresTotp && data.totpToken) {
      setTotpState({ totpToken: data.totpToken });
      setTotpView('code');
      return;
    }
    onLoginSuccess(data);
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await onLoginStandard({
        username,
        password,
        turnstileToken: turnstileToken ?? undefined,
      });
      handleLoginResponse(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleColaboradorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLoginColaborador) return;
    setError(null);
    setLoading(true);
    try {
      const data = await onLoginColaborador({
        codparc: Number(codparc),
        cpf,
        turnstileToken: turnstileToken ?? undefined,
      });
      handleLoginResponse(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const turnstileSlot = enableTurnstile && turnstileSiteKey ? (
    <TurnstileWidget
      siteKey={turnstileSiteKey}
      onVerify={setTurnstileToken}
      onExpire={() => setTurnstileToken(null)}
    />
  ) : null;

  // TOTP View
  if (totpState && onVerifyTotp) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <LoginLeftPanel appName={appName} appSubtitle={appSubtitle} isDark={isDark} />
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
                onVerify={onVerifyTotp}
                onSuccess={onLoginSuccess}
                onCancel={() => setTotpState(null)}
                onSwitchToRecovery={() => setTotpView('recovery')}
              />
            ) : onRecoverTotp ? (
              <TotpRecoveryForm
                totpToken={totpState.totpToken}
                onRecover={onRecoverTotp}
                onSuccess={onLoginSuccess}
                onBack={() => setTotpView('code')}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    );
  }

  // Login View
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <LoginLeftPanel appName={appName} appSubtitle={appSubtitle} isDark={isDark} />
      <Box
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          p: { xs: 3, sm: 6 }, position: 'relative',
        }}
      >
        <IconButton
          onClick={onToggleTheme}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          {isDark ? <LightMode /> : <DarkMode />}
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
            <LoginError error={error} onClose={() => setError(null)} apiBaseUrl={apiBaseUrl} />
          )}

          {enableColaborador && onLoginColaborador ? (
            <>
              <Tabs value={loginTab} onChange={(_, v) => setLoginTab(v)} sx={{ mb: 3 }}>
                <Tab label="Usuario" />
                <Tab label="Colaborador" />
              </Tabs>
              {loginTab === 0 ? (
                <StandardLoginForm
                  username={username} password={password}
                  showPassword={showPassword} loading={loading}
                  onUsernameChange={setUsername} onPasswordChange={setPassword}
                  onTogglePassword={() => setShowPassword((p) => !p)}
                  onSubmit={handleStandardSubmit}
                >
                  {turnstileSlot}
                </StandardLoginForm>
              ) : (
                <ColaboradorLoginForm
                  codparc={codparc} cpf={cpf} loading={loading}
                  onCodparcChange={setCodparc} onCpfChange={setCpf}
                  onSubmit={handleColaboradorSubmit}
                >
                  {turnstileSlot}
                </ColaboradorLoginForm>
              )}
            </>
          ) : (
            <StandardLoginForm
              username={username} password={password}
              showPassword={showPassword} loading={loading}
              onUsernameChange={setUsername} onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
              onSubmit={handleStandardSubmit}
            >
              {turnstileSlot}
            </StandardLoginForm>
          )}

          {enableDbSelector && (
            <Box sx={{ mt: 4 }}>
              <DatabaseSelector database={database} onDatabaseChange={onDatabaseChange} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
