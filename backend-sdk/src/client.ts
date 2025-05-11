import { MonitoringClient, MonitoringConfig, ErrorContext, ErrorEvent, EventData, MetricData } from './types.js';
import { HTTPTransport } from './transport.js';

export class MonitoringSDK implements MonitoringClient {
  private readonly transport: HTTPTransport;
  private readonly environment?: string;
  private isInitialized: boolean = false;

  constructor(config: MonitoringConfig) {
    this.transport = new HTTPTransport(config);
    this.environment = config.environment;
  }

  async captureException(error: Error, context: ErrorContext = {}): Promise<void> {
    const event: ErrorEvent = {
      error,
      context,
      timestamp: Date.now(),
      environment: this.environment,
    };

    await this.transport.send(event);
  }

  setup(): void {
    if (this.isInitialized) {
      return;
    }

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.captureException(error, {
        type: 'uncaughtException',
      }).catch(console.error);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason: any) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.captureException(error, {
        type: 'unhandledRejection',
      }).catch(console.error);
    });

    this.isInitialized = true;
  }

  teardown(): void {
    if (!this.isInitialized) {
      return;
    }

    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
    this.isInitialized = false;
  }

  public trackEvent(name: string, properties?: Record<string, any>): void {
    const eventData: EventData = {
      type: 'event',
      name,
      properties,
      timestamp: Date.now(),
      environment: this.environment
    };
    this.transport.send(eventData as any); // Type assertion needed due to transport interface limitation
  }

  public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metricData: MetricData = {
      type: 'metric',
      name,
      value,
      tags,
      timestamp: Date.now(),
      environment: this.environment
    };
    this.transport.send(metricData as any); // Type assertion needed due to transport interface limitation
  }
} 