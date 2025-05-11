import { MonitoringEvent } from './types';

export function setupErrorTracking(send: (data: Partial<MonitoringEvent>) => void) {
  window.onerror = (msg, url, line, col, err) => {
    send({
      type: 'error',
      message: err?.message || String(msg),
      stack: err?.stack || null,
      url,
      line,
      col,
    });
  };

  window.onunhandledrejection = (event) => {
    send({
      type: 'unhandledrejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || null,
    });
  };
}