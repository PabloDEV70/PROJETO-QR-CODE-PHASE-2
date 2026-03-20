import { ConsoleLogger, LogLevel } from '@nestjs/common';

const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

function timestamp(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

/**
 * Clean console logger for NestJS that replaces the default [Nest] format
 * with a minimal, colorized output similar to api-mini-consumidora.
 *
 * Format: [HH:mm:ss.SSS] [LEVEL] [Context] message
 */
export class NestConsoleLogger extends ConsoleLogger {
  protected formatPid(): string {
    return '';
  }

  log(message: any, context?: string): void {
    if (!this.isLevelEnabled('log')) return;
    const ctx = context || this.context || '';
    const line = `${COLORS.green}[${timestamp()}] [INFO ] [${ctx}] ${message}${COLORS.reset}`;
    process.stdout.write(line + '\n');
  }

  error(message: any, stackOrContext?: string, context?: string): void {
    if (!this.isLevelEnabled('error')) return;
    const ctx = context || (stackOrContext && !stackOrContext.includes('\n') ? stackOrContext : '') || this.context || '';
    const line = `${COLORS.red}[${timestamp()}] [ERROR] [${ctx}] ${message}${COLORS.reset}`;
    process.stderr.write(line + '\n');
    if (stackOrContext && stackOrContext.includes('\n')) {
      process.stderr.write(`${COLORS.gray}${stackOrContext}${COLORS.reset}\n`);
    }
  }

  warn(message: any, context?: string): void {
    if (!this.isLevelEnabled('warn')) return;
    const ctx = context || this.context || '';
    const line = `${COLORS.yellow}[${timestamp()}] [WARN ] [${ctx}] ${message}${COLORS.reset}`;
    process.stdout.write(line + '\n');
  }

  debug(message: any, context?: string): void {
    if (!this.isLevelEnabled('debug')) return;
    const ctx = context || this.context || '';
    const line = `${COLORS.cyan}[${timestamp()}] [DEBUG] [${ctx}] ${message}${COLORS.reset}`;
    process.stdout.write(line + '\n');
  }

  verbose(message: any, context?: string): void {
    if (!this.isLevelEnabled('verbose')) return;
    const ctx = context || this.context || '';
    const line = `${COLORS.gray}[${timestamp()}] [VERB ] [${ctx}] ${message}${COLORS.reset}`;
    process.stdout.write(line + '\n');
  }
}
