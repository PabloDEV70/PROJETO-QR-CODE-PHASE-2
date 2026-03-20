import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as os from 'os';

@Injectable()
export class SystemHealthIndicator extends HealthIndicator {
  isHealthy(key: string): HealthIndicatorResult {
    const memoryUsage = process.memoryUsage();
    const cpuLoad = os.loadavg();
    return this.getStatus(key, true, {
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
      cpu: {
        loadavg_1m: cpuLoad[0],
        loadavg_5m: cpuLoad[1],
        loadavg_15m: cpuLoad[2],
      },
    });
  }
}
