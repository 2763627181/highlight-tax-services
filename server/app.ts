import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import type { Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function createApp(httpServer?: Server) {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "wss:", "ws:"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(hpp());

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { 
      message: "Demasiadas peticiones, por favor intente más tarde.",
      retryAfter: 15 
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path.startsWith('/assets') || 
             req.path.startsWith('/node_modules') ||
             req.path === '/health';
    }
  });

  app.use('/api', globalLimiter);
  app.use(cookieParser());

  app.use(
    express.json({
      limit: '10kb',
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false, limit: '10kb' }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });

    next();
  });

  try {
    console.log('[App] Registering routes...');
    await registerRoutes(httpServer, app);
    console.log('[App] Routes registered successfully');
  } catch (error) {
    console.error('[App] Error registering routes:', error);
    throw error; // Re-lanzar para que el handler lo capture
  }

  // Middleware de manejo de errores - DEBE estar después de todas las rutas
  // Asegura que todos los errores devuelvan JSON, no HTML
  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    // Asegurar que siempre devolvamos JSON
    if (!res.headersSent) {
      const status = err.status || err.statusCode || 500;
      const message = process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : err.message || "Internal Server Error";

      console.error('[App] Error handler caught:', err.message, err.stack);
      log(`Error: ${err.message}`, "error");
      
      // Establecer Content-Type explícitamente
      res.setHeader('Content-Type', 'application/json');
      res.status(status).json({ message, error: process.env.NODE_ENV !== 'production' ? err.message : undefined });
    }
  });

  // NO agregar catch-all aquí - será agregado después de serveStatic en api/index.ts
  // Esto permite que serveStatic maneje las rutas del frontend antes del catch-all

  return app;
}
