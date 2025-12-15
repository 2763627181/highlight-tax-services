/**
 * Health check endpoint optimizado para respuesta ultra-rápida
 * No hace queries a la base de datos, solo verifica que el servidor responde
 */

import { Request, Response } from "express";

export function setupHealthCheck(app: any) {
  // Health check básico - responde inmediatamente sin queries
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: Date.now(),
      uptime: process.uptime()
    });
  });
  
  // Health check extendido (opcional, para monitoreo)
  app.get("/health/detailed", async (_req: Request, res: Response) => {
    try {
      const { db } = await import("./db");
      // Query simple y rápida
      await db.execute("SELECT 1");
      res.status(200).json({ 
        status: "ok", 
        database: "connected",
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(503).json({ 
        status: "degraded", 
        database: "disconnected",
        timestamp: Date.now()
      });
    }
  });
}

