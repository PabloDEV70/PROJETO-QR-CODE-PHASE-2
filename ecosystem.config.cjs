// PM2 Ecosystem — proj-micro-sankhya (user: gigantinho)
// Usage: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    // ── APIs ──────────────────────────────
    {
      name: 'api-micro-sankhya',
      cwd: './api-micro-sankhya',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env_file: '.env',
    },
    {
      name: 'api-mother',
      cwd: './api-mother',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env_file: '.env',
    },

    // ── SPAs (serve -s dist) ────────────────────────────
    {
      name: 'publico-vite',
      cwd: './app-publico-vite',
      script: 'npx',
      args: 'serve -s dist -l 7101',
      max_memory_restart: '128M',
    },
    {
      name: 'etiquetas-vite',
      cwd: './app-etiquetas-vite',
      script: 'npx',
      args: 'serve -s dist -l 7102',
      max_memory_restart: '128M',
    },
    {
      name: 'chamados-vite',
      cwd: './app-chamados-vite',
      script: 'npx',
      args: 'serve -s dist -l 7103',
      max_memory_restart: '128M',
    },
    {
      name: 'manutencao-vite',
      cwd: './app-manutencao-vite',
      script: 'npx',
      args: 'serve -s dist -l 7104',
      max_memory_restart: '128M',
    },
    {
      name: 'pwa-rdomotivos',
      cwd: './app-pwa-rdomotivos',
      script: 'npx',
      args: 'serve -s dist -l 7106',
      max_memory_restart: '128M',
    },
    {
      name: 'painel-veiculos-vite',
      cwd: './app-painel-veiculos-vite',
      script: 'npx',
      args: 'serve -s dist -l 7108',
      max_memory_restart: '128M',
    },
    {
      name: 'gestao-veiculos-pwa',
      cwd: './app-gestao-veiculos-pwa-vite',
      script: 'npx',
      args: 'serve -s dist -l 7109',
      max_memory_restart: '128M',
    },
    {
      name: 'tabman-pwa',
      cwd: './app-tabman-pwa-vite',
      script: 'npx',
      args: 'serve -s dist -l 7110',
      max_memory_restart: '128M',
    },
    {
      name: 'gruposeservicos-vite',
      cwd: './app-gruposeservicos-vite',
      script: 'npx',
      args: 'serve -s dist -l 7111',
      max_memory_restart: '128M',
    },
    {
      name: 'quadro-vite',
      cwd: './app-quadro-vite',
      script: 'npx',
      args: 'serve -s dist -l 7112',
      max_memory_restart: '128M',
    },
  ],
};
