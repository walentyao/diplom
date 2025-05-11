import { MonitoringEvent } from './types';

interface LayoutShift extends PerformanceEntry {
  value: number;
}

export function setupPerformanceTracking(send: (data: Partial<MonitoringEvent>) => void) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      
      // Get Core Web Vitals
      const fcp = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
      const lcp = performance.getEntriesByName('largest-contentful-paint')[0] as PerformanceEntry;
      const fid = performance.getEntriesByName('first-input-delay')[0] as PerformanceEntry;
      const cls = performance.getEntriesByName('cumulative-layout-shift')[0] as LayoutShift;

      send({
        type: 'performance',
        performance: {
          ttfb: nav.responseStart - nav.requestStart,
          domLoad: nav.domContentLoadedEventEnd - nav.startTime,
          totalLoad: nav.loadEventEnd - nav.startTime,
          fcp: fcp?.startTime,
          lcp: lcp?.startTime,
          fid: fid?.duration,
          cls: cls?.value,
        },
      });
    }, 0);
  });

  // Track resource loading times
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        send({
          type: 'resource',
          message: `Resource loaded: ${entry.name}`,
          performance: {
            ttfb: resourceEntry.responseStart - resourceEntry.requestStart,
            domLoad: 0, // Not applicable for resources
            totalLoad: entry.duration,
          },
        });
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}