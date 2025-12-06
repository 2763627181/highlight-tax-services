import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface NotificationPayload {
  type: "message" | "status_update" | "document" | "appointment" | "case_update" | "connected";
  title: string;
  message: string;
  data?: Record<string, any>;
}

export function useWebSocket(token: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const notification: NotificationPayload = JSON.parse(event.data);
          handleNotification(notification);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;

        if (event.code !== 4001 && token) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, [token]);

  const handleNotification = useCallback((notification: NotificationPayload) => {
    if (notification.type === "connected") return;

    switch (notification.type) {
      case "message":
        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
        queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
        toast({
          title: notification.title,
          description: notification.message,
        });
        break;

      case "case_update":
        queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/cases"] });
        toast({
          title: notification.title,
          description: notification.message,
        });
        break;

      case "document":
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
        toast({
          title: notification.title,
          description: notification.message,
        });
        break;

      case "appointment":
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
        toast({
          title: notification.title,
          description: notification.message,
        });
        break;

      default:
        toast({
          title: notification.title,
          description: notification.message,
        });
    }
  }, [toast]);

  useEffect(() => {
    connect();

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
