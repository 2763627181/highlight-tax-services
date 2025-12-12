/**
 * @fileoverview Capa de Acceso a Datos de Highlight Tax Services
 * 
 * Este módulo proporciona la interfaz de almacenamiento para todas
 * las operaciones de base de datos del sistema. Implementa el patrón
 * Repository para abstraer la lógica de persistencia.
 * 
 * @module server/storage
 * @version 1.0.0
 * 
 * ## Entidades Manejadas
 * - Users: Usuarios del sistema (clientes, preparadores, admins)
 * - TaxCases: Casos de declaración de impuestos
 * - Documents: Documentos tributarios subidos
 * - Appointments: Citas programadas
 * - Messages: Mensajes del sistema de mensajería
 * - ContactSubmissions: Formularios de contacto
 * - ActivityLogs: Registro de actividades del sistema
 * - AuthIdentities: Identidades OAuth vinculadas
 * 
 * ## Patrones de Diseño
 * - Repository Pattern: Abstrae operaciones de DB
 * - Interface Segregation: IStorage define el contrato
 * - Dependency Injection: La instancia se exporta como singleton
 * 
 * @example
 * import { storage } from './storage';
 * 
 * // Obtener usuario por email
 * const user = await storage.getUserByEmail('user@example.com');
 * 
 * // Crear nuevo caso tributario
 * const taxCase = await storage.createTaxCase({
 *   clientId: user.id,
 *   filingYear: 2024,
 *   status: 'pending'
 * });
 */

