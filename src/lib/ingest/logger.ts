type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  userId?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export function log(
  level: LogLevel,
  action: string,
  metadata?: Record<string, any>,
  error?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    action,
    ...(metadata && { metadata }),
    ...(error && { error })
  };

  // Output as single-line JSON for easy parsing
  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (action: string, metadata?: Record<string, any>) => log("INFO", action, metadata),
  warn: (action: string, metadata?: Record<string, any>) => log("WARN", action, metadata),
  error: (action: string, metadata?: Record<string, any>, error?: string) => log("ERROR", action, metadata, error)
};
