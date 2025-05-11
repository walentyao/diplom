import { Request, Response, NextFunction } from 'express';
import { MonitoringSDK } from './client.js';
import { ErrorContext } from './types.js';

export function createMonitoringMiddleware(client: MonitoringSDK) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store the original end function
    const originalEnd = res.end;

    // Override the end function to capture errors
    res.end = function (chunk?: any, encoding?: any, callback?: any) {
      if (res.statusCode >= 400) {
        const error = new Error(`HTTP Error ${res.statusCode}`);
        const context: ErrorContext = {
          url: req.url,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          userId: (req as any).user?.id,
          statusCode: res.statusCode,
        };

        client.captureException(error, context).catch(console.error);
      }

      // Call the original end function
      return originalEnd.call(this, chunk, encoding, callback);
    };

    next();
  };
}

export function errorHandler(client: MonitoringSDK) {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    const context: ErrorContext = {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: (req as any).user?.id,
    };

    client.captureException(error, context).catch(console.error);
    next(error);
  };
}