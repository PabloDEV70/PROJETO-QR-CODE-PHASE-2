import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginPage as SharedLoginPage } from '@shared/ui-lib';
import type { LoginResponse } from '@shared/ui-lib';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

async function loginStandard(payload: { username: string; password: string; turnstileToken?: string }): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
}

async function verifyTotp(totpToken: string, code: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/totp/verify', { totpToken, code });
  return data;
}

async function recoverTotp(totpToken: string, code: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/totp/recover', { totpToken, code });
  return data;
}

export default function AppLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const database = useAuthStore((s) => s.database);
  const setDatabase = useAuthStore((s) => s.setDatabase);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const redirectPath = searchParams.get('redirect') ?? '/';

  useEffect(() => {
    if (isAuthenticated) navigate(redirectPath);
  }, [isAuthenticated, navigate, redirectPath]);

  const handleLoginSuccess = async (data: LoginResponse) => {
    const user: Record<string, unknown> = {
      token: data.token,
      refreshToken: data.refreshToken,
      type: data.type,
      username: data.username,
      codparc: data.codparc,
    };
    try {
      const { data: me } = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      Object.assign(user, {
        codusu: me.codusu,
        nome: me.nome,
        nomecompleto: me.nomecompleto ?? undefined,
        codparc: me.codparc ?? data.codparc,
        codgrupo: me.codgrupo ?? undefined,
        codemp: me.codemp ?? undefined,
        codfunc: me.codfunc ?? undefined,
        pertencedp: me.pertencedp ?? undefined,
        nomegrupo: me.nomegrupo ?? undefined,
      });
    } catch {
      // /auth/me failed
    }
    useAuthStore.getState().setUser(user as any);
    navigate(redirectPath);
  };

  return (
    <SharedLoginPage
      appName="Compras"
      appSubtitle="Gestao de compras"
      enableTotp
      onVerifyTotp={verifyTotp}
      onRecoverTotp={recoverTotp}
      enableDbSelector
      enableTurnstile={!!import.meta.env.VITE_TURNSTILE_SITE_KEY}
      turnstileSiteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
      database={database}
      onDatabaseChange={setDatabase}
      themeMode={mode}
      onToggleTheme={toggleTheme}
      onLoginStandard={loginStandard}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
