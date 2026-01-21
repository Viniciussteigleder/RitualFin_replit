/**
 * Structured logging utility
 * Provides consistent logging with correlation IDs and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  correlationId?: string;
  userId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private correlationId?: string;
  private userId?: string;
  private defaultContext: LogContext = {};

  /**
   * Set correlation ID for all subsequent logs
   */
  setCorrelationId(id: string) {
    this.correlationId = id;
  }

  /**
   * Set user ID for all subsequent logs
   */
  setUserId(id: string) {
    this.userId = id;
  }

  /**
   * Set default context for all logs
   */
  setDefaultContext(context: LogContext) {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  /**
   * Clear correlation ID
   */
  clearCorrelationId() {
    this.correlationId = undefined;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.defaultContext, ...context },
    };

    if (this.correlationId) {
      entry.correlationId = this.correlationId;
    }

    if (this.userId) {
      entry.userId = this.userId;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'development') {
      // Human-readable format for development
      const parts = [
        `[${entry.level.toUpperCase()}]`,
        entry.timestamp,
        entry.message,
      ];

      if (entry.correlationId) {
        parts.push(`(${entry.correlationId})`);
      }

      if (entry.context && Object.keys(entry.context).length > 0) {
        parts.push(JSON.stringify(entry.context, null, 2));
      }

      if (entry.error) {
        parts.push(`\nError: ${entry.error.message}`);
        if (entry.error.stack) {
          parts.push(entry.error.stack);
        }
      }

      return parts.join(' ');
    }

    // JSON format for production
    return JSON.stringify(entry);
  }

  /**
   * Output log entry
   */
  private output(entry: LogEntry) {
    const formatted = this.formatLog(entry);

    switch (entry.level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext) {
    this.output(this.createLogEntry('debug', message, context));
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    this.output(this.createLogEntry('info', message, context));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext) {
    this.output(this.createLogEntry('warn', message, context));
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.output(this.createLogEntry('error', message, context, error));
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.correlationId = this.correlationId;
    childLogger.userId = this.userId;
    childLogger.defaultContext = { ...this.defaultContext, ...context };
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating custom instances
export { Logger };

/**
 * Create logger for specific module
 */
export function createLogger(module: string): Logger {
  return logger.child({ module });
}
