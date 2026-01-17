// Logging utilities for edge functions

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  functionName?: string;
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const fn = entry.functionName ? ` [${entry.functionName}]` : '';
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `${base}${fn} ${entry.message}${data}`;
}

function log(level: LogLevel, message: string, data?: unknown, functionName?: string) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    functionName,
  };

  const formatted = formatLog(entry);
  
  switch (level) {
    case 'debug':
    case 'info':
      console.log(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, data?: unknown, fn?: string) => log('debug', message, data, fn),
  info: (message: string, data?: unknown, fn?: string) => log('info', message, data, fn),
  warn: (message: string, data?: unknown, fn?: string) => log('warn', message, data, fn),
  error: (message: string, data?: unknown, fn?: string) => log('error', message, data, fn),
};

export function createLogger(functionName: string) {
  return {
    debug: (message: string, data?: unknown) => logger.debug(message, data, functionName),
    info: (message: string, data?: unknown) => logger.info(message, data, functionName),
    warn: (message: string, data?: unknown) => logger.warn(message, data, functionName),
    error: (message: string, data?: unknown) => logger.error(message, data, functionName),
  };
}
