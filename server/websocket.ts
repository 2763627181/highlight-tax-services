/**
 * @fileoverview Servicio WebSocket para Notificaciones en Tiempo Real
 * 
 * Este módulo proporciona comunicación bidireccional en tiempo real
 * entre el servidor y los clientes conectados para notificaciones
 * instantáneas de eventos del sistema.
 * 
 * @module server/websocket
 * @version 1.0.0
 * 
 * ## Características
 * - Autenticación JWT para conexiones seguras
 * - Soporte para múltiples conexiones por usuario
 * - Sistema de heartbeat para detección de conexiones muertas
 * - Notificaciones dirigidas por usuario, rol, o broadcast
 * 
 * ## Tipos de Notificaciones
 * - message: Nuevos mensajes directos
 * - case_update: Cambios en estado de casos
 * - document: Nuevos documentos subidos
 * - appointment: Nuevas citas agendadas
 * 
 * ## Seguridad
 * - Token JWT requerido para conexión
 * - Tokens de corta duración (1 hora)
 * - Límite de conexiones por usuario
 * - Límite de tamaño de mensajes
 * 
 * @example
 * // Conexión desde el cliente
 * const ws = new WebSocket(`wss://domain.com/ws?token=${wsToken}`);
 * ws.onmessage = (event) => {
 *   const notification = JSON.parse(event.data);
 *   console.log(notification.title, notification.message);
 * };
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import jwt from "jsonwebtoken";
import { log } from "./index";

// =============================================================================
// CONFIGURACIÓN DE SEGURIDAD
// =============================================================================

/**
 * Clave secreta para verificar tokens JWT
 * Debe coincidir con la usada en routes.ts
 * 
 * @security Verificada desde variable de entorno
 * @throws Error si no está configurada correctamente
 */
const JWT_SECRET: string = (() => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.trim().length === 0) {
    console.error("[websocket] CRÍTICO: SESSION_SECRET no configurada - WebSocket fallará");
    return "";
  }
  if (secret.length < 32) {
    console.warn("[websocket] ADVERTENCIA: SESSION_SECRET debe tener al menos 32 caracteres");
  }
  return secret;
})();

/**
 * Máximo de conexiones WebSocket permitidas por usuario
 * Previene abuso de recursos y ataques DoS
 */
const MAX_CONNECTIONS_PER_USER = 5;

/**
 * Tamaño máximo de mensaje entrante en bytes (1KB)
 * Previene ataques de memoria y DoS
 */
const MAX_MESSAGE_SIZE = 1024;

/**
 * Intervalo de heartbeat en milisegundos (30 segundos)
 * Detecta y limpia conexiones muertas
 */
const HEARTBEAT_INTERVAL = 30000;

// =============================================================================
// TIPOS E INTERFACES
// =============================================================================

/**
 * Extensión de WebSocket con información de autenticación
 * 
 * @property userId - ID del usuario autenticado
 * @property userRole - Rol del usuario (client, preparer, admin)
 * @property isAlive - Flag para detección de heartbeat
 * @property connectedAt - Timestamp de conexión
 */
interface AuthenticatedWebSocket extends WebSocket {
  /** ID único del usuario autenticado */
  userId?: number;
  /** Rol del usuario para filtrado de notificaciones */
  userRole?: string;
  /** Estado de conexión para heartbeat */
  isAlive?: boolean;
  /** Momento de conexión para métricas */
  connectedAt?: Date;
}

/**
 * Estructura de las notificaciones enviadas a clientes
 * 
 * @property type - Tipo de notificación para procesamiento en cliente
 * @property title - Título corto para mostrar al usuario
 * @property message - Mensaje descriptivo del evento
 * @property data - Datos adicionales específicos del tipo
 */
interface NotificationPayload {
  /** Categoría de la notificación */
  type: "message" | "status_update" | "document" | "appointment" | "case_update" | "connected";
  /** Título breve para UI */
  title: string;
  /** Descripción del evento */
  message: string;
  /** Datos adicionales opcionales */
  data?: Record<string, unknown>;
}

// =============================================================================
// SERVICIO WEBSOCKET
// =============================================================================

