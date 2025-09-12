// Frontend Logger Utility
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = import.meta.env.VITE_LOG_LEVEL || 'info';
  }

  formatMessage(level, message, meta = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta })
    };

    if (this.isDevelopment) {
      // Pretty format for development
      const metaStr = meta ? ` ${JSON.stringify(meta, null, 2)}` : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    } else {
      // JSON format for production
      return JSON.stringify(logEntry);
    }
  }

  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }

  error(message, meta = null) {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message, meta);
      if (this.isDevelopment) {
        console.error(`%c${formattedMessage}`, 'color: #ff4444; font-weight: bold;');
      } else {
        console.error(formattedMessage);
        // In production, you might want to send errors to a logging service
        this.sendToLoggingService('error', message, meta);
      }
    }
  }

  warn(message, meta = null) {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage('warn', message, meta);
      if (this.isDevelopment) {
        console.warn(`%c${formattedMessage}`, 'color: #ffaa00; font-weight: bold;');
      } else {
        console.warn(formattedMessage);
      }
    }
  }

  info(message, meta = null) {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage('info', message, meta);
      if (this.isDevelopment) {
        console.info(`%c${formattedMessage}`, 'color: #0088cc; font-weight: bold;');
      } else {
        console.info(formattedMessage);
      }
    }
  }

  debug(message, meta = null) {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage('debug', message, meta);
      if (this.isDevelopment) {
        console.debug(`%c${formattedMessage}`, 'color: #888888;');
      } else {
        console.debug(formattedMessage);
      }
    }
  }

  // API request logging
  api(method, url, statusCode, responseTime, error = null) {
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
    const meta = {
      method,
      url,
      statusCode,
      responseTime,
      ...(error && { error })
    };
    
    if (error || statusCode >= 400) {
      this.error(message, meta);
    } else {
      this.debug(message, meta);
    }
  }

  // User action logging
  userAction(action, details = null) {
    this.info(`User Action: ${action}`, { action, ...details });
  }

  // Performance logging
  performance(operation, duration, details = null) {
    this.debug(`Performance: ${operation} took ${duration}ms`, { operation, duration, ...details });
  }

  // Send logs to external service in production
  sendToLoggingService(level, message, meta) {
    // Implement your logging service integration here
    // For example: Sentry, LogRocket, or custom endpoint
    try {
      // Example implementation:
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ level, message, meta, timestamp: new Date().toISOString() })
      // });
    } catch (error) {
      // Fallback to console if logging service fails
      console.error('Failed to send log to service:', error);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };