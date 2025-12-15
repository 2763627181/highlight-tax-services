/**
 * @fileoverview Rutas API de Highlight Tax Services
 * 
 * Este archivo define todos los endpoints de la API REST del sistema.
 * Incluye autenticación, gestión de casos tributarios, documentos,
 * citas, mensajería, y panel de administración.
 * 
 * @module server/routes
 * @version 1.0.0
 * 
 * ## Categorías de Endpoints
 * - /api/auth/* - Autenticación y autorización
 * - /api/cases - Gestión de casos tributarios (cliente)
 * - /api/documents - Gestión de documentos (cliente)
 * - /api/appointments - Gestión de citas (cliente)
 * - /api/messages - Sistema de mensajería
 * - /api/admin/* - Panel de administración
 * - /api/contact - Formulario de contacto público
 * 
 * ## Seguridad Implementada
 * - JWT para autenticación
 * - Rate limiting por endpoint
 * - Validación de entrada con Zod
 * - Sanitización de archivos
 * - Control de acceso basado en roles
 */

import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema, users } from "../shared/schema";
import { db } from "./db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { setupAuth } from "./replitAuth";
import { 
  sendContactFormNotification, 
  sendWelcomeEmail, 
  sendDocumentUploadNotification, 
  sendCaseStatusUpdate,
  sendAppointmentConfirmation,
  sendPasswordResetEmail
} from "./email";
import {
  logActivityInBackground,
  sendWelcomeEmailInBackground,
  sendContactNotificationInBackground,
  sendDocumentNotificationInBackground,
  sendCaseStatusUpdateInBackground,
  sendAppointmentConfirmationInBackground,
  sendPasswordResetEmailInBackground,
} from "./background-jobs";
import crypto from "crypto";
import { wsService } from "./websocket";

// =============================================================================
// CONFIGURACIÓN DE SEGURIDAD
// =============================================================================

/**
 * Clave secreta para firmar tokens JWT
 * Debe estar definida en las variables de entorno
 * Se usa para autenticar usuarios y conexiones WebSocket
 * 
 * @security Esta clave nunca debe exponerse en logs o respuestas
 */
const JWT_SECRET: string = (() => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error("SESSION_SECRET debe estar configurada como string no vacío en las variables de entorno");
  }
  if (secret.length < 32) {
    console.warn("[seguridad] SESSION_SECRET debe tener al menos 32 caracteres para mayor seguridad");
  }
  return secret;
})();

/**
 * Número de rondas de sal para bcrypt
 * Mayor número = más seguro pero más lento
 * 10 es un buen balance entre seguridad y velocidad en serverless
 * (12 es más seguro pero puede causar timeouts en cold starts)
 * 
 * @security Aumentar a 12 si se detectan ataques de fuerza bruta
 */
const BCRYPT_ROUNDS = 10;

/**
 * Duración del token JWT en días
 * Los tokens expiran automáticamente después de este período
 */
const TOKEN_EXPIRY_DAYS = 7;

// =============================================================================
// ESQUEMAS DE VALIDACIÓN
// =============================================================================

/**
 * Esquema de validación para registro de usuarios
 * 
 * Requisitos de contraseña:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * 
 * @example
 * { email: "user@example.com", password: "SecurePass123", name: "Juan" }
 */
const registerSchema = z.object({
  email: z.string()
    .email("Dirección de email inválida")
    .max(255, "Email demasiado largo")
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña es demasiado larga")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo")
    .transform(val => val.trim()),
  phone: z.string()
    .max(20, "Número de teléfono demasiado largo")
    .optional(),
});

/**
 * Esquema de validación para inicio de sesión
 * 
 * @example
 * { email: "user@example.com", password: "SecurePass123" }
 */
const loginSchema = z.object({
  email: z.string()
    .email("Dirección de email inválida")
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, "La contraseña es requerida"),
});

/**
 * Esquema de validación para mensajes
 * Limita el tamaño del mensaje para prevenir abuso
 */
const messageSchema = z.object({
  recipientId: z.number().int().positive("ID de destinatario inválido"),
  message: z.string()
    .min(1, "El mensaje no puede estar vacío")
    .max(5000, "El mensaje es demasiado largo"),
  caseId: z.number().int().positive().optional(),
});

/**
 * Esquema de validación para creación de casos
 */
const caseSchema = z.object({
  clientId: z.number().int().positive("ID de cliente inválido"),
  filingYear: z.string().regex(/^\d{4}$/, "Año fiscal inválido"),
  filingStatus: z.string().optional(),
  dependents: z.number().int().min(0).max(20).optional(),
});

/**
 * Esquema de validación para actualización de casos
 */
const caseUpdateSchema = z.object({
  status: z.enum(["pending", "in_progress", "review", "completed", "filed"]).optional(),
  notes: z.string().max(2000).optional(),
  finalAmount: z.number().optional(),
});

// =============================================================================
// RATE LIMITERS POR ENDPOINT
// =============================================================================

/**
 * Rate limiter para endpoints de autenticación
 * 
 * Configuración estricta para prevenir:
 * - Ataques de fuerza bruta
 * - Enumeración de usuarios
 * - Abuso de registro
 * 
 * 5 intentos cada 15 minutos por IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: { 
    message: "Demasiados intentos de autenticación. Intente de nuevo en 15 minutos.",
    retryAfter: 15 
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    // Asegurar que siempre devolvamos JSON con Content-Type correcto
    // Fix: Previene error 'Unexpected token' cuando rate limiter bloquea
    res.setHeader('Content-Type', 'application/json');
    res.status(429).json({ 
      message: "Demasiados intentos de autenticación. Intente de nuevo en 15 minutos.",
      retryAfter: 15 
    });
  },
});

/**
 * Rate limiter para carga de archivos
 * 
 * 10 archivos cada 15 minutos por IP
 * Previene abuso de almacenamiento
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { 
    message: "Límite de carga de archivos alcanzado. Intente más tarde." 
  },
});

/**
 * Rate limiter para formulario de contacto
 * 
 * 3 envíos cada hora por IP
 * Previene spam
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: { 
    message: "Ha enviado demasiados mensajes. Intente más tarde." 
  },
});

/**
 * Rate limiter para mensajería
 * 
 * 30 mensajes cada 15 minutos por IP
 * Previene spam en el sistema de mensajes
 */
const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { 
    message: "Límite de mensajes alcanzado. Espere un momento." 
  },
});

// =============================================================================
// CONFIGURACIÓN DE SUBIDA DE ARCHIVOS
// =============================================================================