/**
 * Clase de servicio WebSocket para manejo de notificaciones en tiempo real
 * 
 * Implementa un patrón singleton para asegurar una única instancia
 * del servidor WebSocket en toda la aplicación.
 * 
 * @class WebSocketService
 * 
 * ## Uso
 * ```typescript
 * import { wsService } from './websocket';
 * 
 * // Inicializar con servidor HTTP
 * wsService.initialize(httpServer);
 * 
 * // Enviar notificación a un usuario
 * wsService.notifyNewMessage(fromUserId, toUserId, 'Hola!');
 * ```
 * 
 * ## Métodos Públicos
 * - initialize() - Arranca el servidor WebSocket
 * - sendToUser() - Envía a un usuario específico
 * - sendToAdmins() - Envía a todos los administradores
 * - sendToPreparers() - Envía a preparadores y admins
 * - broadcast() - Envía a todos los conectados
 * - notifyNewMessage() - Notifica nuevo mensaje
 * - notifyCaseStatusChange() - Notifica cambio de estado
 * - notifyDocumentUpload() - Notifica nuevo documento
 * - notifyNewAppointment() - Notifica nueva cita
 */
class WebSocketService {
  /** Instancia del servidor WebSocket */
  private wss: WebSocketServer | null = null;
  
  /** 
   * Mapa de conexiones por usuario
   * Permite múltiples conexiones por usuario (ej: móvil + escritorio)
   */
  private clients: Map<number, Set<AuthenticatedWebSocket>> = new Map();

