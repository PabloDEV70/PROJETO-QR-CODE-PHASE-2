import Fastify, { FastifyInstance } from 'fastify';
import { env } from '../../config/env';

export function createFastifyInstance(): FastifyInstance {
  const isDev = env.NODE_ENV === 'development';

  // In dev: pino only shows WARN+ (errors, warnings)
  // All normal info goes via our pretty devLog (process.stdout)
  // In prod: pino handles everything as structured JSON
  const logLevel = isDev ? 'warn' : (env.LOG_LEVEL || 'info');

  const server = Fastify({
    logger: {
      level: logLevel,
      transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'SYS:HH:MM:ss',
              ignore: 'pid,hostname,req,res,responseTime,reqId',
              colorize: true,
              levelFirst: true,
              singleLine: true,
              messageFormat: '{msg}',
              customColors: 'fatal:bgRed,error:red,warn:yellow,info:cyan,debug:gray,trace:gray',
            },
          }
        : undefined,
      formatters: {
        level(label: string) {
          return { level: label.toUpperCase() };
        },
      },
      serializers: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req(req: any) {
          return { method: req.method, url: req.url, ip: req.remoteAddress };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res(res: any) {
          return { status: res.statusCode };
        },
      },
    },
    disableRequestLogging: true,
  });

  return server;
}
