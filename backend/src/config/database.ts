import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

// Create a global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Database configuration
const databaseConfig = {
  // Logging configuration
  log: [
    {
      emit: 'event' as const,
      level: 'query' as const,
    },
    {
      emit: 'event' as const,
      level: 'error' as const,
    },
    {
      emit: 'event' as const,
      level: 'info' as const,
    },
    {
      emit: 'event' as const,
      level: 'warn' as const,
    },
  ],
};

// Create Prisma client instance
const createPrismaClient = (): PrismaClient => {
  const prisma = new PrismaClient(databaseConfig);

  // Set up event listeners for logging
  prisma.$on('query', (e) => {
    if (process.env.NODE_ENV === 'development') {
      logger.database(`Query: ${e.query}`);
      logger.database(`Params: ${e.params}`);
      logger.database(`Duration: ${e.duration}ms`);
    }
  });

  prisma.$on('error', (e) => {
    logger.error('Database error:', e);
  });

  prisma.$on('info', (e) => {
    logger.info('Database info:', e.message);
  });

  prisma.$on('warn', (e) => {
    logger.warn('Database warning:', e.message);
  });

  return prisma;
};

// Use global variable in development to prevent multiple instances
const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Database connection test function
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
};

// Database disconnect function
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

// Database health check function
export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Database statistics function
export const getDatabaseStats = async () => {
  try {
    const [userCount, petCount, consultationCount, paymentCount] = await Promise.all([
      prisma.user.count(),
      prisma.pet.count(),
      prisma.consultation.count(),
      prisma.payment.count()
    ]);

    return {
      users: userCount,
      pets: petCount,
      consultations: consultationCount,
      payments: paymentCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error getting database stats:', error);
    throw error;
  }
};

// Transaction helper function
export const executeTransaction = async <T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> => {
  try {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx as PrismaClient);
    });
  } catch (error) {
    logger.error('Transaction failed:', error);
    throw error;
  }
};

// Export the Prisma client instance
export { prisma };
export default prisma;

// Export types
export type { PrismaClient } from '@prisma/client';