/**
 * @fileoverview Esquema de Base de Datos de Highlight Tax Services
 * 
 * Este archivo define la estructura completa de la base de datos
 * usando Drizzle ORM con PostgreSQL. Incluye todas las tablas,
 * relaciones, enums, y tipos TypeScript.
 * 
 * @module shared/schema
 * @version 1.0.0
 * 
 * ## Entidades Principales
 * - **users**: Usuarios del sistema (clientes, preparadores, admins)
 * - **taxCases**: Casos de declaración de impuestos por año
 * - **documents**: Documentos tributarios subidos
 * - **appointments**: Citas programadas con preparadores
 * - **messages**: Sistema de mensajería entre usuarios
 * - **contactSubmissions**: Formularios de contacto del sitio público
 * - **activityLogs**: Registro de auditoría del sistema
 * - **authIdentities**: Identidades OAuth vinculadas
 * - **sessions**: Sesiones para OAuth
 * 
 * ## Convenciones de Nombres
 * - Tablas: snake_case plural (users, tax_cases)
 * - Columnas: snake_case (client_id, created_at)
 * - Enums: descriptivos con prefijo de dominio
 * 
 * @example
 * import { users, taxCases, type User, type TaxCase } from '@shared/schema';
 * 
 * // Obtener todos los clientes
 * const clients = await db.select().from(users).where(eq(users.role, 'client'));
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, pgEnum, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =============================================================================
// ENUMERACIONES
// =============================================================================

/**
 * Roles de usuario en el sistema
 * 
 * @property admin - Acceso completo al sistema
 * @property preparer - Preparador de impuestos, puede ver todos los clientes
 * @property client - Cliente final, solo accede a sus propios datos
 */
export const userRoleEnum = pgEnum("user_role", ["admin", "preparer", "client"]);

/**
 * Estados posibles de un caso tributario
 * 
 * @property pending - Recién creado, esperando documentos
 * @property in_process - En proceso de preparación
 * @property sent_to_irs - Enviado al IRS
 * @property approved - Aprobado por el IRS
 * @property refund_issued - Reembolso emitido
 */
export const caseStatusEnum = pgEnum("case_status", ["pending", "in_process", "sent_to_irs", "approved", "refund_issued"]);

/**
 * Estados de una cita
 * 
 * @property scheduled - Cita agendada
 * @property completed - Cita completada
 * @property cancelled - Cita cancelada
 */
export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "completed", "cancelled"]);

/**
 * Estados civiles para declaración de impuestos (IRS filing status)
 * 
 * @property single - Soltero/a
 * @property married_filing_jointly - Casado declarando en conjunto
 * @property married_filing_separately - Casado declarando por separado
 * @property head_of_household - Jefe de hogar
 * @property qualifying_widow - Viudo/a calificado
 */
export const filingStatusEnum = pgEnum("filing_status", [
  "single", 
  "married_filing_jointly", 
  "married_filing_separately", 
  "head_of_household", 
  "qualifying_widow"
]);

/**
 * Proveedores de autenticación OAuth soportados
 * 
 * @property local - Registro con email/contraseña
 * @property google - Login con Google
 * @property github - Login con GitHub
 * @property apple - Login con Apple
 * @property replit - Login con Replit
 */
export const authProviderEnum = pgEnum("auth_provider", ["local", "google", "github", "apple", "replit"]);

/**
 * Categorías de documentos tributarios
 * 
 * @property id_document - Documento de identificación (INE, pasaporte)
 * @property w2 - Formulario W-2 de empleo
 * @property form_1099 - Formularios 1099 varios
 * @property bank_statement - Estados de cuenta bancarios
 * @property receipt - Recibos y comprobantes
 * @property previous_return - Declaraciones de impuestos anteriores
 * @property social_security - Tarjeta de seguro social
 * @property proof_of_address - Comprobante de domicilio
 * @property other - Otros documentos
 */
export const documentCategoryEnum = pgEnum("document_category", [
  "id_document",
  "w2",
  "form_1099",
  "bank_statement",
  "receipt",
  "previous_return",
  "social_security",
  "proof_of_address",
  "other"
]);

// =============================================================================
// TABLA DE SESIONES (OAuth)
// =============================================================================

