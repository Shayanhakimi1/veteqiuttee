interface LogData {
  [key: string]: any;
}

class Logger {
  private formatMessage(level: string, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${logData}`;
  }

  info(message: string, data?: LogData): void {
    console.log(this.formatMessage('info', message, data));
  }

  error(message: string, data?: LogData): void {
    console.error(this.formatMessage('error', message, data));
  }

  warn(message: string, data?: LogData): void {
    console.warn(this.formatMessage('warn', message, data));
  }

  debug(message: string, data?: LogData): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, data));
    }
  }
}

export const logger = new Logger();