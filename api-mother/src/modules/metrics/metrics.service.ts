import { Injectable, OnModuleInit } from '@nestjs/common';
import * as prom from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private httpRequestsTotal: prom.Counter<string>;
  private httpErrorsTotal: prom.Counter<string>;
  private httpRequestDuration: prom.Histogram<string>;
  private cacheHitsTotal: prom.Counter<string>;
  private cacheMissesTotal: prom.Counter<string>;
  private readonly latencySamples: number[] = [];
  private readonly MAX_SAMPLES = 1000;

  onModuleInit(): void {
    prom.register.clear();
    prom.collectDefaultMetrics({ register: prom.register });

    this.httpRequestsTotal = new prom.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [prom.register],
    });

    this.httpErrorsTotal = new prom.Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP error responses',
      labelNames: ['method', 'route', 'error_code'],
      registers: [prom.register],
    });

    this.httpRequestDuration = new prom.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0],
      registers: [prom.register],
    });

    this.cacheHitsTotal = new prom.Counter({
      name: 'cache_hits_total',
      help: 'Total number of inspection cache hits served without a SQL Server query',
      labelNames: ['endpoint'],
      registers: [prom.register],
    });

    this.cacheMissesTotal = new prom.Counter({
      name: 'cache_misses_total',
      help: 'Total number of inspection cache misses that triggered a SQL Server query',
      labelNames: ['endpoint'],
      registers: [prom.register],
    });
  }

  recordRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    const labels = { method, route, status_code: String(statusCode) };
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, durationMs / 1000);
    this.recordLatencySample(durationMs);
  }

  recordError(method: string, route: string, errorCode: string): void {
    this.httpErrorsTotal.inc({ method, route, error_code: errorCode });
  }

  recordLatencySample(ms: number): void {
    this.latencySamples.push(ms);
    if (this.latencySamples.length > this.MAX_SAMPLES) {
      this.latencySamples.splice(0, this.latencySamples.length - this.MAX_SAMPLES);
    }
  }

  getP95LatencyMs(): number | null {
    if (this.latencySamples.length === 0) return null;
    const sorted = [...this.latencySamples].sort((a, b) => a - b);
    const idx = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[idx];
  }

  recordCacheHit(endpoint: string): void {
    this.cacheHitsTotal.inc({ endpoint });
  }

  recordCacheMiss(endpoint: string): void {
    this.cacheMissesTotal.inc({ endpoint });
  }

  async getMetrics(): Promise<string> {
    return prom.register.metrics();
  }

  getContentType(): string {
    return prom.register.contentType;
  }
}
