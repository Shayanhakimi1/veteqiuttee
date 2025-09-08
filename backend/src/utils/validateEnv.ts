import { logger } from './logger.js';

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  PORT: string;
  NODE_ENV: string;
  CORS_ORIGIN: string;
  BCRYPT_SALT_ROUNDS: string;
  MAX_FILE_SIZE: string;
  UPLOAD_PATH: string;
  RATE_LIMIT_WINDOW_MS: string;
  RATE_LIMIT_MAX_REQUESTS: string;
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const defaultValues: Partial<EnvConfig> = {
  PORT: '3001',
  NODE_ENV: 'development',
  CORS_ORIGIN: 'http://localhost:5173',
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_IN: '30d',
  BCRYPT_SALT_ROUNDS: '12',
  MAX_FILE_SIZE: '10485760', // 10MB
  UPLOAD_PATH: './uploads',
  RATE_LIMIT_WINDOW_MS: '900000', // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: '100'
};

export function validateEnv(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }

  // Set default values for optional variables
  for (const [key, defaultValue] of Object.entries(defaultValues)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      warnings.push(`Using default value for ${key}: ${defaultValue}`);
    }
  }

  // Validate specific environment variables
  validateSpecificEnvVars(errors, warnings);

  // Log warnings
  if (warnings.length > 0) {
    warnings.forEach(warning => logger.warn(warning));
  }

  // Exit if there are errors
  if (errors.length > 0) {
    logger.error('Environment validation failed:');
    errors.forEach(error => logger.error(`  - ${error}`));
    process.exit(1);
  }

  logger.info('Environment validation passed');
}

function validateSpecificEnvVars(errors: string[], warnings: string[]): void {
  // Validate DATABASE_URL format
  if (process.env['DATABASE_URL'] && 
      !process.env['DATABASE_URL'].startsWith('postgresql://') && 
      !process.env['DATABASE_URL'].startsWith('file:')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL or SQLite connection string');
  }

  // Validate PORT
  const port = parseInt(process.env['PORT'] || '3001');
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  // Validate NODE_ENV
  const validNodeEnvs = ['development', 'production', 'test'];
  if (process.env['NODE_ENV'] && !validNodeEnvs.includes(process.env['NODE_ENV'])) {
    warnings.push(`NODE_ENV should be one of: ${validNodeEnvs.join(', ')}`);
  }

  // Validate JWT_SECRET length
  if (process.env['JWT_SECRET'] && process.env['JWT_SECRET'].length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security');
  }

  // Validate JWT_REFRESH_SECRET length
  if (process.env['JWT_REFRESH_SECRET'] && process.env['JWT_REFRESH_SECRET'].length < 32) {
    warnings.push('JWT_REFRESH_SECRET should be at least 32 characters long for security');
  }

  // Validate BCRYPT_SALT_ROUNDS
  const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '12');
  if (isNaN(saltRounds) || saltRounds < 10 || saltRounds > 15) {
    warnings.push('BCRYPT_SALT_ROUNDS should be between 10 and 15');
  }

  // Validate MAX_FILE_SIZE
  const maxFileSize = parseInt(process.env['MAX_FILE_SIZE'] || '10485760');
  if (isNaN(maxFileSize) || maxFileSize < 1024) {
    errors.push('MAX_FILE_SIZE must be a valid number (minimum 1024 bytes)');
  }

  // Validate RATE_LIMIT_WINDOW_MS
  const rateLimitWindow = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000');
  if (isNaN(rateLimitWindow) || rateLimitWindow < 60000) {
    warnings.push('RATE_LIMIT_WINDOW_MS should be at least 60000ms (1 minute)');
  }

  // Validate RATE_LIMIT_MAX_REQUESTS
  const rateLimitMax = parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100');
  if (isNaN(rateLimitMax) || rateLimitMax < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be a positive number');
  }

  // Validate CORS_ORIGIN format
  if (process.env['CORS_ORIGIN']) {
    const origins = process.env['CORS_ORIGIN'].split(',');
    for (const origin of origins) {
      const trimmedOrigin = origin.trim();
      if (trimmedOrigin !== '*' && !isValidUrl(trimmedOrigin)) {
        warnings.push(`Invalid CORS origin: ${trimmedOrigin}`);
      }
    }
  }

  // Production-specific validations
  if (process.env['NODE_ENV'] === 'production') {
    if (process.env['JWT_SECRET'] === 'your_super_secret_jwt_key_here_change_in_production') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }

    if (process.env['JWT_REFRESH_SECRET'] === 'your_super_secret_refresh_jwt_key_here') {
      errors.push('JWT_REFRESH_SECRET must be changed from default value in production');
    }

    if (process.env['CORS_ORIGIN'] === 'http://localhost:5173') {
      warnings.push('CORS_ORIGIN should be updated for production environment');
    }
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Export environment configuration with type safety
export function getEnvConfig(): EnvConfig {
  return {
    DATABASE_URL: process.env['DATABASE_URL']!,
    JWT_SECRET: process.env['JWT_SECRET']!,
    JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN']!,
    JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET']!,
    JWT_REFRESH_EXPIRES_IN: process.env['JWT_REFRESH_EXPIRES_IN']!,
    PORT: process.env['PORT']!,
    NODE_ENV: process.env['NODE_ENV']!,
    CORS_ORIGIN: process.env['CORS_ORIGIN']!,
    BCRYPT_SALT_ROUNDS: process.env['BCRYPT_SALT_ROUNDS']!,
    MAX_FILE_SIZE: process.env['MAX_FILE_SIZE']!,
    UPLOAD_PATH: process.env['UPLOAD_PATH']!,
    RATE_LIMIT_WINDOW_MS: process.env['RATE_LIMIT_WINDOW_MS']!,
    RATE_LIMIT_MAX_REQUESTS: process.env['RATE_LIMIT_MAX_REQUESTS']!
  };
}