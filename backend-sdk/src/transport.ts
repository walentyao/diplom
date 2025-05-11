import fetch from 'node-fetch';
import { Transport, ErrorEvent, BasePayload } from './types.js';

export class HTTPTransport implements Transport {
  private readonly dsn: string;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private queue: ErrorEvent[] = [];
  private isProcessing: boolean = false;

  constructor(config: { dsn: string; maxRetries?: number; retryDelay?: number }) {
    this.dsn = config.dsn;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  async send(event: ErrorEvent | BasePayload): Promise<void> {
    if ('error' in event) {
      await this.sendError(event);
      return;
    }

    const traceId = this.getTraceId();
    
    const response = await fetch(this.dsn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': traceId
      },
      body: JSON.stringify({
        ...event,
        traceId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send event: ${response.statusText}`);
    }
  }

  private getTraceId(): string {
    // Try to get traceId from current request context
    const traceId = process.env.TRACE_ID || 
                   (process.env.REQUEST_ID as string) || 
                   this.generateTraceId();
    return traceId;
  }

  private generateTraceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private async sendError(event: ErrorEvent): Promise<void> {
    this.queue.push(event);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const event = this.queue[0];
      let attempts = 0;
      let success = false;

      while (attempts < this.maxRetries && !success) {
        try {
          const traceId = this.getTraceId();
          const response = await fetch(this.dsn, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Trace-ID': traceId
            },
            body: JSON.stringify({
              ...event,
              traceId
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to send error event: ${response.statusText}`);
          }
          
          success = true;
        } catch (error) {
          attempts++;
          if (attempts < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
          }
        }
      }

      this.queue.shift();
    }

    this.isProcessing = false;
  }
}