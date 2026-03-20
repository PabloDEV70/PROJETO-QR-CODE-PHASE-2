import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { MetricsService } from '../../metrics/metrics.service';

const P95_SLA_THRESHOLD_MS = 500;

@Injectable()
export class LatencySLAHealthIndicator extends HealthIndicator {
  constructor(private readonly metricsService: MetricsService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const p95Ms = this.metricsService.getP95LatencyMs();

      if (p95Ms === null) {
        return this.getStatus(key, true, {
          sla_compliant: true,
          p95_latency_ms: null,
          threshold_ms: P95_SLA_THRESHOLD_MS,
          note: 'No samples collected yet',
        });
      }

      const slaCompliant = p95Ms < P95_SLA_THRESHOLD_MS;
      return this.getStatus(key, slaCompliant, {
        sla_compliant: slaCompliant,
        p95_latency_ms: Math.round(p95Ms),
        threshold_ms: P95_SLA_THRESHOLD_MS,
      });
    } catch (e) {
      throw new HealthCheckError('Latency SLA check failed', e as Error);
    }
  }
}
