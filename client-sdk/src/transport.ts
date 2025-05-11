import { getSessionId } from './utils/session';
import { BasePayload } from './types';

export function send(endpoint: string, data: BasePayload): void {
  const sessionId = getSessionId();
  
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId
    },
    body: JSON.stringify({
      ...data,
      sessionId
    })
  }).catch(error => {
    console.error('Failed to send monitoring data:', error);
  });
}