/**
 * @fileoverview Servidor principal de Highlight Tax Services
 * 
 * Este archivo configura y arranca el servidor Express con todas las medidas
 * de seguridad, middleware, y configuraciones necesarias para la aplicación.
 * 
 * @module server/index
 * @version 1.0.0
 * 
 * ## Características de Seguridad
 * - Helmet: Headers HTTP seguros
 * - Rate Limiting: Protección contra ataques de fuerza bruta
 * - HPP: Protección contra contaminación de parámetros HTTP
 * - Cookie Parser: Manejo seguro de cookies
 * - CORS: Control de origen cruzado
 * 
 * ## Flujo de Inicialización
 * 1. Configuración de middleware de seguridad
 * 2. Configuración de parsers de body
 * 3. Configuración de logging
 * 4. Registro de rutas API
 * 5. Configuración de Vite (desarrollo) o archivos estáticos (producción)
 * 6. Inicio del servidor HTTP en puerto 5000
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

/**
 * Instancia principal de la aplicación Express
 * Sirve tanto la API REST como el frontend React
 */
const app = express();

/**
 * Servidor HTTP que envuelve la aplicación Express
 * Necesario para WebSocket y conexiones en tiempo real
 */
const httpServer = createServer(app);

/**
 * Extensión del tipo IncomingMessage para incluir el cuerpo crudo
 * Necesario para verificación de webhooks y firmas
 */
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// =============================================================================
// MIDDLEWARE DE SEGURIDAD
// =============================================================================

/**
 * Helmet - Configura headers HTTP seguros
 * 
 * Protecciones incluidas:
 * - Content-Security-Policy: Previene XSS y inyección de código
 * - X-Content-Type-Options: Previene MIME sniffing
 * - X-Frame-Options: Previene clickjacking
 * - X-XSS-Protection: Protección adicional contra XSS
 * - Strict-Transport-Security: Fuerza HTTPS
 */
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

/**
 * HPP - HTTP Parameter Pollution Protection
 * 
 * Previene ataques donde parámetros duplicados podrían
 * confundir la lógica del servidor
 * Ejemplo: ?id=1&id=2 → solo toma el último valor
 */
app.use(hpp());

/**
 * Rate Limiter Global
 * 
 * Limita todas las peticiones para prevenir:
 * - Ataques DDoS
 * - Scraping excesivo
 * - Abuso de recursos del servidor
 * 
 * Configuración: 100 peticiones por IP cada 15 minutos
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite por IP
  message: { 
    message: "Demasiadas peticiones, por favor intente más tarde.",
    retryAfter: 15 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Excluir assets estáticos y healthchecks
    return req.path.startsWith('/assets') || 
           req.path.startsWith('/node_modules') ||
           req.path === '/health';
  }
});

app.use('/api', globalLimiter);

/**
 * Cookie Parser
 * 
 * Parsea cookies de las peticiones HTTP
 * Necesario para autenticación basada en cookies JWT
 */
app.use(cookieParser());

/**
 * JSON Body Parser con Raw Body
 * 
 * Parsea cuerpos JSON y guarda el buffer crudo
 * El buffer crudo es necesario para:
 * - Verificación de firmas de webhooks
 * - Validación de integridad de datos
 * 
 * Límite: 10KB para prevenir ataques de payload grande
 */
app.use(
  express.json({
    limit: '10kb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

/**
 * URL Encoded Body Parser
 * 
 * Parsea datos de formularios tradicionales
 * extended: false - usa querystring en lugar de qs
 * Límite: 10KB para seguridad
 */
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// =============================================================================
// LOGGING Y MONITOREO
// =============================================================================

/**
 * Función de logging centralizada
 * 
 * Formatea y muestra mensajes de log con timestamp
 * Usado para monitorear actividad del servidor
 * 
 * @param message - Mensaje a registrar
 * @param source - Origen del mensaje (default: "express")
 * 
 * @example
 * log("GET /api/users 200 in 45ms");
 * log("WebSocket connected", "websocket");
 */
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Middleware de Logging de Peticiones API
 * 
 * Registra información detallada de cada petición:
 * - Método HTTP
 * - Ruta solicitada
 * - Código de respuesta
 * - Tiempo de procesamiento
 * - Cuerpo de respuesta JSON (si aplica)
 * 
 * Solo registra rutas que comienzan con /api
 * para evitar ruido de assets estáticos
 */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  // Interceptar res.json para capturar la respuesta
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Registrar cuando la respuesta termine
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

// =============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// =============================================================================

/**
 * Función principal de inicialización
 * 
 * Configura todas las rutas, manejo de errores, y arranca el servidor
 * en modo desarrollo (Vite) o producción (archivos estáticos)
 */
(async () => {
  // Registrar rutas de la API
  await registerRoutes(httpServer, app);

  /**
   * Middleware de Manejo de Errores Global
   * 
   * Captura cualquier error no manejado y devuelve una respuesta JSON
   * No expone detalles internos del error en producción
   */
  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message || "Internal Server Error";

    log(`Error: ${err.message}`, "error");
    res.status(status).json({ message });
  });

  // Configurar servidor según el entorno
  if (process.env.NODE_ENV === "production") {
    // En producción, servir archivos estáticos compilados
    serveStatic(app);
  } else {
    // En desarrollo, usar Vite para hot module replacement
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  /**
   * Iniciar servidor HTTP
   * 
   * Puerto: Determinado por variable de entorno PORT (default: 5000)
   * Host: 0.0.0.0 para aceptar conexiones de cualquier origen
   * reusePort: true para permitir múltiples workers (clustering)
   */
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
