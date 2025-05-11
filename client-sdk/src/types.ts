export interface Breadcrumb {
  type: 'navigation' | 'click' | 'xhr' | 'fetch' | 'console' | 'custom';
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: number;
  data?: Record<string, any>;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface SessionInfo {
  id: string;
  startTime: number;
  lastActivity: number;
}

export interface MonitoringEvent {
  type: string;
  message?: string;
  stack?: string | null;
  url?: string;
  line?: number;
  col?: number;
  projectId: string;
  userId: string | null;
  timestamp: number;
  device?: DeviceInfo;
  session?: SessionInfo;
  breadcrumbs?: Breadcrumb[];
  release?: string;
  environment?: string;
  performance?: {
    ttfb: number;
    domLoad: number;
    totalLoad: number;
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  };
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