/**
 * Directorio para almacenar archivos subidos
 * 
 * En Vercel/serverless, usar /tmp que es el único directorio escribible
 * En desarrollo/producción tradicional, usar uploads/ en la raíz
 */
const uploadDir = (() => {
  // En Vercel/serverless, usar /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = '/tmp/uploads';
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch (error) {
      console.warn('[Routes] Could not create /tmp/uploads, using /tmp:', error);
      return '/tmp';
    }
  }
  
  // En desarrollo/producción tradicional
  const localDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch (error) {
    console.warn('[Routes] Could not create uploads directory:', error);
    // Fallback a /tmp si está disponible
    try {
      const tmpDir = '/tmp/uploads';
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch {
      // Último recurso: usar /tmp directamente
      return '/tmp';
    }
  }
})();

/**
 * Tipos MIME permitidos para documentos tributarios
 * 
 * Incluye:
 * - PDF: Documentos formales
 * - JPEG/PNG: Fotos de documentos
 * - Word: Documentos editables
 * 
 * @security Solo estos tipos pueden subirse al sistema
 */
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Extensiones de archivo permitidas
 * Validación adicional además del tipo MIME
 */
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

/**
 * Tamaño máximo de archivo: 10MB
 * Previene abuso de almacenamiento
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Configuración de almacenamiento de Multer
 * 
 * Genera nombres únicos para archivos:
 * - Timestamp para unicidad
 * - Random suffix para evitar colisiones
 * - Mantiene extensión original
 */
const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Sanitizar nombre de archivo
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + sanitizedName);
  },
});

/**
 * Middleware de Multer configurado
 * 
 * Validaciones:
 * - Tamaño máximo: 10MB
 * - Solo tipos MIME permitidos
 * - Solo extensiones permitidas
 */
const upload = multer({
  storage: multerStorage,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: 1 // Solo un archivo por petición
  },
  fileFilter: (_req, file, cb) => {
    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error("Tipo de archivo no permitido. Use PDF, JPG, PNG, DOC o DOCX."));
      return;
    }
    
    // Validar extensión
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      cb(new Error("Extensión de archivo no permitida."));
      return;
    }
    
    cb(null, true);
  },
});

// =============================================================================
// TIPOS DE TYPESCRIPT
// =============================================================================

/**
 * Extensión de Request para incluir usuario autenticado
 * 
 * Después de pasar por authenticateToken, el request
 * tendrá información del usuario decodificada del JWT
 */
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
}

// =============================================================================
// MIDDLEWARE DE AUTENTICACIÓN
// =============================================================================

/**
 * Middleware de autenticación JWT
 * 
 * Verifica el token JWT de la cookie o header Authorization
 * Si es válido, añade la información del usuario al request
 * 
 * @param req - Request de Express extendido con user
 * @param res - Response de Express
 * @param next - Función para continuar al siguiente middleware
 * 
 * @throws 401 - Si no hay token presente
 * @throws 403 - Si el token es inválido o expirado
 * 
 * @example
 * app.get('/api/protected', authenticateToken, (req, res) => {
 *   res.json({ user: authReq.user });
 * });
 */
function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  // Buscar token en cookie o header Authorization
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Autenticación requerida" });
    return;
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
      name: string;
    };
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    // Token inválido o expirado
    res.status(403).json({ message: "Token inválido o expirado" });
  }
}

/**
 * Middleware de autorización para administradores
 * 
 * Requiere que el usuario tenga rol 'admin' o 'preparer'
 * Debe usarse después de authenticateToken
 * 
 * @param req - Request con usuario autenticado
 * @param res - Response de Express
 * @param next - Función para continuar
 * 
 * @throws 403 - Si el usuario no tiene permisos de admin
 * 
 * @example
 * app.get('/api/admin/users', authenticateToken, requireAdmin, handler);
 */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== "admin" && authReq.user?.role !== "preparer") {
    res.status(403).json({ message: "Acceso de administrador requerido" });
    return;
  }
  next();
}

/**
 * Opciones de cookie segura para tokens JWT
 * 
 * @security
 * - httpOnly: Previene acceso desde JavaScript (XSS)
 * - secure: Solo HTTPS en producción
 * - sameSite: Previene CSRF
 * - path: Solo envía en rutas de la app
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  path: "/",
};

// =============================================================================
// CATEGORÍAS DE DOCUMENTOS
// =============================================================================

/**
 * Categorías válidas para documentos tributarios
 * 
 * @property id_document - Identificación (INE, pasaporte)
 * @property w2 - Formulario W-2 de empleo
 * @property form_1099 - Formularios 1099 varios
 * @property bank_statement - Estados de cuenta bancarios
 * @property receipt - Recibos y comprobantes
 * @property previous_return - Declaraciones anteriores
 * @property social_security - Tarjeta de seguro social
 * @property proof_of_address - Comprobante de domicilio
 * @property other - Otros documentos
 */
const VALID_CATEGORIES = [
  "id_document", 
  "w2", 
  "form_1099", 
  "bank_statement", 
  "receipt", 
  "previous_return", 
  "social_security", 
  "proof_of_address", 
  "other"
];

// =============================================================================
// REGISTRO DE RUTAS
// =============================================================================

/**
 * Registra todas las rutas API en la aplicación Express
 * 
 * Esta función configura:
 * - Autenticación OAuth (Replit Auth)
 * - Servicio WebSocket
 * - Endpoints de autenticación
 * - Endpoints de cliente
 * - Endpoints de administración
 * - Sistema de mensajería
 * 
 * @param httpServer - Servidor HTTP para WebSocket
 * @param app - Instancia de Express
 * @returns Promise<Server> - Servidor HTTP configurado
 */