  /**
   * Inicializa el servidor WebSocket
   * 
   * Configura:
   * - Manejo de conexiones entrantes
   * - Autenticación JWT
   * - Sistema de heartbeat
   * - Limpieza de conexiones muertas
   * 
   * @param server - Servidor HTTP para adjuntar WebSocket
   * 
   * @example
   * const httpServer = createServer(app);
   * wsService.initialize(httpServer);
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: "/ws",
      maxPayload: MAX_MESSAGE_SIZE,
    });

    // Manejar nuevas conexiones
    this.wss.on("connection", (ws: AuthenticatedWebSocket, req) => {
      this.handleConnection(ws, req);
    });

    // Sistema de heartbeat para detectar conexiones muertas
    const interval = setInterval(() => {
      this.performHeartbeat();
    }, HEARTBEAT_INTERVAL);

    // Limpiar intervalo al cerrar el servidor
    this.wss.on("close", () => {
      clearInterval(interval);
    });

    log("WebSocket server initialized", "websocket");
  }

  /**
   * Maneja una nueva conexión WebSocket
   * 
   * Proceso:
   * 1. Extrae token de la URL
   * 2. Verifica token JWT
   * 3. Verifica límite de conexiones
   * 4. Registra conexión
   * 5. Configura listeners
   * 
   * @param ws - Conexión WebSocket
   * @param req - Request HTTP original
   * 
   * @security
   * - Rechaza sin token
   * - Rechaza token inválido/expirado
   * - Rechaza si excede límite de conexiones
   */
  private handleConnection(ws: AuthenticatedWebSocket, req: { url?: string; headers: { host?: string } }): void {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    // Verificar token presente
    if (!token) {
      log("WebSocket connection rejected: no token", "websocket");
      ws.close(4001, "Authentication required");
      return;
    }

    try {
      // Verificar configuración del servidor
      if (!JWT_SECRET || JWT_SECRET.length === 0) {
        log("WebSocket connection rejected: server misconfigured", "websocket");
        ws.close(4001, "Server configuration error");
        return;
      }

      // Verificar y decodificar token
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number; 
        role: string;
        exp?: number;
      };

      // Verificar límite de conexiones por usuario
      const existingConnections = this.clients.get(decoded.id);
      const currentConnectionCount = existingConnections ? existingConnections.size : 0;
      
      if (currentConnectionCount >= MAX_CONNECTIONS_PER_USER) {
        log(`WebSocket security: user ${decoded.id} rejected - ${currentConnectionCount}/${MAX_CONNECTIONS_PER_USER} connections (limit exceeded)`, "websocket");
        ws.close(4002, "Too many connections");
        return;
      }
      
      log(`WebSocket connection count: user ${decoded.id} has ${currentConnectionCount}/${MAX_CONNECTIONS_PER_USER} connections`, "websocket");

      // Configurar conexión autenticada
      ws.userId = decoded.id;
      ws.userRole = decoded.role;
      ws.isAlive = true;
      ws.connectedAt = new Date();

      // Registrar conexión
      if (!this.clients.has(decoded.id)) {
        this.clients.set(decoded.id, new Set());
      }
      this.clients.get(decoded.id)!.add(ws);

      log(`WebSocket connected: user ${decoded.id} (${decoded.role})`, "websocket");

      // Configurar listeners de eventos
      this.setupConnectionListeners(ws);

      // Enviar confirmación de conexión
      ws.send(JSON.stringify({
        type: "connected",
        title: "Conectado",
        message: "Conectado al servicio de notificaciones",
      }));

    } catch (error) {
      log(`WebSocket connection rejected: invalid token - ${(error as Error).message}`, "websocket");
      ws.close(4001, "Invalid or expired token");
    }
  }

  /**
   * Configura listeners para una conexión establecida
   * 
   * @param ws - Conexión WebSocket autenticada
   * 
   * @security
   * - Mensajes mayores a MAX_MESSAGE_SIZE son rechazados por maxPayload
   * - Se loguea actividad de mensajes para auditoría
   */
  private setupConnectionListeners(ws: AuthenticatedWebSocket): void {
    // Respuesta a ping para heartbeat
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Manejar cierre de conexión
    ws.on("close", () => {
      this.handleDisconnection(ws);
    });

    // Manejar errores (incluyendo mensajes demasiado grandes)
    ws.on("error", (error) => {
      const errorMessage = error.message || "Unknown error";
      log(`WebSocket error for user ${ws.userId}: ${errorMessage}`, "websocket");
      
      // Si es un error de payload demasiado grande, el websocket ya está cerrado
      if (errorMessage.includes("Max payload size exceeded")) {
        log(`WebSocket security: user ${ws.userId} sent oversized message, connection terminated`, "websocket");
      }
    });

    // Manejar mensajes entrantes con validación de tamaño
    ws.on("message", (data) => {
      // Convertir RawData a Buffer si es necesario
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data as string | ArrayBuffer);
      
      // Verificación adicional de tamaño de mensaje (defensa en profundidad)
      const messageSize = buffer.byteLength;
      if (messageSize > MAX_MESSAGE_SIZE) {
        log(`WebSocket security: user ${ws.userId} sent message ${messageSize} bytes (limit: ${MAX_MESSAGE_SIZE}), closing`, "websocket");
        ws.close(4003, "Message too large");
        return;
      }
      
      // Log del mensaje (truncado para auditoría)
      const messagePreview = buffer.toString().substring(0, 100);
      log(`WebSocket message from user ${ws.userId} (${messageSize}b): ${messagePreview}...`, "websocket");
    });
  }

  /**
   * Maneja la desconexión de un cliente
   * 
   * @param ws - Conexión WebSocket cerrada
   */
  private handleDisconnection(ws: AuthenticatedWebSocket): void {
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          this.clients.delete(ws.userId);
        }
      }
    }
    log(`WebSocket disconnected: user ${ws.userId}`, "websocket");
  }

  /**
   * Ejecuta verificación de heartbeat en todas las conexiones
   * 
   * Cierra conexiones que no respondieron al ping anterior
   * y envía nuevo ping a las demás.
   */
  private performHeartbeat(): void {
    this.wss?.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.isAlive === false) {
        log(`WebSocket terminated due to heartbeat timeout: user ${ws.userId}`, "websocket");
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }

  // ===========================================================================
  // MÉTODOS PÚBLICOS DE ENVÍO
  // ===========================================================================

  /**
   * Envía una notificación a un usuario específico
   * 
   * Envía a todas las conexiones activas del usuario
   * (soporta múltiples dispositivos)
   * 
   * @param userId - ID del usuario destinatario
   * @param notification - Payload de la notificación
   * 
   * @example
   * wsService.sendToUser(123, {
   *   type: 'message',
   *   title: 'Nuevo mensaje',
   *   message: 'Tienes un mensaje de Juan'
   * });
   */
  sendToUser(userId: number, notification: NotificationPayload): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify(notification);
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
      log(`Notification sent to user ${userId}: ${notification.type}`, "websocket");
    }
  }

  /**
   * Envía una notificación a todos los administradores
   * 
   * @param notification - Payload de la notificación
   */
  sendToAdmins(notification: NotificationPayload): void {
    let count = 0;
    this.clients.forEach((clients) => {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.userRole === "admin") {
          client.send(JSON.stringify(notification));
          count++;
        }
      });
    });
    log(`Notification sent to ${count} admins: ${notification.type}`, "websocket");
  }

  /**
   * Envía una notificación a preparadores y administradores
   * 
   * @param notification - Payload de la notificación
   */
  sendToPreparers(notification: NotificationPayload): void {
    let count = 0;
    this.clients.forEach((clients) => {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && 
            (client.userRole === "admin" || client.userRole === "preparer")) {
          client.send(JSON.stringify(notification));
          count++;
        }
      });
    });
    log(`Notification sent to ${count} preparers/admins: ${notification.type}`, "websocket");
  }

  /**
   * Envía una notificación a todos los usuarios conectados
   * 
   * Usar con precaución para evitar spam
   * 
   * @param notification - Payload de la notificación
   */
  broadcast(notification: NotificationPayload): void {
    const message = JSON.stringify(notification);
    let count = 0;
    this.clients.forEach((clients) => {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
          count++;
        }
      });
    });
    log(`Broadcast sent to ${count} clients: ${notification.type}`, "websocket");
  }

  // ===========================================================================
  // MÉTODOS DE NOTIFICACIÓN ESPECÍFICOS
  // ===========================================================================

  /**
   * Notifica a un usuario sobre un nuevo mensaje recibido
   * 
   * @param fromUserId - ID del remitente
   * @param toUserId - ID del destinatario
   * @param messagePreview - Preview del contenido (primeros 100 chars)
   */
  notifyNewMessage(fromUserId: number, toUserId: number, messagePreview: string): void {
    this.sendToUser(toUserId, {
      type: "message",
      title: "Nuevo Mensaje",
      message: messagePreview,
      data: { fromUserId },
    });
  }

  /**
   * Notifica cambio de estado en un caso tributario
   * 
   * Envía notificación al cliente afectado y a los preparadores
   * 
   * @param clientId - ID del cliente dueño del caso
   * @param caseId - ID del caso actualizado
   * @param newStatus - Nuevo estado del caso
   * @param clientName - Nombre del cliente (para notificación a preparadores)
   */
  notifyCaseStatusChange(clientId: number, caseId: number, newStatus: string, clientName?: string): void {
    // Notificar al cliente
    this.sendToUser(clientId, {
      type: "case_update",
      title: "Estado del Caso Actualizado",
      message: `Su caso ha sido actualizado a: ${newStatus}`,
      data: { caseId, status: newStatus },
    });

    // Notificar a preparadores
    this.sendToPreparers({
      type: "case_update",
      title: "Caso Actualizado",
      message: clientName 
        ? `El caso de ${clientName} ha sido actualizado` 
        : "Un caso ha sido actualizado",
      data: { caseId, status: newStatus },
    });
  }

  /**
   * Notifica a preparadores sobre un nuevo documento subido
   * 
   * @param clientId - ID del cliente que subió el documento
   * @param clientName - Nombre del cliente
   * @param documentName - Nombre del archivo
   * @param caseId - ID del caso asociado (opcional)
   */
  notifyDocumentUpload(clientId: number, clientName: string, documentName: string, caseId?: number): void {
    this.sendToPreparers({
      type: "document",
      title: "Nuevo Documento",
      message: `${clientName} ha subido: ${documentName}`,
      data: { clientId, documentName, caseId },
    });
  }

  /**
   * Notifica sobre una nueva cita agendada
   * 
   * Confirma al cliente y avisa a preparadores
   * 
   * @param clientId - ID del cliente
   * @param dateTime - Fecha y hora ISO de la cita
   * @param service - Descripción del servicio
   */
  notifyNewAppointment(clientId: number, dateTime: string, service: string): void {
    // Confirmar al cliente
    this.sendToUser(clientId, {
      type: "appointment",
      title: "Cita Confirmada",
      message: `Su cita para ${service} ha sido programada`,
      data: { dateTime, service },
    });

    // Notificar a preparadores
    this.sendToPreparers({
      type: "appointment",
      title: "Nueva Cita",
      message: `Nueva cita programada para ${service}`,
      data: { clientId, dateTime, service },
    });
  }

  // ===========================================================================
  // MÉTODOS DE UTILIDAD
  // ===========================================================================

  /**
   * Obtiene el número de usuarios únicos conectados
   * 
   * @returns Cantidad de usuarios con al menos una conexión activa
   */
  getConnectedUsersCount(): number {
    return this.clients.size;
  }

  /**
   * Obtiene el número total de conexiones activas
   * 
   * @returns Cantidad total de conexiones WebSocket
   */
  getTotalConnectionsCount(): number {
    let total = 0;
    this.clients.forEach((clients) => {
      total += clients.size;
    });
    return total;
  }

  /**
   * Verifica si un usuario específico está conectado
   * 
   * @param userId - ID del usuario a verificar
   * @returns true si tiene al menos una conexión activa
   */
  isUserConnected(userId: number): boolean {
    const userClients = this.clients.get(userId);
    return userClients !== undefined && userClients.size > 0;
  }
}

/**
 * Instancia singleton del servicio WebSocket
 * 
 * Usar esta instancia exportada en toda la aplicación
 * para enviar notificaciones en tiempo real.
 * 
 * @example
 * import { wsService } from './websocket';
 * wsService.notifyNewMessage(1, 2, 'Hola!');
 */
export const wsService = new WebSocketService();
