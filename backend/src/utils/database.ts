import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Prisma client singleton
class DatabaseService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'info',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ],
        errorFormat: 'pretty',
      });

      // Log database queries in development
      if (process.env['NODE_ENV'] === 'development') {
        // Query logging can be enabled via Prisma log configuration
        logger.debug('Database connected in development mode');
      }

      // Database event logging is handled by Prisma internally
      // For custom logging, use middleware or query events
    }

    return DatabaseService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
      logger.info('Database disconnected');
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      await DatabaseService.getInstance().$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export the singleton instance
export const prisma = DatabaseService.getInstance();

// Export the class for testing purposes
export { DatabaseService };

// Handle process termination
process.on('beforeExit', async () => {
  await DatabaseService.disconnect();
});

process.on('SIGINT', async () => {
  await DatabaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await DatabaseService.disconnect();
  process.exit(0);
});