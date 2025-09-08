import fs from 'fs';
import path from 'path';

// Log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

class Logger {
  private logLevel: LogLevel;
  private logFile: string | undefined;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.logFile = process.env['LOG_FILE'];
    this.ensureLogDirectory();
  }

  private getLogLevel(): LogLevel {
    const level = process.env['LOG_LEVEL']?.toUpperCase() || 'INFO';
    switch (level) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private ensureLogDirectory(): void {
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta })
    };

    if (process.env['NODE_ENV'] === 'development') {
      // Pretty format for development
      const metaStr = meta ? ` ${JSON.stringify(meta, null, 2)}` : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    } else {
      // JSON format for production
      return JSON.stringify(logEntry);
    }
  }

  private writeToFile(formattedMessage: string): void {
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any): void {
    if (level <= this.logLevel) {
      const formattedMessage = this.formatMessage(levelName, message, meta);
      
      // Console output with colors
      if (process.env['NODE_ENV'] === 'development') {
        switch (level) {
          case LogLevel.ERROR:
            console.error(`\x1b[31m${formattedMessage}\x1b[0m`);
            break;
          case LogLevel.WARN:
            console.warn(`\x1b[33m${formattedMessage}\x1b[0m`);
            break;
          case LogLevel.INFO:
            console.info(`\x1b[36m${formattedMessage}\x1b[0m`);
            break;
          case LogLevel.DEBUG:
            console.debug(`\x1b[37m${formattedMessage}\x1b[0m`);
            break;
        }
      } else {
        console.log(formattedMessage);
      }

      // Write to file
      this.writeToFile(formattedMessage);
    }
  }

  public error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'error', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, 'warn', message, meta);
  }

  public info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, 'info', message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, 'debug', message, meta);
  }

  // HTTP request logging
  public http(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void {
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
    const meta = {
      method,
      url,
      statusCode,
      responseTime,
      userAgent
    };
    this.info(message, meta);
  }

  // Security event logging
  public security(event: string, details: any): void {
    const message = `Security Event: ${event}`;
    this.warn(message, { securityEvent: event, ...details });
  }

  // Database operation logging
  public database(operation: string, table: string, duration?: number, error?: any): void {
    if (error) {
      this.error(`Database ${operation} failed on ${table}`, { operation, table, error });
    } else {
      this.debug(`Database ${operation} on ${table}${duration ? ` (${duration}ms)` : ''}`, {
        operation,
        table,
        duration
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger, LogLevel };