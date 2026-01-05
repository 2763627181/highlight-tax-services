import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
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

  // CRÍTICO: Configurar trust proxy ANTES de cualquier middleware
  // Esto es necesario para que rate limiting funcione correctamente en Vercel
  // Vercel actúa como proxy, así que necesitamos confiar en los headers X-Forwarded-*
  app.set('trust proxy', true);

  // CRÍTICO: Middleware para preservar el método HTTP en Vercel
  // Este debe ser el PRIMER middleware para interceptar todas las peticiones
  // El problema es que serverless-http está cambiando POST a GET
  app.use((req: any, _res: any, next: any) => {
    const incomingMethod = req.method;
    
    // Buscar el método preservado en headers (lo guardamos antes de serverless-http)
    const preservedMethod = req.headers['x-preserved-http-method'] ||
                            req.headers['x-http-method-override'] || 
                            req.headers['x-method-override'] ||
                            req.headers['x-original-method'];
    
    // Si encontramos un método preservado y es diferente al actual, RESTAURARLO
    if (preservedMethod && typeof preservedMethod === 'string') {
      const correctMethod = preservedMethod.toUpperCase();
      if (correctMethod !== incomingMethod) {
        console.log(`[App] RESTORING method: ${incomingMethod} -> ${correctMethod} for ${req.path || req.url}`);
        
        // Forzar el método correcto
        req.method = correctMethod;
        
        // También intentar con defineProperty para hacerlo más permanente
        try {
          Object.defineProperty(req, 'method', {
            value: correctMethod,
            writable: true,
            configurable: true,
            enumerable: true
          });
        } catch (e) {
          // Si falla, al menos ya lo cambiamos arriba
          console.warn('[App] Could not use defineProperty for method, but method was changed');
        }
      }
    }
    
    // Log final para verificar
    console.log(`[App] Processing ${req.method} ${req.path || req.url} (incoming was: ${incomingMethod})`);
    
    next();
  });

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
    // Mejorar compatibilidad con proxies corporativos como Fortinet
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Headers adicionales para mejorar compatibilidad con Fortinet y otros proxies corporativos
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Asegurar que las respuestas usen HTTPS
    if (req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Headers para mejorar compatibilidad con proxies SSL
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permitir que proxies corporativos validen el certificado
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    next();
  });

  app.use(hpp());

  // Key generator para rate limiting en Vercel
  // Usa el helper ipKeyGenerator de express-rate-limit para manejo correcto de IPv6
  const rateLimitKeyGenerator = (req: Request): string => {
    // Obtener IP del request (maneja proxies como Vercel)
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xRealIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    
    let ip = 'unknown';
    if (xForwardedFor && typeof xForwardedFor === 'string') {
      ip = xForwardedFor.split(',')[0].trim();
    } else if (xRealIp && typeof xRealIp === 'string') {
      ip = xRealIp;
    } else if (cfConnectingIp && typeof cfConnectingIp === 'string') {
      ip = cfConnectingIp;
    } else {
      ip = req.ip || req.socket?.remoteAddress || 'unknown';
    }
    
    // Usar ipKeyGenerator para manejar IPv6 correctamente
    return ipKeyGenerator(ip);
  };

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { 
      message: "Demasiadas peticiones, por favor intente más tarde.",
      retryAfter: 15 
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimitKeyGenerator,
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

  // Catch-all para rutas API no encontradas (después de todas las rutas)
  // Solo para rutas /api/* que no fueron manejadas
  app.use('/api/*', (_req: Request, res: Response) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).json({ message: "Ruta API no encontrada" });
    }
  });

  return app;
}
