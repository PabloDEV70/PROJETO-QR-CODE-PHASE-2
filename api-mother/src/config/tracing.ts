import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import type { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

// ExportResultCode.SUCCESS = 0 per OTel spec (avoids importing transitive @opentelemetry/core)
const EXPORT_SUCCESS = 0;

interface ExportResult {
  code: number;
  error?: Error;
}

const EXCLUDED_PATHS = new Set(['/health', '/healthz', '/metrics', '/readiness', '/favicon.ico']);

class FilteringExporter implements SpanExporter {
  constructor(private readonly delegate: SpanExporter) {}

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    const filtered = spans.filter((span) => {
      const httpTarget = span.attributes['http.target'] as string | undefined;
      if (!httpTarget) return true;
      return !EXCLUDED_PATHS.has(httpTarget.split('?')[0]);
    });

    if (filtered.length === 0) {
      resultCallback({ code: EXPORT_SUCCESS });
      return;
    }

    this.delegate.export(filtered, resultCallback);
  }

  async shutdown(): Promise<void> {
    return this.delegate.shutdown();
  }

  async forceFlush(): Promise<void> {
    const delegate = this.delegate as SpanExporter & { forceFlush?: () => Promise<void> };
    if (typeof delegate.forceFlush === 'function') {
      return delegate.forceFlush();
    }
  }
}

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'sankhya-db-gateway',
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    'deployment.environment.name': process.env.NODE_ENV || 'development',
  }),
);

const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
});

const spanProcessor = new BatchSpanProcessor(new FilteringExporter(exporter), {
  maxQueueSize: 2048,
  maxExportBatchSize: 512,
  scheduledDelayMillis: 5000,
});

const samplingRatio = parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || '0.1');
const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(samplingRatio),
});

const sdk = new NodeSDK({
  resource,
  sampler,
  spanProcessors: [spanProcessor],
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('OTel SDK shutdown error:', err);
  }
});

export default sdk;
