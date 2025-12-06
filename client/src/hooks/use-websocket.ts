/**
 * @fileoverview Hook de WebSocket para Notificaciones en Tiempo Real
 * 
 * Gestiona la conexión WebSocket con el servidor para recibir
 * notificaciones push sobre mensajes, actualizaciones de casos,
 * documentos y citas.
 * 
 * @module client/hooks/use-websocket
 * @version 1.0.0
 * 
 * ## Características
 * - Reconexión automática en caso de desconexión
 * - Invalidación automática de cache de React Query
 * - Notificaciones toast para alertar al usuario
 * - Manejo seguro de cierre de conexión
 * 
 * ## Tipos de Notificaciones Soportadas
 * - `message` - Nuevo mensaje en conversación
 * - `case_update` - Actualización de estado de caso
 * - `document` - Nuevo documento subido
 * - `appointment` - Nueva cita o cambio de cita
 * - `connected` - Confirmación de conexión (ignorada)
 * 
 * @security
 * - Token JWT requerido para conexión
 * - Reconexión solo si token es válido (no code 4001)
 * - Conexión cerrada limpiamente en cleanup
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { isConnected } = useWebSocket(token);
 *   
 *   return (
 *     <div>
 *       {isConnected ? "En línea" : "Desconectado"}
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

/**
 * Estructura de un payload de notificación WebSocket
 * 
 * @property type - Tipo de notificación para enrutamiento
 * @property title - Título para mostrar en toast
 * @property message - Mensaje descriptivo
 * @property data - Datos adicionales específicos del tipo
 */
interface NotificationPayload {
  /** Tipo de notificación que determina cómo se procesa */
  type: "message" | "status_update" | "document" | "appointment" | "case_update" | "connected";
  /** Título corto para la notificación toast */
  title: string;
  /** Mensaje descriptivo de la notificación */
  message: string;
  /** Datos adicionales específicos del tipo de notificación */
  data?: Record<string, any>;
}

/** Tiempo de espera antes de intentar reconexión (5 segundos) */
const RECONNECT_DELAY = 5000;

/**
 * Hook para gestionar conexión WebSocket con el servidor
 * 
 * Establece y mantiene una conexión WebSocket para recibir
 * notificaciones en tiempo real. Maneja reconexión automática
 * y procesamiento de diferentes tipos de notificaciones.
 * 
 * @param token - Token JWT para autenticación, null si no autenticado
 * @returns Objeto con estado de conexión
 * 
 * @example
 * ```tsx
 * // Uso básico
 * const { isConnected } = useWebSocket(authToken);
 * 
 * // Mostrar indicador de conexión
 * <Badge variant={isConnected ? "default" : "destructive"}>
 *   {isConnected ? "Conectado" : "Desconectado"}
 * </Badge>
 * ```
 */
export function useWebSocket(token: string | null) {
  /** Referencia al objeto WebSocket actual */
  const wsRef = useRef<WebSocket | null>(null);
  /** Estado de conexión para el componente */
  const [isConnected, setIsConnected] = useState(false);
  /** Referencia al timeout de reconexión */
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  /** Hook de toast para mostrar notificaciones */
  const { toast } = useToast();

  /**
   * Establece conexión WebSocket con el servidor
   * 
   * Crea nueva conexión solo si:
   * - Hay un token válido
   * - No hay conexión activa
   * 
   * La URL se construye automáticamente basada en el protocolo
   * actual (ws:// para HTTP, wss:// para HTTPS).
   * 
   * @internal
   */
  const connect = useCallback(() => {
    // No conectar si no hay token o ya está conectado
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    // Construir URL con protocolo correcto
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      /**
       * Handler de conexión exitosa
       * Limpia timeout de reconexión y actualiza estado
       */
      wsRef.current.onopen = () => {
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      /**
       * Handler de mensajes entrantes
       * Parsea JSON y delega al manejador de notificaciones
       */
      wsRef.current.onmessage = (event) => {
        try {
          const notification: NotificationPayload = JSON.parse(event.data);
          handleNotification(notification);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      /**
       * Handler de cierre de conexión
       * 
       * Intenta reconectar automáticamente después de RECONNECT_DELAY
       * a menos que el cierre sea por autenticación inválida (code 4001).
       * 
       * Códigos de cierre personalizados:
       * - 4001: Token inválido o expirado (no reconectar)
       * - 4002: Límite de conexiones excedido
       * - 4003: Mensaje demasiado grande
       */
      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;

        // Reconectar solo si no es error de autenticación y hay token
        if (event.code !== 4001 && token) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };

      /**
       * Handler de errores de conexión
       * Solo logging, el cierre se maneja en onclose
       */
      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, [token]);

  /**
   * Procesa notificaciones recibidas por WebSocket
   * 
   * Para cada tipo de notificación:
   * 1. Invalida los queries de React Query relevantes
   * 2. Muestra un toast con el mensaje
   * 
   * La invalidación de cache asegura que los datos se refresquen
   * automáticamente en los componentes que los usan.
   * 
   * @param notification - Payload de la notificación recibida
   * @internal
   */
  const handleNotification = useCallback((notification: NotificationPayload) => {
    // Ignorar mensaje de confirmación de conexión
    if (notification.type === "connected") return;

    switch (notification.type) {
      case "message":
        // Nuevo mensaje: refrescar conversaciones y contador de no leídos
        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
        queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
        toast({
          title: notification.title,
          description: notification.message,
        });
        break;

      case "case_update":
        // Actualización de caso: refrescar listas de casos
        queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/cases"] });
        toast({
          title: notification.title,
          description: notification.message,
        });
        break;

      case "document":
        // Nuevo documento: refrescar listas de documentos
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
        toast({
          title: notification.title,
          description: notification.message,
        });
        break;

      case "appointment":
        // Cita: refrescar listas de citas
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
        toast({
          title: notification.title,
          description: notification.message,
        });
        break;

      default:
        // Notificación genérica: solo mostrar toast
        toast({
          title: notification.title,
          description: notification.message,
        });
    }
  }, [toast]);

  /**
   * Effect para manejar ciclo de vida de conexión
   * 
   * - Conecta cuando hay token disponible
   * - Limpia recursos al desmontar o cambiar token
   */
  useEffect(() => {
    connect();

    // Cleanup: cancelar reconexión y cerrar socket
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { isConnected };
}
