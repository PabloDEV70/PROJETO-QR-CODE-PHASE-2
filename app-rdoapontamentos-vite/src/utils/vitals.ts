import type { Metric } from 'web-vitals';

function sendToConsole(metric: Metric) {
  if (import.meta.env.DEV) {
    console.log(
      `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(1)}`,
      'color: #2e7d32; font-weight: bold',
    );
  }
}

export async function reportWebVitals() {
  const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

  onCLS(sendToConsole);
  onFCP(sendToConsole);
  onLCP(sendToConsole);
  onTTFB(sendToConsole);
  onINP(sendToConsole);
}
