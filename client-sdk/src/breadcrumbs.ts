import { ContextManager } from './context';

export function setupBreadcrumbsTracking(contextManager: ContextManager) {
  // Track clicks
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    contextManager.addBreadcrumb({
      type: 'click',
      category: 'ui',
      message: `Clicked on ${target.tagName.toLowerCase()}`,
      level: 'info',
      data: {
        elementId: target.id,
        elementClass: target.className,
        x: event.clientX,
        y: event.clientY,
      },
    });
  });

  // Track form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    contextManager.addBreadcrumb({
      type: 'custom',
      category: 'form',
      message: `Form submitted: ${form.id || form.name || 'unnamed form'}`,
      level: 'info',
      data: {
        formId: form.id,
        formName: form.name,
        formAction: form.action,
      },
    });
  });

  // Track navigation
  const originalPushState = history.pushState;
  history.pushState = function(state: any, title: string, url?: string | URL | null) {
    contextManager.addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      message: `Navigation to ${url}`,
      level: 'info',
      data: {
        url: url?.toString(),
      },
    });
    return originalPushState.call(this, state, title, url);
  };

  // Track XHR requests
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function(this: XMLHttpRequest) {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    xhr.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
      contextManager.addBreadcrumb({
        type: 'xhr',
        category: 'http',
        message: `XHR ${method} ${url}`,
        level: 'info',
        data: {
          method,
          url: url.toString(),
        },
      });
      return originalOpen.call(this, method, url, async ?? true, username, password);
    };
    return xhr;
  } as unknown as typeof XMLHttpRequest;

  // Track fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    contextManager.addBreadcrumb({
      type: 'fetch',
      category: 'http',
      message: `Fetch ${input instanceof URL ? input.toString() : input}`,
      level: 'info',
      data: {
        url: input instanceof URL ? input.toString() : input,
        method: init?.method || 'GET',
      },
    });
    return originalFetch.call(this, input, init);
  };

  // Track console errors
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    contextManager.addBreadcrumb({
      type: 'console',
      category: 'console',
      message: args.join(' '),
      level: 'error',
    });
    return originalConsoleError.apply(this, args);
  };

  // Track console warnings
  const originalConsoleWarn = console.warn;
  console.warn = function(...args: any[]) {
    contextManager.addBreadcrumb({
      type: 'console',
      category: 'console',
      message: args.join(' '),
      level: 'warning',
    });
    return originalConsoleWarn.apply(this, args);
  };
} 