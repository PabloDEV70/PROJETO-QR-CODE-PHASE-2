import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

function gitInfo() {
  try {
    return {
      commitHash: execSync('git rev-parse HEAD').toString().trim(),
      commitShort: execSync('git rev-parse --short HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
    };
  } catch {
    return { commitHash: 'unknown', commitShort: 'unknown', branch: 'unknown' };
  }
}

function versionJsonPlugin() {
  const git = gitInfo();
  const info = {
    name: pkg.name,
    version: pkg.version,
    buildDate: new Date().toISOString(),
    commitHash: git.commitHash,
    commitShort: git.commitShort,
    branch: git.branch,
  };
  return {
    name: 'version-json',
    writeBundle(options: { dir?: string }) {
      const outDir = options.dir || 'dist';
      writeFileSync(path.resolve(outDir, 'version.json'), JSON.stringify(info, null, 2));
    },
  };
}

const git = gitInfo();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __COMMIT_SHORT__: JSON.stringify(git.commitShort),
  },
  plugins: [react(), versionJsonPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3012,
    host: true,
  },
  preview: {
    port: 7112,
    host: true,
    allowedHosts: ['quadro.gigantao.net'],
  },
});
