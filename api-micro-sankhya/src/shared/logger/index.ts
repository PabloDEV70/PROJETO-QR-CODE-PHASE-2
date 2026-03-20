import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const transport = isDev
  ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
        colorize: true,
        levelFirst: true,
        messageFormat: '{msg}',
        customLevels: 'fatal:60,error:50,warn:40,info:30,debug:20,trace:10',
        customColors: 'fatal:bgRed,error:red,warn:yellow,info:cyan,debug:gray,trace:gray',
        singleLine: false,
      },
    }
  : undefined;

export const logger = pino({
  level: isDev ? 'warn' : (process.env.LOG_LEVEL || 'info'),
  transport,
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
  },
});
