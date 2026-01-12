/**
 * Centralized Error Handling
 * 
 * Provides consistent error classification, sanitization, and user-friendly messages.
 * All server actions should use these utilities for error handling.
 */

import { nanoid } from 'nanoid';

/**
 * Error codes for classification
 */
export enum ErrorCode {
  // Authentication
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID = 'AUTH_INVALID',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',

  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',

  // Database
  DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED = 'DB_QUERY_FAILED',
  DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',

  // Business Logic
  RULE_CONFLICT = 'RULE_CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  OPERATION_FAILED = 'OPERATION_FAILED',

  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

/**
 * Application error with metadata
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorId: string;
  public readonly metadata?: Record<string, any>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorId = nanoid(10);
    this.metadata = metadata;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Predefined error factories
 */
export const Errors = {
  authRequired: (message = 'Authentication required') =>
    new AppError(message, ErrorCode.AUTH_REQUIRED, 401),

  authInvalid: (message = 'Invalid credentials') =>
    new AppError(message, ErrorCode.AUTH_INVALID, 401),

  forbidden: (message = 'Access forbidden') =>
    new AppError(message, ErrorCode.AUTH_FORBIDDEN, 403),

  validationFailed: (message: string, metadata?: Record<string, any>) =>
    new AppError(message, ErrorCode.VALIDATION_FAILED, 400, true, metadata),

  invalidInput: (field: string, reason: string) =>
    new AppError(
      `Invalid ${field}: ${reason}`,
      ErrorCode.INVALID_INPUT,
      400,
      true,
      { field, reason }
    ),

  notFound: (resource: string, id?: string) =>
    new AppError(
      `${resource} not found${id ? `: ${id}` : ''}`,
      ErrorCode.RECORD_NOT_FOUND,
      404,
      true,
      { resource, id }
    ),

  dbError: (message: string, metadata?: Record<string, any>) =>
    new AppError(message, ErrorCode.DB_QUERY_FAILED, 500, true, metadata),

  conflict: (message: string) =>
    new AppError(message, ErrorCode.RULE_CONFLICT, 409),

  notImplemented: (feature: string) =>
    new AppError(
      `${feature} is not yet implemented`,
      ErrorCode.NOT_IMPLEMENTED,
      501
    ),

  internal: (message = 'Internal server error') =>
    new AppError(message, ErrorCode.INTERNAL_ERROR, 500, false),
};

/**
 * Sanitize error for client response
 * Removes sensitive information and stack traces
 */
export function sanitizeError(error: unknown): {
  message: string;
  code: string;
  errorId?: string;
  statusCode: number;
} {
  // AppError - already structured
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      errorId: error.errorId,
      statusCode: error.statusCode,
    };
  }

  // Zod validation error
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    return {
      message: 'Validation failed',
      code: ErrorCode.VALIDATION_FAILED,
      statusCode: 400,
    };
  }

  // Database errors (Drizzle/Postgres)
  if (error instanceof Error) {
    // Connection errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      return {
        message: 'Database connection failed',
        code: ErrorCode.DB_CONNECTION_FAILED,
        statusCode: 503,
      };
    }

    // Constraint violations
    if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
      return {
        message: 'Record already exists',
        code: ErrorCode.DUPLICATE_ENTRY,
        statusCode: 409,
      };
    }

    // Foreign key violations
    if (error.message.includes('foreign key constraint')) {
      return {
        message: 'Related record not found',
        code: ErrorCode.DB_CONSTRAINT_VIOLATION,
        statusCode: 400,
      };
    }
  }

  // Generic error
  return {
    message: 'An unexpected error occurred',
    code: ErrorCode.INTERNAL_ERROR,
    statusCode: 500,
  };
}

/**
 * Redact sensitive information from error metadata
 */
export function redactSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'auth',
    'authorization',
    'cookie',
  ];

  const redacted = { ...data };

  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
      redacted[key] = '***REDACTED***';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
}

/**
 * Log error with context
 * In production, this should integrate with a logging service
 */
export function logError(
  error: unknown,
  context?: {
    action?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
) {
  const sanitized = sanitizeError(error);
  const redactedContext = context ? redactSensitiveData(context) : {};

  const logEntry = {
    timestamp: new Date().toISOString(),
    error: sanitized,
    context: redactedContext,
    stack: error instanceof Error ? error.stack : undefined,
  };

  // In production, send to logging service (e.g., Sentry, LogRocket, Datadog)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with logging service
    console.error('[ERROR]', JSON.stringify(logEntry));
  } else {
    console.error('[ERROR]', logEntry);
  }

  return sanitized.errorId;
}

/**
 * Wrap async function with error handling
 * Usage: const safeFunction = withErrorHandling(myFunction);
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: { action?: string }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorId = logError(error, context);
      const sanitized = sanitizeError(error);

      // Return error response
      return {
        success: false,
        error: sanitized.message,
        errorId,
        code: sanitized.code,
      };
    }
  }) as T;
}
