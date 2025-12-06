import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import jwt from "jsonwebtoken";
import { log } from "./index";

const JWT_SECRET = process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  console.warn("[websocket] SESSION_SECRET not set, WebSocket auth will fail");
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  userRole?: string;
  isAlive?: boolean;
}

interface NotificationPayload {
  type: "message" | "status_update" | "document" | "appointment" | "case_update";
  title: string;
  message: string;
  data?: Record<string, any>;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<number, Set<AuthenticatedWebSocket>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: "/ws",
    });

    this.wss.on("connection", (ws: AuthenticatedWebSocket, req) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        ws.close(4001, "Authentication required");
        return;
      }

      try {
        if (!JWT_SECRET) {
          ws.close(4001, "Server configuration error");
          return;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
        ws.userId = decoded.id;
        ws.userRole = decoded.role;
        ws.isAlive = true;

        if (!this.clients.has(decoded.id)) {
          this.clients.set(decoded.id, new Set());
        }
        this.clients.get(decoded.id)!.add(ws);

        log(`WebSocket connected: user ${decoded.id}`, "websocket");

        ws.on("pong", () => {
          ws.isAlive = true;
        });

        ws.on("close", () => {
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
        });

        ws.on("error", (error) => {
          log(`WebSocket error: ${error.message}`, "websocket");
        });

        ws.send(JSON.stringify({
          type: "connected",
          message: "Connected to notification service",
        }));

      } catch (error) {
        ws.close(4001, "Invalid token");
        return;
      }
    });

    const interval = setInterval(() => {
      this.wss?.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on("close", () => {
      clearInterval(interval);
    });

    log("WebSocket server initialized", "websocket");
  }

  sendToUser(userId: number, notification: NotificationPayload) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify(notification);
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  sendToAdmins(notification: NotificationPayload) {
    this.clients.forEach((clients, userId) => {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.userRole === "admin") {
          client.send(JSON.stringify(notification));
        }
      });
    });
  }

  sendToPreparers(notification: NotificationPayload) {
    this.clients.forEach((clients, userId) => {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && 
            (client.userRole === "admin" || client.userRole === "preparer")) {
          client.send(JSON.stringify(notification));
        }
      });
    });
  }

  broadcast(notification: NotificationPayload) {
    const message = JSON.stringify(notification);
    this.clients.forEach((clients) => {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  }

  notifyNewMessage(fromUserId: number, toUserId: number, messagePreview: string) {
    this.sendToUser(toUserId, {
      type: "message",
      title: "Nuevo Mensaje",
      message: messagePreview,
      data: { fromUserId },
    });
  }

  notifyCaseStatusChange(clientId: number, caseId: number, newStatus: string, clientName?: string) {
    this.sendToUser(clientId, {
      type: "case_update",
      title: "Estado del Caso Actualizado",
      message: `Su caso ha sido actualizado a: ${newStatus}`,
      data: { caseId, status: newStatus },
    });

    this.sendToPreparers({
      type: "case_update",
      title: "Caso Actualizado",
      message: clientName ? `El caso de ${clientName} ha sido actualizado` : "Un caso ha sido actualizado",
      data: { caseId, status: newStatus },
    });
  }

  notifyDocumentUpload(clientId: number, clientName: string, documentName: string, caseId?: number) {
    this.sendToPreparers({
      type: "document",
      title: "Nuevo Documento",
      message: `${clientName} ha subido: ${documentName}`,
      data: { clientId, documentName, caseId },
    });
  }

  notifyNewAppointment(clientId: number, dateTime: string, service: string) {
    this.sendToUser(clientId, {
      type: "appointment",
      title: "Cita Confirmada",
      message: `Su cita para ${service} ha sido programada`,
      data: { dateTime, service },
    });

    this.sendToPreparers({
      type: "appointment",
      title: "Nueva Cita",
      message: `Nueva cita programada para ${service}`,
      data: { clientId, dateTime, service },
    });
  }

  getConnectedUsersCount(): number {
    return this.clients.size;
  }
}

export const wsService = new WebSocketService();
