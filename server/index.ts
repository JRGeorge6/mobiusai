import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import path from "path";
import fs from "fs";
import { 
  config, 
  getAllowedOrigins, 
  isDevelopment, 
  isProduction, 
  isDebugMode,
  getRateLimitConfig 
} from "./config";

// Get __dirname equivalent for both ESM and CommonJS
function getDirname(): string {
  // Check if we're in a CommonJS environment where __dirname is available
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  
  // ESM environment - try to use import.meta.url
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    const { fileURLToPath } = require("url");
    const __filename = fileURLToPath(import.meta.url);
    return path.dirname(__filename);
  }
  
  // Fallback to process.cwd()
  return process.cwd();
}

// Simple logging function
function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();

// Security middleware - must be first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Vite in development
}));

// CORS configuration
app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
app.use(rateLimit(getRateLimitConfig()));

// Body parsing middleware
app.use(express.json({ limit: config.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: false, limit: config.MAX_FILE_SIZE }));

// Request logging middleware
if (config.ENABLE_REQUEST_LOGGING) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        
        // Only log response body in debug mode
        if (isDebugMode() && capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      
      // Don't expose internal errors in production
      const message = isProduction() 
        ? (status === 500 ? "Internal Server Error" : err.message)
        : err.message || "Internal Server Error";

      // Log error details in development/debug mode
      if (isDebugMode()) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          status,
          url: _req.url,
          method: _req.method,
        });
      }

      res.status(status).json({ 
        message,
        ...(isDebugMode() && { error: err.message, stack: err.stack })
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ message: "Not Found" });
    });

    // Setup Vite in development
    if (isDevelopment()) {
      // Only import vite in development to avoid bundling issues
      const { setupVite } = await import("./vite.js");
      await setupVite(app, server);
    } else {
      // Production static file serving
      const distPath = path.resolve(getDirname(), "public");
      
      if (!fs.existsSync(distPath)) {
        throw new Error(
          `Could not find the build directory: ${distPath}, make sure to build the client first`,
        );
      }
      
      app.use(express.static(distPath));
      app.use("*", (_req: any, res: any) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }

    // Start server
    const port = config.PORT;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`🚀 Server running on port ${port} in ${config.NODE_ENV} mode`);
      if (isDebugMode()) {
        log(`🔧 Debug mode enabled`);
        log(`📊 Rate limit: ${config.RATE_LIMIT_MAX_REQUESTS} requests per ${config.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      log('SIGINT received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
