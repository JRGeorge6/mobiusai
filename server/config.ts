import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // Canvas LMS
  CANVAS_CLIENT_ID: z.string().optional(),
  CANVAS_CLIENT_SECRET: z.string().optional(),
  CANVAS_REDIRECT_URI: z.string().url().optional(),
  
  // Server
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BASE_URL: z.string().url().optional(),
  
  // Security
  SESSION_SECRET: z.string().min(32).default('your-super-secret-session-key-change-this-in-production'),
  COOKIE_SECRET: z.string().min(32).default('your-cookie-secret-change-this-in-production'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10485760'), // 10MB
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  SENSITIVE_OPERATION_LIMIT: z.string().transform(Number).pipe(z.number().positive()).default('10'),
  SENSITIVE_OPERATION_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('60000'), // 1 minute
  OPENAI_REQUEST_LIMIT: z.string().transform(Number).pipe(z.number().positive()).default('50'),
  OPENAI_REQUEST_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('60000'), // 1 minute
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_REQUEST_LOGGING: z.string().transform(val => val === 'true').default('true'),
  
  // Development
  ENABLE_DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
  ENABLE_VERBOSE_LOGGING: z.string().transform(val => val === 'true').default('false'),
  
  // Authentication providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated configuration
export const config = parseEnv();

// Helper function to get allowed origins as array
export const getAllowedOrigins = (): string[] => {
  return config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
};

// Helper function to check if in development mode
export const isDevelopment = (): boolean => {
  return config.NODE_ENV === 'development';
};

// Helper function to check if in production mode
export const isProduction = (): boolean => {
  return config.NODE_ENV === 'production';
};

// Helper function to check if debug mode is enabled
export const isDebugMode = (): boolean => {
  return config.ENABLE_DEBUG_MODE || isDevelopment();
};

// Helper function to get rate limit configuration
export const getRateLimitConfig = () => ({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP" }
});

// Helper function to get sensitive operation rate limit
export const getSensitiveOperationRateLimit = () => ({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.SENSITIVE_OPERATION_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many sensitive operations from this IP" }
});

// Helper function to get OpenAI rate limit
export const getOpenAIRateLimit = () => ({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.OPENAI_REQUEST_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests from this IP" }
}); 