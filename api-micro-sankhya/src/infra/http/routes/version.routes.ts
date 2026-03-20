import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

interface BuildInfo {
  buildDate: string;
  commitHash: string;
  commitShort: string;
  branch: string;
  nodeVersion: string;
  environment: string;
}

let cachedInfo: (BuildInfo & { version: string; name: string }) | null = null;

function loadBuildInfo(): BuildInfo {
  const possiblePaths = [
    path.resolve(process.cwd(), 'build-info.json'),
    path.resolve(__dirname, '../../../../build-info.json'),
    path.resolve(__dirname, '../../../../../build-info.json'),
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return {
          buildDate: data.buildDate || new Date().toISOString(),
          commitHash: data.commitHash || 'unknown',
          commitShort: data.commitShort || 'unknown',
          branch: data.branch || 'unknown',
          nodeVersion: data.nodeVersion || process.version,
          environment: data.environment || process.env.NODE_ENV || 'development',
        };
      }
    } catch {
      // skip
    }
  }

  return {
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    commitHash: process.env.COMMIT_HASH || 'local-dev',
    commitShort: process.env.COMMIT_SHORT || 'local',
    branch: process.env.BRANCH || 'local',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
  };
}

function loadPackageVersion(): { version: string; name: string } {
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return { version: pkg.version || '0.0.0', name: pkg.name || 'api' };
  } catch {
    return { version: '0.0.0', name: 'api-micro-sankhya' };
  }
}

export function getVersionInfo() {
  if (!cachedInfo) {
    const pkg = loadPackageVersion();
    const build = loadBuildInfo();
    cachedInfo = { ...pkg, ...build };
  }
  return cachedInfo;
}

export async function versionRoutes(app: FastifyInstance) {
  app.get('/version', async () => {
    return getVersionInfo();
  });
}
