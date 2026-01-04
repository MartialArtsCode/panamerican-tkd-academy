import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels with priority
const LOG_LEVELS = {
  error: 0,
  warn:  1,
  info: 2,
  http: 3,
  debug:  4,
};

// Color codes for console output
const COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  http: '\x1b[35m',  // Magenta
  debug: '\x1b[32m', // Green
  reset: '\x1b[0m',
};

// Determine environment
const NODE_ENV = process. env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined. log');

/**
 * Format timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format log message
 */
function formatMessage(level, message, meta = {}) {
  const timestamp = getTimestamp();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level. toUpperCase()}]: ${message}${metaStr}`;
}

/**
 * Write to log file
 */
function writeToFile(filePath, message) {
  try {
    fs.appendFileSync(filePath, message + '\n', 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

/**
 * Check if log level should be logged
 */
function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[LOG_LEVEL];
}

/**
 * Core logging function
 */
function log(level, message, meta = {}) {
  if (!shouldLog(level)) return;

  const formattedMessage = formatMessage(level, message, meta);

  // Console output (colorized in development)
  if (NODE_ENV !== 'test') {
    const color = COLORS[level] || COLORS.reset;
    console. log(`${color}${formattedMessage}${COLORS.reset}`);
  }

  // Write to combined log file
  writeToFile(combinedLogPath, formattedMessage);

  // Write errors to separate error log
  if (level === 'error') {
    writeToFile(errorLogPath, formattedMessage);
  }
}

/**
 * Logger object with level methods
 */
const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  http: (message, meta) => log('http', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};

/**
 * HTTP request logger middleware for Express
 */
export function httpLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl || req.url}`;
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error(message, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(message, meta);
    } else {
      logger.http(message, meta);
    }
  });

  next();
}

/**
 * Error logger - logs error details with stack trace
 */
export function logError(error, context = {}) {
  const errorDetails = {
    message: error. message,
    stack: error. stack,
    ... context,
  };
  logger.error('Application Error', errorDetails);
}

/**
 * Authentication logger
 */
export function logAuth(action, details = {}) {
  logger.info(`Auth:  ${action}`, details);
}

/**
 * Database logger
 */
export function logDB(action, details = {}) {
  logger.debug(`DB: ${action}`, details);
}

/**
 * Performance logger
 */
export function logPerformance(operation, duration, details = {}) {
  logger.debug(`Performance: ${operation}`, {
    duration:  `${duration}ms`,
    ...details,
  });
}

/**
 * Stream object for Morgan HTTP logger
 */
export const morganStream = {
  write:  (message) => {
    logger.http(message. trim());
  },
};

export default logger;
