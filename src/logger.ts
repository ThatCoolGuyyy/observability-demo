import winston from 'winston';
import LokiTransport from 'winston-loki';
import { trace, context } from '@opentelemetry/api';

const enrichWithTraceInfo = winston.format((info) => {
  const span = trace.getSpan(context.active());
  if (span) {
    const { traceId, spanId } = span.spanContext();
    info.trace_id = traceId;
    info.span_id = spanId;
  }
  return info;
});

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

const lokiHost = process.env.LOKI_URL;
if (lokiHost) {
  const lokiLabels = {
    service_name: process.env.OTEL_SERVICE_NAME,
    job: process.env.OTEL_SERVICE_NAME,
    environment: process.env.NODE_ENV,
    version: process.env.OTEL_SERVICE_VERSION,
  };
  transports.push(
    new LokiTransport({
      host: lokiHost,
      labels: lokiLabels,
      interval: 1,
      onConnectionError: (err) => {
        console.error('Loki transport error:', err);
      },
      silent: false,
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    enrichWithTraceInfo(),
    winston.format.json()
  ),
  transports,
});

export default logger; 