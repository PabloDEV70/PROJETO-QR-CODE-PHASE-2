import { buildApp } from './app';
import { env } from './config/env';
import { logger } from './shared/logger';
import { devLog, R, B, D, GREEN, CYAN } from './shared/log-colors';

async function main() {
  try {
    const app = await buildApp();

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      await app.close();
      process.exit(0);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    devLog(`\n${GREEN}${B}  API Micro Sankhya${R} ${D}v1.1.0${R}`);
    devLog(`${CYAN}  http://localhost:${env.PORT}${R} ${D}| docs: /docs${R}\n`);
    logger.info('Server running at http://localhost:%d', env.PORT);
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

main();
