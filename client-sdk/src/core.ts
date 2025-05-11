import { setupErrorTracking } from './error';
import { setupPerformanceTracking } from './performance';
import { send } from './transport';
import { ContextManager } from './context';
import { setupBreadcrumbsTracking } from './breadcrumbs';
import { MonitoringEvent } from './types';

export interface MonitoringConfig {
  endpoint: string;
  projectId: string;
  userId?: string;
  release?: string;
  environment?: string;
  sampleRate?: number;
}

let config: MonitoringConfig;
let contextManager: ContextManager;

export function initMonitoring(userConfig: MonitoringConfig) {
  config = userConfig;
  contextManager = ContextManager.getInstance();
  
  setupErrorTracking(sendEvent);
  setupPerformanceTracking(sendEvent);
  setupBreadcrumbsTracking(contextManager);
}

function sendEvent(data: Partial<MonitoringEvent>) {
  if (!data.type) {
    console.warn('Event type is required');
    return;
  }

  const event: MonitoringEvent = {
    type: data.type,
    ...data,
    projectId: config.projectId,
    userId: config.userId || null,
    timestamp: Date.now(),
    device: contextManager.getContext().device,
    session: contextManager.getContext().session,
    breadcrumbs: contextManager.getContext().breadcrumbs,
    release: config.release,
    environment: config.environment,
  };

  // Apply sampling if configured
  if (config.sampleRate !== undefined && Math.random() > config.sampleRate) {
    return;
  }

  send(config.endpoint, event);
}

export class MonitoringSDK {
  public trackEvent(name: string, properties?: Record<string, any>): void {
    const eventData: EventData = {
      type: 'event',
      name,
      properties,
      timestamp: Date.now(),
      // ... existing code for other base fields ...
    };
    this.transport.send(eventData);
  }

  public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metricData: MetricData = {
      type: 'metric',
      name,
      value,
      tags,
      timestamp: Date.now(),
      // ... existing code for other base fields ...
    };
    this.transport.send(metricData);
  }
}