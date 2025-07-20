import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { trace, metrics } from '@opentelemetry/api';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const resource = new Resource({
  'service.name': 'telemetry-demo-app',
  'service.version': '1.0.0',
  'deployment.environment': process.env.NODE_ENV || 'development',
});

const otlpMetricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: otlpMetricExporter,
  exportIntervalMillis: 5000, 
});

const meterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

metrics.setGlobalMeterProvider(meterProvider);

const sdk = new NodeSDK({
  resource: resource,
  
  instrumentations: [getNodeAutoInstrumentations()],

  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  }),
});

sdk.start();

console.log('✅ OpenTelemetry SDK initialized with auto-instrumentation');
console.log('Environment:', process.env.NODE_ENV);
console.log('📡 Traces →', process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT);
console.log('📡 Metrics → OTLP exporter to', process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT);
console.log('🔍 Logs -  Winston-loki to', process.env.LOKI_URL);

process.on('SIGTERM', () => {
  Promise.all([
    sdk.shutdown(),
    meterProvider.shutdown()
  ])
    .then(() => console.log('OpenTelemetry SDK and metrics provider terminated'))
    .catch((error) => console.log('Error terminating OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});

export { sdk }; 