import './tracing';

import express from 'express';
import { trace, metrics } from '@opentelemetry/api';
import logger from './logger';

const app = express();
const PORT = 3000;

const meter = metrics.getMeter('telemetry-demo-app');

// const totalRequests = meter.createCounter('app_requests_total', {
//   description: 'Total application requests',
// });
const lastRequestTime = meter.createObservableGauge('app_last_request_time', {
  description: 'Timestamp of last request',
});

let lastRequestTimestamp = Date.now();
lastRequestTime.addCallback((observableResult) => {
  observableResult.observe(lastRequestTimestamp);
});
const responseTimeHistogram = meter.createHistogram('app_response_time_seconds', {
  description: 'Response time in seconds',
});

const tracer = trace.getTracer('telemetry-demo-app');

app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    // totalRequests.add(1);
    lastRequestTimestamp = Date.now();
    responseTimeHistogram.record(duration);
  });
  next();
});

app.get('/health', (req, res) => {
  logger.info({ message: 'Health check requested' });

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/data', async (req, res) => {
  // const span = tracer.startSpan('api_data_request');
  // span.setAttribute('http.method', req.method);
  // span.setAttribute('http.url', req.url);
  // span.setAttribute('http.status_code', res.statusCode);
  // span.end();
  // logger.info({ message: 'Handling /api/data request' });

  res.json({
    result: {
      message: "Hello from the API"
    }
  });
});

app.listen(PORT, () => {
  logger.info({ message: `🚀 running on port ${PORT}` });
}); 