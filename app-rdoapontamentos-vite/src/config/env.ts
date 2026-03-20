const warnings: string[] = [];

export const appEnv = {
  apiUrl: import.meta.env.VITE_API_URL as string | undefined,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

if (appEnv.isProd && !appEnv.apiUrl) {
  warnings.push('VITE_API_URL is not set — API calls will fallback to hostname:3000');
}

if (appEnv.isDev && appEnv.apiUrl) {
  warnings.push(
    `VITE_API_URL is set in dev mode (${appEnv.apiUrl}) — Vite proxy (/api) will be bypassed`,
  );
}

if (warnings.length > 0) {
  console.warn(
    `%c[env] ${warnings.length} warning(s):\n${warnings.map((w) => `  • ${w}`).join('\n')}`,
    'color: #F59E0B; font-weight: bold',
  );
}

if (appEnv.isDev) {
  console.info(
    '%c[env] mode=%s apiBaseUrl=%s',
    'color: #4ADE80',
    appEnv.mode,
    appEnv.apiUrl || '/api (proxy)',
  );
}
