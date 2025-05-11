export interface MonitoringConfig {
  dsn: string;
  environment?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ErrorContext {
  url?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  [key: string]: any;
}

export interface ErrorEvent {
  error: Error;
  context: ErrorContext;
  timestamp: number;
  environment?: string;
}

export interface Transport {
  send(event: ErrorEvent | EventData | MetricData): Promise<void>;
}

export interface MonitoringClient {
  captureException(error: Error, context?: ErrorContext): Promise<void>;
  setup(): void;
  teardown(): void;
}

export interface EventPayload {
  name: string;
  properties?: Record<string, any>;
}

export interface MetricPayload {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export type PayloadType = 'error' | 'performance' | 'event' | 'metric';

export interface BasePayload {
  type: PayloadType;
  timestamp: number;
  environment?: string;
  traceId?: string;
  sessionId?: string;
}

export interface EventData extends BasePayload {
  type: 'event';
  name: string;
  properties?: Record<string, any>;
}

export interface MetricData extends BasePayload {
  type: 'metric';
  name: string;
  value: number;
  tags?: Record<string, string>;
} 