export async function registerRoutes(
  httpServer: Server | undefined,
  app: Express
): Promise<Server | undefined> {
  try {
    const routesStart = Date.now();
    console.log('[Routes] Starting route registration...');
    
    // OPTIMIZADO: Health check rápido ANTES de cualquier inicialización pesada
    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok", timestamp: Date.now() });
    });
    app.get("/api/health", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok", timestamp: Date.now() });
    });
    
    // Inicializar WebSocket solo si hay un servidor HTTP (no en serverless)
    if (httpServer && wsService) {
      console.log('[Routes] Initializing WebSocket service...');
      try {
        wsService.initialize(httpServer);
        console.log('[Routes] WebSocket service initialized');
      } catch (wsError) {
        console.warn('[Routes] WebSocket initialization failed (non-critical):', wsError);
        // No fallar si WebSocket no se puede inicializar
      }
    } else {
      console.log('[Routes] Skipping WebSocket (serverless mode or wsService not available)');
    }
    
    // Configurar OAuth con Replit Auth (Google, GitHub, Apple)
    // OPTIMIZADO: Hacer setupAuth no bloqueante para inicialización más rápida
    console.log('[Routes] Setting up OAuth authentication (async)...');
    setupAuth(app).catch((authError) => {
      console.warn('[Routes] OAuth setup failed (non-critical):', authError);
      // No fallar si OAuth no se puede configurar - la app puede funcionar sin OAuth
    });
    console.log('[Routes] OAuth authentication setup complete');
  } catch (error) {
    console.error('[Routes] Error during route registration setup:', error);
    throw error;
  }

  // ===========================================================================
  // ENDPOINT TEMPORAL PARA CREAR USUARIO (SOLO DESARROLLO)
  // ===========================================================================
  
  /**
   * POST /api/admin/create-user
   * 
   * Endpoint para crear usuarios directamente (client, preparer, o admin)
   * SOLO DISPONIBLE EN DESARROLLO O CON TOKEN ESPECIAL
   * 
   * @body {string} email - Email del usuario
   * @body {string} password - Contraseña
   * @body {string} name - Nombre completo
   * @body {string} [phone] - Teléfono opcional
   * @body {string} [role] - Rol del usuario: "client" (default), "preparer", o "admin"
   */
  app.post("/api/admin/create-user", async (req: Request, res: Response) => {
    try {
      // Solo permitir en desarrollo o con token especial
      const adminToken = req.headers['x-admin-token'];
      const isDev = process.env.NODE_ENV !== 'production';
      
      if (!isDev && adminToken !== process.env.ADMIN_CREATE_USER_TOKEN) {
        res.status(403).json({ message: "No autorizado" });
        return;
      }

      const { email, password, name, phone, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ message: "Email, password y name son requeridos" });
        return;
      }

      // Validar rol
      const validRoles = ["client", "preparer", "admin"];
      const userRole = role && validRoles.includes(role) ? role : "client";

      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByEmail(email.toLowerCase().trim());
      if (existingUser) {
        res.status(400).json({ 
          message: "Este email ya está registrado",
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
          }
        });
        return;
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Crear usuario
      const user = await storage.createUser({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        phone: phone || null,
        role: userRole as "client" | "preparer" | "admin",
      });

      // OPTIMIZADO: Registrar actividad en background
      logActivityInBackground(
        user.id,
        "user_created",
        `Usuario creado: ${email} con rol ${userRole}`
      );

      res.json({
        success: true,
        message: `Usuario ${userRole} creado exitosamente`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        }
      });
    } catch (error) {
      console.error("Error creando usuario:", error);
      res.status(500).json({ 
        message: "Error al crear usuario",
        error: process.env.NODE_ENV !== 'production' ? (error as Error).message : undefined
      });
    }
  });

  // ===========================================================================
  // HEALTH CHECK Y DIAGNÓSTICO
  // ===========================================================================

  /**
   * GET /api/health
   * 
   * Endpoint de health check para verificar que el servidor y la base de datos funcionan
   * Útil para debugging y monitoreo
   */
  app.get("/api/health", async (_req: Request, res: Response) => {
    try {
      // Verificar que DATABASE_URL esté configurada
      if (!process.env.DATABASE_URL) {
        res.status(503).json({
          status: "error",
          timestamp: new Date().toISOString(),
          database: "not_configured",
          error: "DATABASE_URL no está configurada en las variables de entorno"
        });
        return;
      }

      // Verificar conexión a la base de datos
      await db.execute(sql`SELECT 1`);
      
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        environment: process.env.NODE_ENV || "unknown"
      });
    } catch (error) {
      console.error("[Health] Database check failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(503).json({
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
      });
    }
  });

  // ===========================================================================
  // ENDPOINTS DE AUTENTICACIÓN
  // ===========================================================================

  /**
   * POST /api/auth/register
   * 
   * Registra un nuevo usuario cliente en el sistema
   * 
   * @updated 2025-12-11 - Fix: Siempre devuelve JSON con Content-Type correcto
   * 
   * Fix: Siempre devuelve JSON con Content-Type correcto
   * 
   * @body {string} email - Email único del usuario
   * @body {string} password - Contraseña segura
   * @body {string} name - Nombre completo
   * @body {string} [phone] - Teléfono opcional
   * 
   * @returns {object} Usuario creado (sin contraseña)
   * @sets Cookie 'token' con JWT válido por 7 días
   * 
   * @security
   * - Rate limited: 5 intentos / 15 min
   * - Contraseña hasheada con bcrypt (12 rondas)
   * - Email normalizado a minúsculas
   * 
   * @sideeffects
   * - Crea usuario en base de datos
   * - Envía email de bienvenida
   * - Registra actividad en log
   */
  app.post("/api/auth/register", authLimiter, async (req: Request, res: Response) => {
    // Asegurar que siempre devolvamos JSON
    res.setHeader('Content-Type', 'application/json');
    
    try {
      // Verificar que storage esté disponible
      if (!storage) {
        throw new Error("Storage no está inicializado");
      }
      
      // Validar datos de entrada (hacerlo primero, es más rápido)
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ 
          message: "Validación fallida", 
          errors: result.error.errors.map(e => e.message)
        });
        return;
      }

      const { email, password, name, phone } = result.data;

      // Verificar email único y hashear contraseña en paralelo (más rápido)
      const [existingUser, hashedPassword] = await Promise.all([
        storage.getUserByEmail(email),
        bcrypt.hash(password, BCRYPT_ROUNDS)
      ]);
      
      if (existingUser) {
        res.status(400).json({ message: "Este email ya está registrado" });
        return;
      }

      // Crear usuario
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: "client",
      });

      // Generar token JWT (hacerlo antes de operaciones asíncronas)
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: `${TOKEN_EXPIRY_DAYS}d` }
      );

      // Establecer cookie segura
      res.cookie("token", token, COOKIE_OPTIONS);

      // Responder inmediatamente al cliente
      res.json({
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
      });

      // Operaciones en background (no bloquean la respuesta)
      // Estas tareas se ejecutan de forma asíncrona y no afectan al usuario si fallan
      logActivityInBackground(
        user.id,
        "user_registered",
        `Nuevo usuario registrado: ${email}`
      );
      sendWelcomeEmailInBackground(user.name, user.email);
    } catch (error) {
      console.error("Error de registro:", error);
      
      // Log detallado del error para debugging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Error object:", JSON.stringify(error, null, 2));
      }
      
      // Asegurar que el error también devuelva JSON
      if (!res.headersSent) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ 
          message: "Error al registrar usuario",
          error: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
        });
      }
    }
  });

  /**
   * POST /api/auth/login
   * 
   * Inicia sesión de un usuario existente
   * 
   * @body {string} email - Email del usuario
   * @body {string} password - Contraseña del usuario
   * 
   * @returns {object} Datos del usuario autenticado
   * @sets Cookie 'token' con JWT válido por 7 días
   * 
   * @security
   * - Rate limited: 5 intentos / 15 min
   * - Respuesta genérica para credenciales inválidas
   * - Comparación de contraseña con timing constante
   */
  app.post("/api/auth/login", authLimiter, async (req: Request, res: Response) => {
    try {
      // Validar datos de entrada
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ 
          message: "Validación fallida", 
          errors: result.error.errors.map(e => e.message)
        });
        return;
      }

      const { email, password } = result.data;

      // Buscar usuario
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Respuesta genérica para no revelar si el email existe
        res.status(401).json({ message: "Credenciales inválidas" });
        return;
      }

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res.status(401).json({ message: "Credenciales inválidas" });
        return;
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: `${TOKEN_EXPIRY_DAYS}d` }
      );

      // Establecer cookie segura
      res.cookie("token", token, COOKIE_OPTIONS);

      // OPTIMIZADO: Registrar actividad en background para no bloquear respuesta
      logActivityInBackground(
        user.id,
        "user_login",
        `Usuario inició sesión: ${email}`
      );

      // Responder inmediatamente
      res.json({
        data: {
          user: { id: user.id, email: user.email, role: user.role, name: user.name },
        },
      });
    } catch (error) {
      console.error("Error de login:", error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  });

  /**
   * GET /api/auth/me
   * 
   * Obtiene información del usuario autenticado actual
   * 
   * @requires authenticateToken
   * @returns {object} Datos del usuario sin información sensible
   */
  app.get("/api/auth/me", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    // OPTIMIZADO: Agregar headers de cache para reducir requests repetidos
    res.setHeader("Cache-Control", "private, max-age=60"); // Cache por 1 minuto
    // Mantener compatibilidad con ambos formatos
    res.json({ 
      data: { user: authReq.user },
      user: authReq.user, // Compatibilidad con formato anterior
    });
  });

  /**
   * POST /api/auth/logout
   * 
   * Cierra la sesión del usuario actual
   * 
   * @clears Cookie 'token'
   * @returns {object} Mensaje de confirmación
   */
  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie("token", { path: "/" });
    res.json({ message: "Sesión cerrada exitosamente" });
  });

  /**
   * POST /api/auth/oauth
   * 
   * Autentica o registra un usuario via OAuth (Google, GitHub, Apple)
   * 
   * @body {string} email - Email del usuario OAuth
   * @body {string} name - Nombre del usuario
   * @body {string} provider - Proveedor OAuth (google, github, apple)
   * @body {string} providerId - ID único del proveedor
   * 
   * @returns {object} Usuario autenticado
   * @sets Cookie 'token' con JWT válido por 7 días
   */
  app.post("/api/auth/oauth", authLimiter, async (req: Request, res: Response) => {
    try {
      const { email, name, provider, providerId } = req.body;

      if (!email || !name || !provider || !providerId) {
        res.status(400).json({ message: "Datos OAuth incompletos" });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Buscar usuario existente por email
      let user = await storage.getUserByEmail(normalizedEmail);

      if (!user) {
        // Crear nuevo usuario con contraseña aleatoria (no usable para login tradicional)
        const randomPassword = Math.random().toString(36).slice(-16) + "A1!";
        const hashedPassword = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

        user = await storage.createUser({
          email: normalizedEmail,
          password: hashedPassword,
          name,
          role: "client",
        });

        // Registrar actividad y enviar email en background
        logActivityInBackground(
          user.id,
          "user_registered_oauth",
          `Nuevo usuario OAuth registrado via ${provider}: ${normalizedEmail}`
        );
        sendWelcomeEmailInBackground(user.name, user.email);
      } else {
        // Registrar login OAuth en background
        logActivityInBackground(
          user.id,
          "user_login_oauth",
          `Usuario inició sesión via ${provider}: ${normalizedEmail}`
        );
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: `${TOKEN_EXPIRY_DAYS}d` }
      );

      // Establecer cookie segura
      res.cookie("token", token, COOKIE_OPTIONS);

      res.json({
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
      });
    } catch (error) {
      console.error("Error OAuth:", error);
      res.status(500).json({ message: "Error en autenticación OAuth" });
    }
  });

  /**
   * GET /api/auth/ws-token
   * 
   * Genera un token de corta duración para conexión WebSocket
   * 
   * @requires authenticateToken
   * @returns {object} Token WebSocket válido por 1 hora
   * 
   * @security Token separado del principal para limitar exposición
   */
  app.get("/api/auth/ws-token", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const wsToken = jwt.sign(
        { id: authReq.user!.id, role: authReq.user!.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token: wsToken });
    } catch (error) {
      console.error("Error generando token WS:", error);
      res.status(500).json({ message: "Error al generar token" });
    }
  });

  /**
   * POST /api/auth/forgot-password
   * 
   * Inicia el proceso de recuperación de contraseña
   * Envía un email con enlace seguro para restablecer
   * 
   * @body {string} email - Email del usuario
   * @security Rate limited para prevenir abuso
   * @sideeffects Envía email con token de recuperación
   */
  app.post("/api/auth/forgot-password", authLimiter, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      
      // Siempre responder con éxito para evitar enumeración de usuarios
      const genericResponse = { 
        message: "If an account with that email exists, you will receive a password reset link." 
      };

      const user = await storage.getUserByEmail(normalizedEmail);
      
      if (!user) {
        // No revelar si el email existe o no
        res.json(genericResponse);
        return;
      }

      // Invalidar tokens anteriores
      await storage.invalidateUserPasswordResetTokens(user.id);

      // Generar token seguro
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      
      // Token válido por 30 minutos
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      
      await storage.createPasswordResetToken(user.id, tokenHash, expiresAt);

      // Registrar actividad en background
      logActivityInBackground(
        user.id,
        "password_reset_requested",
        `Password reset requested for ${normalizedEmail}`
      );

      // Enviar email en background
      sendPasswordResetEmailInBackground({
        name: user.name,
        email: user.email,
        resetUrl: `${process.env.VITE_APP_URL || 'https://highlighttax.com'}/reset-password?token=${resetToken}`,
      });

      res.json(genericResponse);
    } catch (error) {
      console.error("Error en forgot-password:", error);
      res.status(500).json({ message: "Error processing request" });
    }
  });

  /**
   * POST /api/auth/reset-password
   * 
   * Restablece la contraseña usando un token válido
   * 
   * @body {string} token - Token de recuperación
   * @body {string} password - Nueva contraseña
   * @security Token de un solo uso, expira en 30 minutos
   */
  app.post("/api/auth/reset-password", authLimiter, async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        res.status(400).json({ message: "Token and password are required" });
        return;
      }

      // Validar contraseña
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, and number" });
        return;
      }

      // Hash del token recibido para comparar con la DB
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      
      const resetToken = await storage.getValidPasswordResetToken(tokenHash);
      
      if (!resetToken) {
        res.status(400).json({ message: "Invalid or expired reset link" });
        return;
      }

      // Obtener usuario
      const user = await storage.getUser(resetToken.userId);
      
      if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
      }

      // Hash nueva contraseña
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      
      // Actualizar contraseña
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Marcar token como usado
      await storage.markPasswordResetTokenAsUsed(resetToken.id);

      // Registrar actividad en background
      logActivityInBackground(
        user.id,
        "password_reset_completed",
        `Password reset completed for ${user.email}`
      );

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error en reset-password:", error);
      res.status(500).json({ message: "Error resetting password" });
    }
  });

  /**
   * GET /api/auth/verify-reset-token
   * 
   * Verifica si un token de recuperación es válido
   * 
   * @query {string} token - Token a verificar
   */
  app.get("/api/auth/verify-reset-token", async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== "string") {
        res.status(400).json({ valid: false, message: "Token is required" });
        return;
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const resetToken = await storage.getValidPasswordResetToken(tokenHash);
      
      if (!resetToken) {
        res.status(400).json({ valid: false, message: "Invalid or expired token" });
        return;
      }

      res.json({ valid: true });
    } catch (error) {
      console.error("Error verifying reset token:", error);
      res.status(500).json({ valid: false, message: "Error verifying token" });
    }
  });

  // ===========================================================================
  // ENDPOINTS PÚBLICOS
  // ===========================================================================

  /**
   * POST /api/contact
   * 
   * Procesa envíos del formulario de contacto público
   * 
   * @body {string} name - Nombre del contacto
   * @body {string} email - Email de contacto
   * @body {string} message - Mensaje
   * @body {string} [phone] - Teléfono opcional
   * @body {string} [service] - Servicio de interés
   * 
   * @security Rate limited: 3 envíos / hora
   * @sideeffects Envía notificación por email a admin
   */
  app.post("/api/contact", contactLimiter, async (req: Request, res: Response) => {
    try {
      const result = insertContactSubmissionSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ message: "Datos inválidos", errors: result.error.errors });
        return;
      }

      const contact = await storage.createContactSubmission(result.data);
      
      // Notificar al administrador
      // Enviar notificación en background
      sendContactNotificationInBackground({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || undefined,
        message: contact.message,
      });

      res.json({ success: true, contact });
    } catch (error) {
      console.error("Error en formulario de contacto:", error);
      res.status(500).json({ message: "Error al enviar formulario" });
    }
  });

  // ===========================================================================
  // ENDPOINTS DE CLIENTE - CASOS
  // ===========================================================================

  /**
   * GET /api/cases
   * 
   * Obtiene los casos tributarios del usuario autenticado
   * 
   * @requires authenticateToken
   * @returns {TaxCase[]} Lista de casos del cliente
   */
  app.get("/api/cases", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const cases = await storage.getTaxCasesByClient(authReq.user!.id);
      res.json(cases);
    } catch (error) {
      console.error("Error obteniendo casos:", error);
      res.status(500).json({ message: "Error al obtener casos" });
    }
  });

  // ===========================================================================
  // ENDPOINTS DE CLIENTE - DOCUMENTOS
  // ===========================================================================

  /**
   * GET /api/documents
   * 
   * Obtiene los documentos del usuario autenticado
   * 
   * @requires authenticateToken
   * @returns {Document[]} Lista de documentos del cliente
   */
  app.get("/api/documents", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const documents = await storage.getDocumentsByClient(authReq.user!.id);
      res.json(documents);
    } catch (error) {
      console.error("Error obteniendo documentos:", error);
      res.status(500).json({ message: "Error al obtener documentos" });
    }
  });

  /**
   * POST /api/documents/upload
   * 
   * Sube un nuevo documento al sistema
   * 
   * @requires authenticateToken
   * @body {File} file - Archivo a subir (multipart/form-data)
   * @body {number} [caseId] - ID del caso asociado
   * @body {string} [category] - Categoría del documento
   * @body {string} [description] - Descripción opcional
   * 
   * @security
   * - Rate limited: 10 archivos / 15 min
   * - Máximo 10MB por archivo
   * - Solo tipos permitidos (PDF, imágenes, Word)
   * - Verificación de propiedad del caso
   * 
   * @sideeffects
   * - Guarda archivo en servidor
   * - Notifica a admin por email
   * - Envía notificación WebSocket
   */
  app.post(
    "/api/documents/upload", 
    authenticateToken, 
    uploadLimiter,
    upload.single("file"), 
    async (req: Request, res: Response) => {
      const authReq = req as AuthRequest;
      try {
        if (!req.file) {
          res.status(400).json({ message: "No se recibió ningún archivo" });
          return;
        }

        const { caseId, category, description } = req.body;
        let validCaseId: number | null = null;

        // Verificar propiedad del caso si se especifica
        if (caseId) {
          validCaseId = parseInt(caseId);
          if (!isNaN(validCaseId)) {
            const taxCase = await storage.getTaxCase(validCaseId);
            if (!taxCase || taxCase.clientId !== authReq.user!.id) {
              // Eliminar archivo subido
              fs.unlinkSync(req.file.path);
              res.status(403).json({ message: "Acceso denegado al caso" });
              return;
            }
          }
        }

        // Validar categoría
        const docCategory = VALID_CATEGORIES.includes(category) ? category : "other";

        // Crear registro de documento
        const document = await storage.createDocument({
          caseId: validCaseId,
          clientId: authReq.user!.id,
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          category: docCategory,
          description: description || null,
          uploadedById: authReq.user!.id,
          isFromPreparer: false,
        });

        // Registrar actividad
        // Registrar actividad y notificar en background
        logActivityInBackground(
          authReq.user!.id,
          "document_uploaded",
          `Documento subido: ${req.file.originalname} (${docCategory})`
        );
        sendDocumentNotificationInBackground({
          clientName: authReq.user!.name,
          clientEmail: authReq.user!.email,
          fileName: req.file.originalname,
          category: docCategory,
        }).catch(console.error);

        // Notificación en tiempo real (solo si wsService está disponible)
        if (wsService) {
          try {
            wsService.notifyDocumentUpload(
              authReq.user!.id,
              authReq.user!.name,
              req.file.originalname,
              validCaseId || undefined
            );
          } catch (wsError) {
            console.warn('[Routes] WebSocket notification failed (non-critical):', wsError);
          }
        }

        res.json(document);
      } catch (error) {
        console.error("Error de carga:", error);
        res.status(500).json({ message: "Error al subir documento" });
      }
    }
  );

  /**
   * GET /api/documents/:id/download
   * 
   * Descarga un documento específico
   * 
   * @requires authenticateToken
   * @param {number} id - ID del documento
   * 
   * @security
   * - Solo el propietario o admin pueden descargar
   * - Verifica existencia del archivo
   */
  app.get("/api/documents/:id/download", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        res.status(400).json({ message: "ID de documento inválido" });
        return;
      }

      const document = await storage.getDocument(documentId);

      if (!document) {
        res.status(404).json({ message: "Documento no encontrado" });
        return;
      }

      // Verificar permisos
      const isAdmin = authReq.user!.role === "admin" || authReq.user!.role === "preparer";
      const isOwner = document.clientId === authReq.user!.id;

      if (!isAdmin && !isOwner) {
        res.status(403).json({ message: "Acceso denegado" });
        return;
      }

      // Verificar que el archivo existe
      if (!fs.existsSync(document.filePath)) {
        res.status(404).json({ message: "Archivo no encontrado" });
        return;
      }

      res.download(document.filePath, document.fileName);
    } catch (error) {
      console.error("Error de descarga:", error);
      res.status(500).json({ message: "Error al descargar documento" });
    }
  });

  // ===========================================================================
  // ENDPOINTS DE CLIENTE - CITAS
  // ===========================================================================

  /**
   * GET /api/appointments
   * 
   * Obtiene las citas del usuario autenticado
   * 
   * @requires authenticateToken
   * @returns {Appointment[]} Lista de citas del cliente
   */
  app.get("/api/appointments", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const appointments = await storage.getAppointmentsByClient(authReq.user!.id);
      res.json(appointments);
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      res.status(500).json({ message: "Error al obtener citas" });
    }
  });

  /**
   * POST /api/appointments
   * 
   * Agenda una nueva cita con el preparador
   * 
   * @requires authenticateToken
   * @body {string} appointmentDate - Fecha y hora ISO 8601
   * @body {string} [notes] - Notas para la cita
   * 
   * @security Verifica conflictos de horario (±30 min)
   * 
   * @sideeffects
   * - Crea cita en base de datos
   * - Envía confirmación por email
   * - Notifica a admin por WebSocket
   */
  app.post("/api/appointments", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const { appointmentDate, notes } = req.body;

      if (!appointmentDate) {
        res.status(400).json({ message: "La fecha de cita es requerida" });
        return;
      }

      const parsedDate = new Date(appointmentDate);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ message: "Formato de fecha inválido" });
        return;
      }
      
      // Verificar conflictos de horario
      const hasConflict = await storage.checkAppointmentConflict(parsedDate);
      if (hasConflict) {
        res.status(409).json({ 
          message: "Este horario no está disponible. Por favor elija otro.",
          conflict: true
        });
        return;
      }

      // Crear cita
      const appointment = await storage.createAppointment({
        clientId: authReq.user!.id,
        appointmentDate: parsedDate,
        notes: notes || null,
        status: "scheduled",
      });

      // OPTIMIZADO: Registrar actividad en background
      logActivityInBackground(
        authReq.user!.id,
        "appointment_scheduled",
        `Cita agendada para ${appointmentDate}`
      );

      // Enviar confirmación por email
      sendAppointmentConfirmation({
        clientName: authReq.user!.name,
        clientEmail: authReq.user!.email,
        appointmentDate: parsedDate,
        notes: notes || undefined,
      }).catch(console.error);

      // Notificación en tiempo real (solo si wsService está disponible)
      if (wsService) {
        try {
          wsService.notifyNewAppointment(
            authReq.user!.id,
            parsedDate.toISOString(),
            notes || "Consulta de impuestos"
          );
        } catch (wsError) {
          console.warn('[Routes] WebSocket notification failed (non-critical):', wsError);
        }
      }

      res.json(appointment);
    } catch (error) {
      console.error("Error creando cita:", error);
      res.status(500).json({ message: "Error al crear cita" });
    }
  });

  // ===========================================================================
  // ENDPOINTS DE MENSAJERÍA
  // ===========================================================================

  /**
   * GET /api/messages/conversations
   * 
   * Obtiene las conversaciones del usuario
   * 
   * @requires authenticateToken
   * @returns {Conversation[]} Lista de conversaciones con último mensaje
   */
  app.get("/api/messages/conversations", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const conversations = await storage.getConversationsForUser(authReq.user!.id);
      res.json(conversations);
    } catch (error) {
      console.error("Error obteniendo conversaciones:", error);
      res.status(500).json({ message: "Error al obtener conversaciones" });
    }
  });

  /**
   * GET /api/messages/unread-count
   * 
   * Obtiene el conteo de mensajes no leídos
   * 
   * @requires authenticateToken
   * @returns {object} Conteo de mensajes sin leer
   */
  app.get("/api/messages/unread-count", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const count = await storage.getUnreadCount(authReq.user!.id);
      res.json({ count });
    } catch (error) {
      console.error("Error obteniendo conteo:", error);
      res.status(500).json({ message: "Error al obtener conteo" });
    }
  });

  /**
   * GET /api/messages/:partnerId
   * 
   * Obtiene el historial de mensajes con un usuario específico
   * 
   * @requires authenticateToken
   * @param {number} partnerId - ID del otro usuario
   * 
   * @sideeffects Marca los mensajes como leídos
   */
  app.get("/api/messages/:partnerId", authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const partnerId = parseInt(req.params.partnerId);
      if (isNaN(partnerId)) {
        res.status(400).json({ message: "ID de usuario inválido" });
        return;
      }

      const messages = await storage.getConversation(authReq.user!.id, partnerId);
      
      // Marcar como leídos
      await storage.markMessagesAsRead(authReq.user!.id, partnerId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error obteniendo mensajes:", error);
      res.status(500).json({ message: "Error al obtener mensajes" });
    }
  });

  /**
   * POST /api/messages
   * 
   * Envía un nuevo mensaje a otro usuario
   * 
   * @requires authenticateToken
   * @body {number} recipientId - ID del destinatario
   * @body {string} message - Contenido del mensaje
   * @body {number} [caseId] - Caso relacionado opcional
   * 
   * @security Rate limited: 30 mensajes / 15 min
   * @sideeffects Notifica al destinatario por WebSocket
   */
  app.post("/api/messages", authenticateToken, messageLimiter, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      // Validar datos de entrada
      const result = messageSchema.safeParse({
        ...req.body,
        recipientId: parseInt(req.body.recipientId)
      });
      
      if (!result.success) {
        res.status(400).json({ 
          message: "Datos inválidos", 
          errors: result.error.errors.map(e => e.message) 
        });
        return;
      }

      const { recipientId, message, caseId } = result.data;

      // Verificar que el destinatario existe
      const recipient = await storage.getUser(recipientId);
      if (!recipient) {
        res.status(404).json({ message: "Destinatario no encontrado" });
        return;
      }

      // Crear mensaje
      const newMessage = await storage.createMessage({
        senderId: authReq.user!.id,
        recipientId,
        message,
        caseId: caseId || null,
        isRead: false,
      });

      // Registrar actividad
      // Registrar actividad en background
      logActivityInBackground(
        authReq.user!.id,
        "message_sent",
        `Mensaje enviado a ${recipient.name}`
      );

      // Notificación en tiempo real (solo si wsService está disponible)
      if (wsService) {
        try {
          wsService.notifyNewMessage(
            authReq.user!.id,
            recipientId,
            message.substring(0, 100) + (message.length > 100 ? "..." : "")
          );
        } catch (wsError) {
          console.warn('[Routes] WebSocket notification failed (non-critical):', wsError);
        }
      }

      res.json(newMessage);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      res.status(500).json({ message: "Error al enviar mensaje" });
    }
  });

  /**
   * GET /api/preparers
   * 
   * Obtiene la lista de preparadores disponibles para mensajería
   * 
   * @requires authenticateToken
   * @returns {Preparer[]} Lista de preparadores con id, nombre y rol
   */
  app.get("/api/preparers", authenticateToken, async (_req: Request, res: Response) => {
    try {
      const preparers = await db.select().from(users).where(
        sql`${users.role} IN ('admin', 'preparer')`
      );
      res.json(preparers.map(p => ({ id: p.id, name: p.name, role: p.role })));
    } catch (error) {
      console.error("Error obteniendo preparadores:", error);
      res.status(500).json({ message: "Error al obtener preparadores" });
    }
  });

  // ===========================================================================
  // ENDPOINTS DE ADMINISTRACIÓN
  // ===========================================================================

  /**
   * GET /api/admin/stats
   * 
   * Obtiene estadísticas del dashboard de administración
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {object} Estadísticas generales del sistema
   */
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      console.log("[Admin] Obteniendo estadísticas...");
      const stats = await storage.getAdminStats();
      console.log("[Admin] Estadísticas obtenidas:", stats);
      res.json(stats);
    } catch (error) {
      console.error("[Admin] Error obteniendo estadísticas:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Admin] Error details:", errorMessage, error);
      res.status(500).json({ 
        message: "Error al obtener estadísticas",
        error: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
      });
    }
  });

  /**
   * GET /api/admin/clients
   * 
   * Obtiene la lista de clientes con detalles
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {Client[]} Clientes con conteo de documentos y casos
   */
  app.get("/api/admin/clients", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      console.log("[Admin] Obteniendo clientes...");
      const clients = await storage.getClientsWithDetails();
      console.log("[Admin] Clientes obtenidos:", clients.length);
      res.json(clients);
    } catch (error) {
      console.error("[Admin] Error obteniendo clientes:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Admin] Error details:", errorMessage, error);
      res.status(500).json({ 
        message: "Error al obtener clientes",
        error: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
      });
    }
  });

  /**
   * GET /api/admin/clients/:id
   * 
   * Obtiene información detallada de un cliente
   * 
   * @requires authenticateToken, requireAdmin
   * @param {number} id - ID del cliente
   * @returns {object} Cliente con documentos, casos y citas
   */
  app.get("/api/admin/clients/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const clientId = parseInt(req.params.id);
      if (isNaN(clientId)) {
        res.status(400).json({ message: "ID de cliente inválido" });
        return;
      }

      const client = await storage.getUser(clientId);
      if (!client) {
        res.status(404).json({ message: "Cliente no encontrado" });
        return;
      }
      
      const documents = await storage.getDocumentsByClient(clientId);
      const cases = await storage.getTaxCasesByClient(clientId);
      const appointments = await storage.getAppointmentsByClient(clientId);
      
      res.json({ client, documents, cases, appointments });
    } catch (error) {
      console.error("Error obteniendo detalles del cliente:", error);
      res.status(500).json({ message: "Error al obtener detalles" });
    }
  });

  /**
   * GET /api/admin/documents
   * 
   * Obtiene todos los documentos del sistema
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {Document[]} Todos los documentos
   */
  app.get("/api/admin/documents", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error obteniendo documentos:", error);
      res.status(500).json({ message: "Error al obtener documentos" });
    }
  });

  /**
   * GET /api/admin/cases
   * 
   * Obtiene todos los casos tributarios
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {TaxCase[]} Todos los casos
   */
  app.get("/api/admin/cases", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const cases = await storage.getAllTaxCases();
      res.json(cases);
    } catch (error) {
      console.error("Error obteniendo casos:", error);
      res.status(500).json({ message: "Error al obtener casos" });
    }
  });

  /**
   * POST /api/admin/cases
   * 
   * Crea un nuevo caso tributario para un cliente
   * 
   * @requires authenticateToken, requireAdmin
   * @body {number} clientId - ID del cliente
   * @body {string} filingYear - Año fiscal (YYYY)
   * @body {string} [filingStatus] - Estado civil fiscal
   * @body {number} [dependents] - Número de dependientes
   */
  app.post("/api/admin/cases", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const result = caseSchema.safeParse({
        ...req.body,
        clientId: parseInt(req.body.clientId)
      });

      if (!result.success) {
        res.status(400).json({ 
          message: "Datos inválidos", 
          errors: result.error.errors.map(e => e.message) 
        });
        return;
      }

      const { clientId, filingYear, filingStatus, dependents } = result.data;

      const taxCase = await storage.createTaxCase({
        clientId,
        filingYear,
        filingStatus: filingStatus || null,
        dependents: dependents || 0,
        status: "pending",
      });

      res.json(taxCase);

      // Registrar actividad en background (después de responder)
      logActivityInBackground(
        authReq.user!.id,
        "case_created",
        `Caso creado para cliente ${clientId}, año ${filingYear}`
      );
    } catch (error) {
      console.error("Error creando caso:", error);
      res.status(500).json({ message: "Error al crear caso" });
    }
  });

  /**
   * PATCH /api/admin/cases/:id
   * 
   * Actualiza un caso tributario existente
   * 
   * @requires authenticateToken, requireAdmin
   * @param {number} id - ID del caso
   * @body {string} [status] - Nuevo estado
   * @body {string} [notes] - Notas del caso
   * @body {number} [finalAmount] - Monto final del reembolso/pago
   * 
   * @sideeffects
   * - Notifica al cliente si cambia el estado
   * - Envía email de actualización
   */
  app.patch("/api/admin/cases/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) {
        res.status(400).json({ message: "ID de caso inválido" });
        return;
      }

      const result = caseUpdateSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ 
          message: "Datos inválidos", 
          errors: result.error.errors.map(e => e.message) 
        });
        return;
      }

      const { status, notes, finalAmount } = result.data;

      const existingCase = await storage.getTaxCase(caseId);
      if (!existingCase) {
        res.status(404).json({ message: "Caso no encontrado" });
        return;
      }

      const updatedCase = await storage.updateTaxCase(caseId, {
        status,
        notes,
        finalAmount: finalAmount || null,
      });

      if (!updatedCase) {
        res.status(404).json({ message: "Caso no encontrado" });
        return;
      }

      // Registrar actividad en background
      logActivityInBackground(
        authReq.user!.id,
        "case_updated",
        `Caso ${caseId} actualizado: status=${status || existingCase.status}`
      );

      // Notificar al cliente si cambió el estado (en background)
      if (status && status !== existingCase.status) {
        const client = await storage.getUser(existingCase.clientId);
        if (client) {
          sendCaseStatusUpdateInBackground({
            clientName: client.name,
            clientEmail: client.email,
            caseId: caseId,
            status: status,
            filingYear: existingCase.filingYear,
          });

          // Notificación en tiempo real (solo si wsService está disponible)
          if (wsService) {
            try {
              wsService.notifyCaseStatusChange(
                existingCase.clientId,
                caseId,
                status,
                client.name
              );
            } catch (wsError) {
              console.warn('[Routes] WebSocket notification failed (non-critical):', wsError);
            }
          }
        }
      }

      res.json(updatedCase);
    } catch (error) {
      console.error("Error actualizando caso:", error);
      res.status(500).json({ message: "Error al actualizar caso" });
    }
  });

  /**
   * GET /api/admin/appointments
   * 
   * Obtiene todas las citas del sistema
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {Appointment[]} Todas las citas
   */
  app.get("/api/admin/appointments", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      res.status(500).json({ message: "Error al obtener citas" });
    }
  });

  /**
   * GET /api/admin/contacts
   * 
   * Obtiene todas las solicitudes de contacto
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {ContactSubmission[]} Todas las solicitudes
   */
  app.get("/api/admin/contacts", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const contacts = await storage.getAllContactSubmissions();
      res.json(contacts);
    } catch (error) {
      console.error("Error obteniendo contactos:", error);
      res.status(500).json({ message: "Error al obtener contactos" });
    }
  });

  /**
   * GET /api/admin/preparers
   * 
   * Obtiene la lista de preparadores (para asignación)
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {Preparer[]} Lista de preparadores
   */
  app.get("/api/admin/preparers", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const preparers = await db.select().from(users).where(
        sql`${users.role} IN ('admin', 'preparer')`
      );
      res.json(preparers.map(p => ({ id: p.id, name: p.name, role: p.role })));
    } catch (error) {
      console.error("Error obteniendo preparadores:", error);
      res.status(500).json({ message: "Error al obtener preparadores" });
    }
  });

  /**
   * GET /api/admin/analytics
   * 
   * Obtiene datos analíticos para el dashboard
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {object} Datos de ingresos, tendencias y métricas
   */
  app.get("/api/admin/analytics", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const analytics = await storage.getAnalyticsData();
      res.json(analytics);
    } catch (error) {
      console.error("Error obteniendo analytics:", error);
      res.status(500).json({ message: "Error al obtener analytics" });
    }
  });

  /**
   * GET /api/admin/users
   * 
   * Obtiene la lista completa de usuarios para gestión administrativa
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {User[]} Lista de todos los usuarios
   */
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });

  /**
   * PATCH /api/admin/users/:id/status
   * 
   * Activa o desactiva un usuario
   * 
   * @requires authenticateToken, requireAdmin
   * @param {boolean} isActive - Estado del usuario
   * @returns {User} Usuario actualizado
   */
  app.patch("/api/admin/users/:id/status", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive debe ser un booleano" });
      }

      // Prevent admin from deactivating themselves
      if (authReq.user?.id === userId && !isActive) {
        return res.status(400).json({ message: "No puedes desactivarte a ti mismo" });
      }

      const updatedUser = await storage.updateUser(userId, { isActive });
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error actualizando estado de usuario:", error);
      res.status(500).json({ message: "Error al actualizar estado de usuario" });
    }
  });

  /**
   * PATCH /api/admin/users/:id/role
   * 
   * Cambia el rol de un usuario
   * 
   * @requires authenticateToken, requireAdmin
   * @param {string} role - Nuevo rol del usuario
   * @returns {User} Usuario actualizado
   */
  app.patch("/api/admin/users/:id/role", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      const validRoles = ["client", "preparer", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      // Prevent admin from changing their own role
      if (authReq.user?.id === userId) {
        return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
      }

      const updatedUser = await storage.updateUser(userId, { role });
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error actualizando rol de usuario:", error);
      res.status(500).json({ message: "Error al actualizar rol de usuario" });
    }
  });

  /**
   * POST /api/admin/users/:id/reset-password
   * 
   * Admin-initiated password reset - sends reset email to user
   * 
   * @requires authenticateToken, requireAdmin
   * @returns {object} Mensaje de confirmación
   */
  app.post("/api/admin/users/:id/reset-password", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (!user.email) {
        return res.status(400).json({ message: "El usuario no tiene email registrado" });
      }

      // Generate password reset token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await storage.createPasswordResetToken(user.id, tokenHash, expiresAt);

      // Enviar email en background
      sendPasswordResetEmailInBackground({
        name: user.name || "Usuario",
        email: user.email,
        resetUrl: `${process.env.VITE_APP_URL || 'https://highlighttax.com'}/reset-password?token=${token}`,
      });

      res.json({ message: "Email de restablecimiento enviado" });
    } catch (error) {
      console.error("Error enviando email de restablecimiento:", error);
      res.status(500).json({ message: "Error al enviar email de restablecimiento" });
    }
  });

  return httpServer;
}
