import { FastifyInstance } from 'fastify';
import axios from 'axios';
import { ApiMotherAuthService } from '../../api-mother/login';
import { getVersionInfo } from './version.routes';
import { getDatabase } from '../../api-mother/database-context';
import { env } from '../../../config/env';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  });

  app.get('/health/deep', async (_request, reply) => {
    const versionInfo = getVersionInfo();
    let apiMotherStatus = 'unknown';
    let apiMotherVersionInfo: Record<string, unknown> = {};
    let apiMotherHealthInfo: Record<string, unknown> = {};

    const ok = await ApiMotherAuthService.getInstance().healthCheck();
    apiMotherStatus = ok ? 'reachable' : 'unreachable';

    try {
      const { data } = await axios.get(`${env.API_MAE_BASE_URL}/version`, {
        timeout: 5000,
      });
      apiMotherVersionInfo = data?.data || data || {};
      if (apiMotherStatus === 'unknown') apiMotherStatus = 'reachable';
    } catch {
      if (apiMotherStatus === 'unknown') apiMotherStatus = 'unreachable';
    }

    try {
      const { data } = await axios.get(`${env.API_MAE_BASE_URL}/health`, {
        timeout: 5000,
      });
      apiMotherHealthInfo = data?.data || data || {};
    } catch {
      // already determined by version check
    }

    const allOk = apiMotherStatus === 'connected' || apiMotherStatus === 'reachable';

    if (!allOk) {
      reply.status(503);
    }

    const mem = process.memoryUsage();

    return {
      status: allOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      },
      database: getDatabase(),
      api: {
        name: versionInfo.name,
        version: versionInfo.version,
        branch: versionInfo.branch,
        commitHash: versionInfo.commitHash,
        commitShort: versionInfo.commitShort,
        buildDate: versionInfo.buildDate,
        environment: versionInfo.environment,
        port: env.PORT,
      },
      apiMother: {
        status: apiMotherStatus,
        url: env.API_MAE_BASE_URL,
        version: apiMotherVersionInfo,
        health: apiMotherHealthInfo,
      },
    };
  });
}
