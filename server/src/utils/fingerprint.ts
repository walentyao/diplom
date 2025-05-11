export function generateErrorFingerprint(message: string, stack?: string): string {
  // Remove dynamic numbers from message
  const cleanMessage = message.replace(/\d+/g, '#');
  
  // Get first line of stack trace if available
  const firstStackLine = stack?.split('\n')[1]?.trim() || '';
  
  // Combine message and stack trace for fingerprint
  return `${cleanMessage}|${firstStackLine}`;
} 