/**
 * Tabla de sesiones para almacenamiento de sesiones OAuth
 * 
 * Usada por express-session con connect-pg-simple
 * para mantener sesiones de usuarios autenticados via OAuth.
 * 
 * @property sid - ID único de la sesión
 * @property sess - Datos de la sesión en formato JSON
 * @property expire - Fecha de expiración de la sesión
 */
export const sessions = pgTable(
  "sessions",
  {
    /** ID único de la sesión (clave primaria) */
    sid: varchar("sid").primaryKey(),
    /** Datos de la sesión serializados como JSON */
    sess: jsonb("sess").notNull(),
    /** Timestamp de expiración de la sesión */
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// =============================================================================
// TABLA DE USUARIOS
// =============================================================================

/**
 * Tabla principal de usuarios del sistema
 * 
 * Almacena información de todos los usuarios:
 * - Administradores
 * - Preparadores de impuestos
 * - Clientes
 * 
 * @property id - ID único generado automáticamente
 * @property email - Email único (usado para login)
 * @property password - Contraseña hasheada con bcrypt
 * @property role - Rol del usuario (admin, preparer, client)
 * @property name - Nombre completo
 * @property phone - Teléfono de contacto (opcional)
 * @property address - Dirección completa (opcional)
 * @property city - Ciudad (opcional)
 * @property state - Estado (opcional)
 * @property zipCode - Código postal (opcional)
 * @property ssn - Número de seguro social (sensible)
 * @property dateOfBirth - Fecha de nacimiento (opcional)
 * @property profileImageUrl - URL de imagen de perfil (opcional)
 * @property createdAt - Fecha de creación
 * @property updatedAt - Fecha de última actualización
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  /** @security Campo sensible - SSN almacenado con consideraciones especiales */
  ssn: varchar("ssn", { length: 20 }),
  dateOfBirth: timestamp("date_of_birth"),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

// =============================================================================
// TABLA DE TOKENS DE RECUPERACIÓN DE CONTRASEÑA
// =============================================================================

/**
 * Tabla de tokens para recuperación de contraseña
 * 
 * Almacena tokens seguros de un solo uso para permitir
 * a los usuarios restablecer su contraseña via email.
 * 
 * @property id - ID único del token
 * @property userId - Usuario asociado al token
 * @property tokenHash - Hash del token (nunca almacenar en texto plano)
 * @property expiresAt - Fecha de expiración (30 minutos desde creación)
 * @property usedAt - Fecha de uso (null si no ha sido usado)
 * @property createdAt - Fecha de creación
 */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// TABLA DE IDENTIDADES OAUTH
// =============================================================================

/**
 * Tabla de identidades de autenticación OAuth
 * 
 * Vincula cuentas de proveedores OAuth (Google, GitHub, Apple)
 * con usuarios locales del sistema. Un usuario puede tener
 * múltiples identidades vinculadas.
 * 
 * @property id - ID único de la identidad
 * @property userId - Referencia al usuario local
 * @property provider - Proveedor OAuth (google, github, apple, replit)
 * @property providerUserId - ID del usuario en el proveedor
 * @property email - Email en el proveedor (puede diferir del local)
 * @property firstName - Nombre del perfil OAuth
 * @property lastName - Apellido del perfil OAuth
 * @property avatarUrl - URL del avatar del proveedor
 * @property createdAt - Fecha de vinculación
 */
export const authIdentities = pgTable("auth_identities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** @FK users.id - Cascade delete al eliminar usuario */
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: authProviderEnum("provider").notNull(),
  providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// TABLA DE CASOS TRIBUTARIOS
// =============================================================================

/**
 * Tabla de casos de declaración de impuestos
 * 
 * Cada caso representa una declaración de impuestos para un
 * año fiscal específico de un cliente.
 * 
 * @property id - ID único del caso
 * @property clientId - Referencia al cliente (usuario)
 * @property filingYear - Año fiscal de la declaración (ej: 2024)
 * @property filingStatus - Estado civil para declaración
 * @property dependents - Número de dependientes
 * @property status - Estado actual del caso
 * @property finalAmount - Monto final del reembolso/pago
 * @property notes - Notas del preparador
 * @property createdAt - Fecha de creación
 * @property updatedAt - Fecha de última actualización
 */
export const taxCases = pgTable("tax_cases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** @FK users.id - Cliente dueño del caso */
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filingYear: integer("filing_year").notNull(),
  filingStatus: filingStatusEnum("filing_status"),
  dependents: integer("dependents").default(0),
  status: caseStatusEnum("status").notNull().default("pending"),
  /** Monto en USD con 2 decimales (positivo = reembolso, negativo = pago) */
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================================================
// TABLA DE DOCUMENTOS
// =============================================================================

/**
 * Tabla de documentos tributarios
 * 
 * Almacena metadatos de documentos subidos por clientes
 * o preparadores para casos tributarios.
 * 
 * @property id - ID único del documento
 * @property caseId - Caso asociado (opcional, puede subirse sin caso)
 * @property clientId - Cliente dueño del documento
 * @property fileName - Nombre original del archivo
 * @property filePath - Ruta en el servidor
 * @property fileType - Tipo MIME del archivo
 * @property fileSize - Tamaño en bytes
 * @property category - Categoría del documento
 * @property description - Descripción opcional
 * @property uploadedById - Usuario que subió el documento
 * @property isFromPreparer - Si fue subido por preparador
 * @property createdAt - Fecha de subida
 */
export const documents = pgTable("documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** @FK taxCases.id - Caso asociado (nullable) */
  caseId: integer("case_id").references(() => taxCases.id, { onDelete: "cascade" }),
  /** @FK users.id - Cliente dueño */
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  /** @security Ruta almacenada fuera de la raíz web */
  filePath: text("file_path").notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size"),
  category: documentCategoryEnum("category").notNull().default("other"),
  description: text("description"),
  /** @FK users.id - Usuario que subió */
  uploadedById: integer("uploaded_by_id").notNull().references(() => users.id),
  isFromPreparer: boolean("is_from_preparer").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// TABLA DE CITAS
// =============================================================================

/**
 * Tabla de citas programadas
 * 
 * Registra citas de clientes con preparadores de impuestos.
 * Se valida que no haya conflictos de horario (±30 min).
 * 
 * @property id - ID único de la cita
 * @property clientId - Cliente que agenda la cita
 * @property appointmentDate - Fecha y hora de la cita
 * @property status - Estado de la cita
 * @property notes - Notas o descripción de la cita
 * @property createdAt - Fecha de creación
 */
export const appointments = pgTable("appointments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** @FK users.id - Cliente que agenda */
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// TABLA DE MENSAJES
// =============================================================================

/**
 * Tabla de mensajes del sistema de mensajería
 * 
 * Almacena mensajes entre usuarios (cliente-preparador).
 * Puede estar asociado opcionalmente a un caso específico.
 * 
 * @property id - ID único del mensaje
 * @property caseId - Caso asociado (opcional)
 * @property senderId - Usuario que envía el mensaje
 * @property recipientId - Usuario que recibe el mensaje
 * @property message - Contenido del mensaje
 * @property isRead - Si el mensaje ha sido leído
 * @property createdAt - Fecha de envío
 */
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** @FK taxCases.id - Caso relacionado (nullable) */
  caseId: integer("case_id").references(() => taxCases.id, { onDelete: "cascade" }),
  /** @FK users.id - Remitente */
  senderId: integer("sender_id").notNull().references(() => users.id),
  /** @FK users.id - Destinatario */
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// TABLA DE FORMULARIO DE CONTACTO
// =============================================================================

/**
 * Tabla de envíos del formulario de contacto público
 * 
 * Almacena solicitudes de contacto del sitio web público.
 * No requiere autenticación para enviar.
 * 
 * @property id - ID único del envío
 * @property name - Nombre del contacto
 * @property email - Email del contacto
 * @property phone - Teléfono opcional
 * @property service - Servicio de interés
 * @property message - Mensaje del formulario
 * @property createdAt - Fecha de envío
 */
export const contactSubmissions = pgTable("contact_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  service: varchar("service", { length: 100 }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// TABLA DE LOGS DE ACTIVIDAD
// =============================================================================

/**
 * Tabla de registro de actividades del sistema
 * 
 * Almacena un log de auditoría de acciones importantes
 * para seguimiento y debugging.
 * 
 * @property id - ID único del log
 * @property userId - Usuario que realizó la acción (nullable para sistema)
 * @property action - Tipo de acción realizada
 * @property details - Detalles adicionales
 * @property createdAt - Fecha de la acción
 */
export const activityLogs = pgTable("activity_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** @FK users.id - Usuario que realizó la acción (nullable) */
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// RELACIONES ENTRE TABLAS
// =============================================================================

/**
 * Relaciones del modelo User
 * 
 * Un usuario puede tener:
 * - Múltiples casos tributarios
 * - Múltiples documentos
 * - Múltiples citas
 * - Múltiples mensajes enviados
 */
export const usersRelations = relations(users, ({ many }) => ({
  taxCases: many(taxCases),
  documents: many(documents),
  appointments: many(appointments),
  sentMessages: many(messages),
}));

/**
 * Relaciones del modelo TaxCase
 * 
 * Un caso pertenece a un cliente y puede tener
 * múltiples documentos y mensajes asociados.
 */
export const taxCasesRelations = relations(taxCases, ({ one, many }) => ({
  client: one(users, {
    fields: [taxCases.clientId],
    references: [users.id],
  }),
  documents: many(documents),
  messages: many(messages),
}));

/**
 * Relaciones del modelo Document
 * 
 * Un documento pertenece a un caso (opcional) y fue
 * subido por un usuario específico.
 */
export const documentsRelations = relations(documents, ({ one }) => ({
  case: one(taxCases, {
    fields: [documents.caseId],
    references: [taxCases.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
}));

/**
 * Relaciones del modelo Appointment
 * 
 * Una cita pertenece a un cliente.
 */
export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.id],
  }),
}));

/**
 * Relaciones del modelo Message
 * 
 * Un mensaje pertenece a un caso (opcional) y tiene
 * un remitente.
 */
export const messagesRelations = relations(messages, ({ one }) => ({
  case: one(taxCases, {
    fields: [messages.caseId],
    references: [taxCases.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// =============================================================================
// ESQUEMAS DE VALIDACIÓN ZOD
// =============================================================================

/**
 * Esquema de inserción para usuarios
 * Omite campos auto-generados (id, createdAt, updatedAt)
 */
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Esquema de inserción para identidades OAuth
 */
export const insertAuthIdentitySchema = createInsertSchema(authIdentities).omit({
  id: true,
  createdAt: true,
});

/**
 * Esquema de inserción para casos tributarios
 */
export const insertTaxCaseSchema = createInsertSchema(taxCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Esquema de inserción para documentos
 */
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

/**
 * Esquema de inserción para citas
 */
export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

/**
 * Esquema de inserción para mensajes
 */
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

/**
 * Esquema de inserción para formulario de contacto
 */
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

/**
 * Esquema de inserción para logs de actividad
 */
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

/**
 * Esquema de inserción para tokens de recuperación de contraseña
 */
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

/**
 * Esquema de validación para login
 * 
 * Valida email y contraseña mínima de 6 caracteres
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Esquema de validación para registro
 * 
 * Extiende insertUserSchema con:
 * - Validación de email
 * - Contraseña mínima 6 caracteres
 * - Confirmación de contraseña
 */
export const registerSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// =============================================================================
// TIPOS TYPESCRIPT
// =============================================================================

/** Tipo de usuario seleccionado de la base de datos */
export type User = typeof users.$inferSelect;
/** Tipo para inserción de usuario */
export type InsertUser = z.infer<typeof insertUserSchema>;

/** Tipo de identidad OAuth seleccionada */
export type AuthIdentity = typeof authIdentities.$inferSelect;
/** Tipo para inserción de identidad OAuth */
export type InsertAuthIdentity = z.infer<typeof insertAuthIdentitySchema>;

/** Tipo de caso tributario seleccionado */
export type TaxCase = typeof taxCases.$inferSelect;
/** Tipo para inserción de caso tributario */
export type InsertTaxCase = z.infer<typeof insertTaxCaseSchema>;

/** Tipo de documento seleccionado */
export type Document = typeof documents.$inferSelect;
/** Tipo para inserción de documento */
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

/** Tipo de cita seleccionada */
export type Appointment = typeof appointments.$inferSelect;
/** Tipo para inserción de cita */
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

/** Tipo de mensaje seleccionado */
export type Message = typeof messages.$inferSelect;
/** Tipo para inserción de mensaje */
export type InsertMessage = z.infer<typeof insertMessageSchema>;

/** Tipo de envío de contacto seleccionado */
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
/** Tipo para inserción de envío de contacto */
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

/** Tipo de log de actividad seleccionado */
export type ActivityLog = typeof activityLogs.$inferSelect;
/** Tipo para inserción de log de actividad */
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

/** Tipo de token de recuperación de contraseña seleccionado */
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
/** Tipo para inserción de token de recuperación */
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