import { 
  users, 
  taxCases, 
  documents, 
  appointments, 
  messages, 
  contactSubmissions,
  activityLogs,
  authIdentities,
  type User, 
  type InsertUser,
  type TaxCase,
  type InsertTaxCase,
  type Document,
  type InsertDocument,
  type Appointment,
  type InsertAppointment,
  type Message,
  type InsertMessage,
  type ContactSubmission,
  type InsertContactSubmission,
  type ActivityLog,
  type InsertActivityLog,
  type AuthIdentity,
  type InsertAuthIdentity,
  type PasswordResetToken,
  passwordResetTokens,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";

// =============================================================================
// INTERFAZ DE ALMACENAMIENTO
// =============================================================================

/**
 * Interfaz que define todas las operaciones de almacenamiento disponibles
 * 
 * Esta interfaz permite:
 * - Tipado fuerte para todas las operaciones
 * - Fácil mock para testing
 * - Posibilidad de cambiar implementación (ej: de DB a memoria)
 * 
 * @interface IStorage
 */
export interface IStorage {
  // ---------------------------------------------------------------------------
  // USUARIOS
  // ---------------------------------------------------------------------------
  
  /**
   * Obtiene un usuario por su ID
   * @param id - ID único del usuario
   * @returns Usuario o undefined si no existe
   */
  getUser(id: number): Promise<User | undefined>;
  
  /**
   * Busca un usuario por email
   * @param email - Dirección de email
   * @returns Usuario o undefined si no existe
   */
  getUserByEmail(email: string): Promise<User | undefined>;
  
  /**
   * Crea un nuevo usuario en el sistema
   * @param user - Datos del usuario a crear
   * @returns Usuario creado con ID asignado
   */
  createUser(user: InsertUser): Promise<User>;
  
  /**
   * Actualiza datos de un usuario existente
   * @param id - ID del usuario a actualizar
   * @param data - Campos a actualizar
   * @returns Usuario actualizado o undefined si no existe
   */
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  /**
   * Obtiene todos los usuarios con rol 'client'
   * @returns Lista de clientes ordenados por fecha de creación
   */
  getAllClients(): Promise<User[]>;
  
  /**
   * Obtiene clientes con conteos de documentos y casos
   * @returns Clientes con métricas adicionales
   */
  getClientsWithDetails(): Promise<(User & { documentsCount: number; casesCount: number })[]>;
  
  // ---------------------------------------------------------------------------
  // AUTENTICACIÓN OAUTH
  // ---------------------------------------------------------------------------
  
  /**
   * Busca identidad OAuth por proveedor y ID de usuario del proveedor
   * @param provider - Nombre del proveedor (google, github, apple)
   * @param providerUserId - ID del usuario en el proveedor
   * @returns Identidad vinculada o undefined
   */
  getAuthIdentityByProvider(provider: string, providerUserId: string): Promise<AuthIdentity | undefined>;
  
  /**
   * Crea una nueva identidad OAuth vinculada a un usuario
   * @param identity - Datos de la identidad
   * @returns Identidad creada
   */
  createAuthIdentity(identity: InsertAuthIdentity): Promise<AuthIdentity>;
  
  // ---------------------------------------------------------------------------
  // CASOS TRIBUTARIOS
  // ---------------------------------------------------------------------------
  
  /**
   * Obtiene los casos de un cliente específico
   * @param clientId - ID del cliente
   * @returns Lista de casos ordenados por fecha
   */
  getTaxCasesByClient(clientId: number): Promise<TaxCase[]>;
  
  /**
   * Obtiene un caso por su ID
   * @param id - ID del caso
   * @returns Caso o undefined
   */
  getTaxCase(id: number): Promise<TaxCase | undefined>;
  
  /**
   * Obtiene todos los casos con información del cliente
   * @returns Casos con cliente adjunto
   */
  getAllTaxCases(): Promise<(TaxCase & { client?: User })[]>;
  
  /**
   * Crea un nuevo caso tributario
   * @param taxCase - Datos del caso
   * @returns Caso creado
   */
  createTaxCase(taxCase: InsertTaxCase): Promise<TaxCase>;
  
  /**
   * Actualiza un caso existente
   * @param id - ID del caso
   * @param data - Campos a actualizar
   * @returns Caso actualizado o undefined
   */
  updateTaxCase(id: number, data: Partial<InsertTaxCase>): Promise<TaxCase | undefined>;
  
  // ---------------------------------------------------------------------------
  // DOCUMENTOS
  // ---------------------------------------------------------------------------
  
  /**
   * Obtiene documentos asociados a un caso
   * @param caseId - ID del caso
   * @returns Lista de documentos
   */
  getDocumentsByCase(caseId: number): Promise<Document[]>;
  
  /**
   * Obtiene documentos de un cliente
   * @param clientId - ID del cliente
   * @returns Lista de documentos
   */
  getDocumentsByClient(clientId: number): Promise<Document[]>;
  
  /**
   * Obtiene documentos directamente subidos por el cliente
   * @param clientId - ID del cliente
   * @returns Lista de documentos
   */
  getDocumentsByClientDirect(clientId: number): Promise<Document[]>;
  
  /**
   * Obtiene todos los documentos del sistema
   * @returns Lista completa de documentos
   */
  getAllDocuments(): Promise<Document[]>;
  
  /**
   * Obtiene un documento por ID
   * @param id - ID del documento
   * @returns Documento o undefined
   */
  getDocument(id: number): Promise<Document | undefined>;
  
  /**
   * Crea un nuevo registro de documento
   * @param document - Datos del documento
   * @returns Documento creado
   */
  createDocument(document: InsertDocument): Promise<Document>;
  
  // ---------------------------------------------------------------------------
  // CITAS
  // ---------------------------------------------------------------------------
  
  /**
   * Obtiene citas de un cliente
   * @param clientId - ID del cliente
   * @returns Lista de citas ordenadas por fecha
   */
  getAppointmentsByClient(clientId: number): Promise<Appointment[]>;
  
  /**
   * Obtiene todas las citas del sistema
   * @returns Lista de citas
   */
  getAllAppointments(): Promise<Appointment[]>;
  
  /**
   * Verifica si existe conflicto de horario para una cita
   * Usa una ventana de ±30 minutos
   * @param appointmentDate - Fecha/hora propuesta
   * @returns true si hay conflicto
   */
  checkAppointmentConflict(appointmentDate: Date): Promise<boolean>;
  
  /**
   * Crea una nueva cita
   * @param appointment - Datos de la cita
   * @returns Cita creada
   */
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  
  /**
   * Actualiza una cita existente
   * @param id - ID de la cita
   * @param data - Campos a actualizar
   * @returns Cita actualizada o undefined
   */
  updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  
  // ---------------------------------------------------------------------------
  // MENSAJERÍA
  // ---------------------------------------------------------------------------
  
  /**
   * Obtiene mensajes asociados a un caso
   * @param caseId - ID del caso
   * @returns Lista de mensajes ordenados cronológicamente
   */
  getMessagesByCase(caseId: number): Promise<Message[]>;
  
  /**
   * Obtiene conversación entre dos usuarios
   * @param userId1 - Primer usuario
   * @param userId2 - Segundo usuario
   * @returns Mensajes de la conversación
   */
  getConversation(userId1: number, userId2: number): Promise<Message[]>;
  
  /**
   * Obtiene todas las conversaciones de un usuario
   * @param userId - ID del usuario
   * @returns Lista de conversaciones con último mensaje y conteo de no leídos
   */
  getConversationsForUser(userId: number): Promise<{ 
    partnerId: number; 
    partnerName: string; 
    partnerRole: string; 
    lastMessage: Message; 
    unreadCount: number 
  }[]>;
  
  /**
   * Crea un nuevo mensaje
   * @param message - Datos del mensaje
   * @returns Mensaje creado
   */
  createMessage(message: InsertMessage): Promise<Message>;
  
  /**
   * Marca mensajes como leídos
   * @param recipientId - Usuario que lee los mensajes
   * @param senderId - Usuario que envió los mensajes
   */
  markMessagesAsRead(recipientId: number, senderId: number): Promise<void>;
  
  /**
   * Obtiene conteo de mensajes no leídos
   * @param userId - ID del usuario
   * @returns Número de mensajes sin leer
   */
  getUnreadCount(userId: number): Promise<number>;
  
  // ---------------------------------------------------------------------------
  // FORMULARIO DE CONTACTO
  // ---------------------------------------------------------------------------
  
  /**
   * Crea un nuevo envío de formulario de contacto
   * @param contact - Datos del formulario
   * @returns Envío creado
   */
  createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission>;
  
  /**
   * Obtiene todos los envíos de formulario de contacto
   * @returns Lista de envíos ordenados por fecha
   */
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  
  // ---------------------------------------------------------------------------
  // LOGGING DE ACTIVIDAD
  // ---------------------------------------------------------------------------
  
  /**
   * Registra una actividad del sistema
   * @param log - Datos del log
   * @returns Log creado
   */
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // ---------------------------------------------------------------------------
  // ESTADÍSTICAS Y ANALYTICS
  // ---------------------------------------------------------------------------
  
  /**
   * Obtiene estadísticas generales para el dashboard admin
   * @returns Métricas del sistema
   */
  getAdminStats(): Promise<{
    totalClients: number;
    pendingCases: number;
    completedCases: number;
    totalRefunds: number;
  }>;

  /**
   * Obtiene datos analíticos detallados
   * @returns Datos para gráficos y análisis
   */
  getAnalyticsData(): Promise<{
    casesByMonth: { month: string; count: number; amount: number }[];
    casesByStatus: { status: string; count: number }[];
    casesByYear: { year: number; count: number; amount: number }[];
    recentActivity: { date: string; action: string; details: string }[];
  }>;

  // ---------------------------------------------------------------------------
  // RECUPERACIÓN DE CONTRASEÑA
  // ---------------------------------------------------------------------------
  
  /**
   * Crea un token de recuperación de contraseña
   * @param userId - ID del usuario
   * @param tokenHash - Hash del token
   * @param expiresAt - Fecha de expiración
   * @returns Token creado
   */
  createPasswordResetToken(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken>;
  
  /**
   * Obtiene un token de recuperación válido por su hash
   * @param tokenHash - Hash del token
   * @returns Token válido o undefined si no existe o expiró
   */
  getValidPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | undefined>;
  
  /**
   * Marca un token como usado
   * @param tokenId - ID del token
   */
  markPasswordResetTokenAsUsed(tokenId: number): Promise<void>;
  
  /**
   * Invalida todos los tokens de recuperación de un usuario
   * @param userId - ID del usuario
   */
  invalidateUserPasswordResetTokens(userId: number): Promise<void>;
  
  /**
   * Obtiene todos los usuarios (para admin)
   * @returns Lista de todos los usuarios
   */
  getAllUsers(): Promise<User[]>;
  
  /**
   * Activa o desactiva un usuario
   * @param userId - ID del usuario
   * @param isActive - Estado de activación
   */
  setUserActiveStatus(userId: number, isActive: boolean): Promise<User | undefined>;
}

// =============================================================================
// IMPLEMENTACIÓN DE ALMACENAMIENTO EN BASE DE DATOS
// =============================================================================

/**
 * Implementación de IStorage usando PostgreSQL y Drizzle ORM
 * 
 * Esta clase proporciona todas las operaciones CRUD para el sistema
 * usando consultas optimizadas y transacciones donde sea necesario.
 * 
 * @class DatabaseStorage
 * @implements {IStorage}
 */
export class DatabaseStorage implements IStorage {
  
  // ===========================================================================
  // OPERACIONES DE USUARIOS
  // ===========================================================================

  /**
   * Obtiene un usuario por ID
   * 
   * @param id - ID único del usuario
   * @returns Usuario encontrado o undefined
   */
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  /**
   * Busca usuario por email (case-insensitive)
   * 
   * El email se guarda normalizado a minúsculas
   * 
   * @param email - Email a buscar
   * @returns Usuario encontrado o undefined
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  /**
   * Crea un nuevo usuario
   * 
   * @param insertUser - Datos del usuario a insertar
   * @returns Usuario creado con todos los campos generados
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser as any)
      .returning();
    return user;
  }

  /**
   * Actualiza un usuario existente
   * 
   * Automáticamente actualiza el campo updatedAt
   * 
   * @param id - ID del usuario
   * @param data - Campos a actualizar
   * @returns Usuario actualizado o undefined si no existe
   */
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  /**
   * Obtiene todos los clientes (rol = 'client')
   * 
   * @returns Lista de clientes ordenados por fecha de creación descendente
   */
  async getAllClients(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "client")).orderBy(desc(users.createdAt));
  }

  /**
   * Obtiene clientes con conteos de documentos y casos
   * 
   * Realiza consultas adicionales para agregar métricas
   * a cada cliente
   * 
   * @returns Clientes con documentsCount y casesCount
   */
  async getClientsWithDetails(): Promise<(User & { documentsCount: number; casesCount: number })[]> {
    try {
      const clients = await this.getAllClients();
      const clientsWithDetails = await Promise.all(
        clients.map(async (client) => {
          try {
            // Contar documentos del cliente
            const [clientDocs] = await db
              .select({ count: count() })
              .from(documents)
              .where(eq(documents.clientId, client.id));
            
            // Contar casos del cliente
            const [clientCases] = await db
              .select({ count: count() })
              .from(taxCases)
              .where(eq(taxCases.clientId, client.id));
            
            return {
              ...client,
              documentsCount: Number(clientDocs?.count || 0),
              casesCount: Number(clientCases?.count || 0),
            };
          } catch (error) {
            console.error(`[Storage] Error obteniendo detalles para cliente ${client.id}:`, error);
            // Devolver cliente con conteos en 0 si hay error
            return {
              ...client,
              documentsCount: 0,
              casesCount: 0,
            };
          }
        })
      );
      return clientsWithDetails;
    } catch (error) {
      console.error("[Storage] Error en getClientsWithDetails:", error);
      // Devolver array vacío en caso de error
      return [];
    }
  }

  // ===========================================================================
  // OPERACIONES DE AUTENTICACIÓN OAUTH
  // ===========================================================================

  /**
   * Busca una identidad OAuth vinculada
   * 
   * @param provider - Proveedor OAuth (google, github, apple)
   * @param providerUserId - ID del usuario en el proveedor
   * @returns Identidad vinculada o undefined
   */
  async getAuthIdentityByProvider(provider: string, providerUserId: string): Promise<AuthIdentity | undefined> {
    const [identity] = await db
      .select()
      .from(authIdentities)
      .where(and(
        eq(authIdentities.provider, provider as "google" | "github" | "apple" | "replit"),
        eq(authIdentities.providerUserId, providerUserId)
      ));
    return identity || undefined;
  }

  /**
   * Crea una nueva identidad OAuth
   * 
   * @param identity - Datos de la identidad a vincular
   * @returns Identidad creada
   */
  async createAuthIdentity(identity: InsertAuthIdentity): Promise<AuthIdentity> {
    const [newIdentity] = await db
      .insert(authIdentities)
      .values(identity as any)
      .returning();
    return newIdentity;
  }

  // ===========================================================================
  // OPERACIONES DE CASOS TRIBUTARIOS
  // ===========================================================================

  /**
   * Obtiene casos tributarios de un cliente
   * 
   * @param clientId - ID del cliente
   * @returns Casos ordenados por fecha de creación descendente
   */
  async getTaxCasesByClient(clientId: number): Promise<TaxCase[]> {
    return db
      .select()
      .from(taxCases)
      .where(eq(taxCases.clientId, clientId))
      .orderBy(desc(taxCases.createdAt));
  }

  /**
   * Obtiene un caso tributario por ID
   * 
   * @param id - ID del caso
   * @returns Caso encontrado o undefined
   */
  async getTaxCase(id: number): Promise<TaxCase | undefined> {
    const [taxCase] = await db.select().from(taxCases).where(eq(taxCases.id, id));
    return taxCase || undefined;
  }

  /**
   * Obtiene todos los casos con información del cliente
   * 
   * Adjunta objeto User a cada caso para display en admin
   * 
   * @returns Casos con cliente incluido
   */
  async getAllTaxCases(): Promise<(TaxCase & { client?: User })[]> {
    const cases = await db.select().from(taxCases).orderBy(desc(taxCases.createdAt));
    const casesWithClients = await Promise.all(
      cases.map(async (taxCase) => {
        const client = await this.getUser(taxCase.clientId);
        return { ...taxCase, client };
      })
    );
    return casesWithClients;
  }

  /**
   * Crea un nuevo caso tributario
   * 
   * @param taxCase - Datos del caso
   * @returns Caso creado
   */
  async createTaxCase(taxCase: InsertTaxCase): Promise<TaxCase> {
    const [newCase] = await db
      .insert(taxCases)
      .values(taxCase as any)
      .returning();
    return newCase;
  }

  /**
   * Actualiza un caso tributario
   * 
   * Automáticamente actualiza updatedAt
   * 
   * @param id - ID del caso
   * @param data - Campos a actualizar
   * @returns Caso actualizado o undefined
   */
  async updateTaxCase(id: number, data: Partial<InsertTaxCase>): Promise<TaxCase | undefined> {
    const [updatedCase] = await db
      .update(taxCases)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxCases.id, id))
      .returning();
    return updatedCase || undefined;
  }

  // ===========================================================================
  // OPERACIONES DE DOCUMENTOS
  // ===========================================================================

  /**
   * Obtiene documentos asociados a un caso
   * 
   * @param caseId - ID del caso
   * @returns Documentos ordenados por fecha de subida
   */
  async getDocumentsByCase(caseId: number): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.caseId, caseId))
      .orderBy(desc(documents.createdAt));
  }

  /**
   * Obtiene todos los documentos de un cliente
   * 
   * @param clientId - ID del cliente
   * @returns Documentos ordenados por fecha de subida
   */
  async getDocumentsByClient(clientId: number): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.clientId, clientId))
      .orderBy(desc(documents.createdAt));
  }

  /**
   * Obtiene documentos directamente subidos por el cliente
   * 
   * @param clientId - ID del cliente
   * @returns Documentos del cliente
   */
  async getDocumentsByClientDirect(clientId: number): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.clientId, clientId))
      .orderBy(desc(documents.createdAt));
  }

  /**
   * Obtiene todos los documentos del sistema
   * 
   * Para uso en panel de administración
   * 
   * @returns Todos los documentos ordenados por fecha
   */
  async getAllDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  /**
   * Obtiene un documento específico por ID
   * 
   * @param id - ID del documento
   * @returns Documento o undefined
   */
  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc || undefined;
  }

  /**
   * Crea un nuevo registro de documento
   * 
   * @param document - Metadatos del documento
   * @returns Documento creado
   */
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDoc] = await db
      .insert(documents)
      .values(document as any)
      .returning();
    return newDoc;
  }

  // ===========================================================================
  // OPERACIONES DE CITAS
  // ===========================================================================

  /**
   * Obtiene citas de un cliente
   * 
   * @param clientId - ID del cliente
   * @returns Citas ordenadas por fecha (más recientes primero)
   */
  async getAppointmentsByClient(clientId: number): Promise<Appointment[]> {
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.clientId, clientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  /**
   * Obtiene todas las citas del sistema
   * 
   * @returns Todas las citas ordenadas por fecha
   */
  async getAllAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments).orderBy(desc(appointments.appointmentDate));
  }

  /**
   * Verifica conflictos de horario para citas
   * 
   * Busca citas existentes dentro de ±30 minutos de la hora propuesta
   * Excluye citas canceladas
   * 
   * @param appointmentDate - Fecha/hora propuesta
   * @returns true si existe conflicto
   */
  async checkAppointmentConflict(appointmentDate: Date): Promise<boolean> {
    // Ventana de 30 minutos antes y después
    const windowStart = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(appointmentDate.getTime() + 30 * 60 * 1000);
    
    const conflicting = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          sql`${appointments.appointmentDate} >= ${windowStart}`,
          sql`${appointments.appointmentDate} <= ${windowEnd}`,
          sql`${appointments.status} != 'cancelled'`
        )
      );
    
    return (conflicting[0]?.count || 0) > 0;
  }

  /**
   * Crea una nueva cita
   * 
   * @param appointment - Datos de la cita
   * @returns Cita creada
   */
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment as any)
      .returning();
    return newAppointment;
  }

  /**
   * Actualiza una cita existente
   * 
   * @param id - ID de la cita
   * @param data - Campos a actualizar
   * @returns Cita actualizada o undefined
   */
  async updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set(data)
      .where(eq(appointments.id, id))
      .returning();
    return updated || undefined;
  }

  // ===========================================================================
  // OPERACIONES DE MENSAJERÍA
  // ===========================================================================

  /**
   * Obtiene mensajes de un caso específico
   * 
   * @param caseId - ID del caso
   * @returns Mensajes ordenados cronológicamente
   */
  async getMessagesByCase(caseId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.caseId, caseId))
      .orderBy(messages.createdAt);
  }

  /**
   * Obtiene la conversación completa entre dos usuarios
   * 
   * Incluye mensajes en ambas direcciones
   * 
   * @param userId1 - Primer usuario
   * @param userId2 - Segundo usuario
   * @returns Mensajes ordenados cronológicamente
   */
  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return db.select().from(messages).where(
      sql`(${messages.senderId} = ${userId1} AND ${messages.recipientId} = ${userId2}) 
          OR (${messages.senderId} = ${userId2} AND ${messages.recipientId} = ${userId1})`
    ).orderBy(messages.createdAt);
  }

  /**
   * Obtiene todas las conversaciones activas de un usuario
   * 
   * Agrupa mensajes por partner y calcula:
   * - Último mensaje de cada conversación
   * - Conteo de mensajes no leídos
   * 
   * @param userId - ID del usuario
   * @returns Lista de conversaciones con metadatos
   */
  async getConversationsForUser(userId: number): Promise<{ 
    partnerId: number; 
    partnerName: string; 
    partnerRole: string; 
    lastMessage: Message; 
    unreadCount: number 
  }[]> {
    // Obtener todos los mensajes del usuario
    const allMessages = await db.select().from(messages).where(
      sql`${messages.senderId} = ${userId} OR ${messages.recipientId} = ${userId}`
    ).orderBy(desc(messages.createdAt));

    // Agrupar por partner
    const conversationMap = new Map<number, { partnerId: number; messages: Message[] }>();
    
    for (const msg of allMessages) {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, { partnerId, messages: [] });
      }
      conversationMap.get(partnerId)!.messages.push(msg);
    }

    // Construir respuesta con datos del partner
    const conversations = [];
    for (const [partnerId, data] of Array.from(conversationMap)) {
      const partner = await this.getUser(partnerId);
      if (partner) {
        // Contar mensajes no leídos enviados al usuario actual
        const unreadCount = data.messages.filter(
          (m: any) => m.recipientId === userId && !m.isRead
        ).length;
        
        conversations.push({
          partnerId,
          partnerName: partner.name,
          partnerRole: partner.role,
          lastMessage: data.messages[0], // Más reciente
          unreadCount,
        });
      }
    }

    // Ordenar por último mensaje más reciente
    return conversations.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }

  /**
   * Crea un nuevo mensaje
   * 
   * @param message - Datos del mensaje
   * @returns Mensaje creado
   */
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message as any)
      .returning();
    return newMessage;
  }

  /**
   * Marca mensajes de un remitente como leídos
   * 
   * Actualiza todos los mensajes no leídos del sender
   * hacia el recipient
   * 
   * @param recipientId - Usuario que lee los mensajes
   * @param senderId - Usuario que envió los mensajes
   */
  async markMessagesAsRead(recipientId: number, senderId: number): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.recipientId, recipientId),
          eq(messages.senderId, senderId),
          eq(messages.isRead, false)
        )
      );
  }

  /**
   * Cuenta mensajes no leídos para un usuario
   * 
   * @param userId - ID del usuario
   * @returns Número de mensajes sin leer
   */
  async getUnreadCount(userId: number): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, userId),
          eq(messages.isRead, false)
        )
      );
    return result?.count || 0;
  }

  // ===========================================================================
  // OPERACIONES DE FORMULARIO DE CONTACTO
  // ===========================================================================

  /**
   * Guarda un envío del formulario de contacto
   * 
   * @param contact - Datos del formulario
   * @returns Envío creado
   */
  async createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission> {
    const [newContact] = await db
      .insert(contactSubmissions)
      .values(contact as any)
      .returning();
    return newContact;
  }

  /**
   * Obtiene todos los envíos de contacto
   * 
   * Para revisión en panel de administración
   * 
   * @returns Envíos ordenados por fecha descendente
   */
  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  // ===========================================================================
  // OPERACIONES DE LOGGING
  // ===========================================================================

  /**
   * Registra una actividad del sistema
   * 
   * Usado para auditoría y seguimiento de acciones
   * 
   * @param log - Datos del registro de actividad
   * @returns Log creado
   */
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values(log as any)
      .returning();
    return newLog;
  }

  // ===========================================================================
  // ESTADÍSTICAS Y ANALYTICS
  // ===========================================================================

  /**
   * Obtiene estadísticas generales del sistema
   * 
   * Calcula métricas clave para el dashboard:
   * - Total de clientes registrados
   * - Casos pendientes
   * - Casos completados
   * - Total de reembolsos procesados
   * 
   * @returns Objeto con métricas del sistema
   */
  async getAdminStats(): Promise<{
    totalClients: number;
    pendingCases: number;
    completedCases: number;
    totalRefunds: number;
  }> {
    try {
      // Contar clientes
      const [clientCount] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "client"));

      // Contar casos pendientes
      const [pendingCount] = await db
        .select({ count: count() })
        .from(taxCases)
        .where(eq(taxCases.status, "pending"));

      // Contar casos completados
      const [completedCount] = await db
        .select({ count: count() })
        .from(taxCases)
        .where(sql`${taxCases.status} IN ('approved', 'refund_issued')`);

      // Sumar total de reembolsos
      const [refundsSum] = await db
        .select({ total: sum(taxCases.finalAmount) })
        .from(taxCases)
        .where(sql`${taxCases.finalAmount} IS NOT NULL`);

      return {
        totalClients: Number(clientCount?.count || 0),
        pendingCases: Number(pendingCount?.count || 0),
        completedCases: Number(completedCount?.count || 0),
        totalRefunds: parseFloat(refundsSum?.total || "0") || 0,
      };
    } catch (error) {
      console.error("[Storage] Error en getAdminStats:", error);
      // Devolver valores por defecto en caso de error
      return {
        totalClients: 0,
        pendingCases: 0,
        completedCases: 0,
        totalRefunds: 0,
      };
    }
  }

  /**
   * Obtiene datos analíticos detallados
   * 
   * Genera datos para visualizaciones:
   * - Casos por mes (últimos 12 meses)
   * - Distribución de casos por estado
   * - Casos por año fiscal
   * - Actividad reciente del sistema
   * 
   * @returns Datos formateados para gráficos
   */
  async getAnalyticsData(): Promise<{
    casesByMonth: { month: string; count: number; amount: number }[];
    casesByStatus: { status: string; count: number }[];
    casesByYear: { year: number; count: number; amount: number }[];
    recentActivity: { date: string; action: string; details: string }[];
  }> {
    // Obtener todos los casos
    const allCases = await db.select().from(taxCases).orderBy(desc(taxCases.createdAt));
    
    // Preparar mapa de meses
    const casesByMonth = new Map<string, { count: number; amount: number }>();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Inicializar últimos 12 meses con ceros
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      casesByMonth.set(key, { count: 0, amount: 0 });
    }
    
    // Agregar casos a sus meses correspondientes
    for (const c of allCases) {
      const date = new Date(c.createdAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (casesByMonth.has(key)) {
        const current = casesByMonth.get(key)!;
        current.count++;
        current.amount += parseFloat(c.finalAmount || "0");
      }
    }

    // Convertir a array ordenado
    const casesByMonthArr = Array.from(casesByMonth.entries())
      .map(([month, data]) => ({ month, ...data }))
      .reverse();

    // Obtener distribución por estado
    const statusCounts = await db.select({ 
      status: taxCases.status, 
      count: count() 
    })
      .from(taxCases)
      .groupBy(taxCases.status);

    const casesByStatus = statusCounts.map(s => ({
      status: s.status,
      count: Number(s.count)
    }));

    // Agrupar por año fiscal
    const casesByYearMap = new Map<number, { count: number; amount: number }>();
    for (const c of allCases) {
      const year = c.filingYear;
      if (!casesByYearMap.has(year)) {
        casesByYearMap.set(year, { count: 0, amount: 0 });
      }
      const current = casesByYearMap.get(year)!;
      current.count++;
      current.amount += parseFloat(c.finalAmount || "0");
    }

    const casesByYear = Array.from(casesByYearMap.entries())
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => b.year - a.year);

    // Obtener actividad reciente
    const recentLogs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(10);
    
    const recentActivity = recentLogs.map(log => ({
      date: log.createdAt.toISOString(),
      action: log.action,
      details: log.details || ''
    }));

    return {
      casesByMonth: casesByMonthArr,
      casesByStatus,
      casesByYear,
      recentActivity,
    };
  }

  // ===========================================================================
  // OPERACIONES DE RECUPERACIÓN DE CONTRASEÑA
  // ===========================================================================

  /**
   * Crea un token de recuperación de contraseña
   */
  async createPasswordResetToken(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [token] = await db
      .insert(passwordResetTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return token;
  }

  /**
   * Obtiene un token de recuperación válido por su hash
   */
  async getValidPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | undefined> {
    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          sql`${passwordResetTokens.expiresAt} > NOW()`,
          sql`${passwordResetTokens.usedAt} IS NULL`
        )
      );
    return token || undefined;
  }

  /**
   * Marca un token como usado
   */
  async markPasswordResetTokenAsUsed(tokenId: number): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, tokenId));
  }

  /**
   * Invalida todos los tokens de recuperación de un usuario
   */
  async invalidateUserPasswordResetTokens(userId: number): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          sql`${passwordResetTokens.usedAt} IS NULL`
        )
      );
  }

  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  /**
   * Activa o desactiva un usuario
   */
  async setUserActiveStatus(userId: number, isActive: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }
}

// =============================================================================
// EXPORTACIÓN SINGLETON
// =============================================================================

/**
 * Instancia singleton del almacenamiento
 * 
 * Usar esta instancia en toda la aplicación para
 * operaciones de base de datos.
 * 
 * @example
 * import { storage } from './storage';
 * const user = await storage.getUserByEmail('test@example.com');
 */
export const storage = new DatabaseStorage();
