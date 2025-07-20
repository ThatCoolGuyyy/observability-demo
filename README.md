# Node.js Observability Demo

A simple Node.js/Express application instrumented with OpenTelemetry and a full observability stack (Grafana, Loki, Tempo, Prometheus) in Kubernetes.

## Features

- Automatic tracing and metrics with OpenTelemetry
- Structured JSON logging with trace correlation
- Ready-to-use observability dashboards

## Installation

```bash
npm install
```

## Usage

### Local Development

```bash
npm run dev
```

### Build Docker Image

```bash
docker build -t telemetry-demo-app:latest .
```

### Deploy to Kubernetes

```bash
kubectl apply -f k8s/observability-stack/
kubectl apply -f k8s/app-deployment.yaml
kubectl wait --for=condition=ready pod -l app=telemetry-demo-app --timeout=300s
kubectl wait --for=condition=ready pod -l app=prometheus --timeout=300s
kubectl wait --for=condition=ready pod -l app=grafana --timeout=300s
kubectl wait --for=condition=ready pod -l app=loki --timeout=300s
kubectl wait --for=condition=ready pod -l app=tempo --timeout=300s
```

## Accessing the Observability Stack

- **Grafana:** http://localhost:3000  
  `kubectl port-forward svc/grafana 3000:3000`
- **Prometheus:** http://localhost:9090  
  `kubectl port-forward svc/prometheus 9090:9090`
- **Loki:** http://localhost:3100  
  `kubectl port-forward svc/loki 3100:3100`
- **Tempo:** http://localhost:3200  
  `kubectl port-forward svc/tempo 3200:3200`

## API Endpoints

- `GET /health` — Health check endpoint (used by Kubernetes probes)
- `GET /api/data` — Returns a simple JSON message