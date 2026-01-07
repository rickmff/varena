/**
 * Production-safe logging utility
 *
 * - In production: Only logs errors and warnings
 * - In development: Logs all levels with additional context
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("User signed in", { userId: "123" });
 *   logger.error("Failed to process", error);
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Format error object for logging
 */
function formatError(error: unknown): LogEntry["error"] | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
    ...(error ? { error: formatError(error) } : {}),
  };
}

/**
 * Output log entry to console
 */
function output(entry: LogEntry): void {
  const prefix = `[${entry.level.toUpperCase()}]`;
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : "";

  switch (entry.level) {
    case "error":
      if (entry.error) {
        console.error(`${prefix} ${entry.message}${contextStr}`, entry.error);
      } else {
        console.error(`${prefix} ${entry.message}${contextStr}`);
      }
      break;
    case "warn":
      console.warn(`${prefix} ${entry.message}${contextStr}`);
      break;
    case "info":
      console.log(`${prefix} ${entry.message}${contextStr}`);
      break;
    case "debug":
      console.log(`${prefix} ${entry.message}${contextStr}`);
      break;
  }
}

/**
 * Logger with production-safe methods
 */
export const logger = {
  /**
   * Debug level - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      output(createLogEntry("debug", message, context));
    }
  },

  /**
   * Info level - only in development
   */
  info(message: string, context?: LogContext): void {
    if (isDevelopment) {
      output(createLogEntry("info", message, context));
    }
  },

  /**
   * Warning level - always logged
   */
  warn(message: string, context?: LogContext): void {
    output(createLogEntry("warn", message, context));
  },

  /**
   * Error level - always logged
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    output(createLogEntry("error", message, context, error));
  },

  /**
   * Log API request (debug level)
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    if (isDevelopment) {
      output(createLogEntry("debug", `${method} ${path}`, context));
    }
  },

  /**
   * Log API response (debug level, or error if status >= 400)
   */
  apiResponse(method: string, path: string, status: number, context?: LogContext): void {
    if (status >= 400) {
      output(createLogEntry("error", `${method} ${path} -> ${status}`, context));
    } else if (isDevelopment) {
      output(createLogEntry("debug", `${method} ${path} -> ${status}`, context));
    }
  },

  /**
   * Log database operation (debug level)
   */
  db(operation: string, context?: LogContext): void {
    if (isDevelopment) {
      output(createLogEntry("debug", `[DB] ${operation}`, context));
    }
  },

  /**
   * Log auth event
   */
  auth(event: string, context?: LogContext): void {
    if (isDevelopment) {
      output(createLogEntry("info", `[Auth] ${event}`, context));
    }
  },
};

/**
 * Create a child logger with preset context
 */
export function createLogger(baseContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      logger.warn(message, { ...baseContext, ...context }),
    error: (message: string, error?: unknown, context?: LogContext) =>
      logger.error(message, error, { ...baseContext, ...context }),
  };
}

export default logger;

