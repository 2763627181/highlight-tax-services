import express, { type Express } from "express";
import fs from "fs";
import path from "path";

/**
 * Obtiene el directorio actual en runtime
 */
function getCurrentDir(): string {
  // @ts-ignore - __dirname está disponible en runtime después del build a CommonJS
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  return process.cwd();
}

/**
 * Encuentra el directorio de archivos estáticos
 * Solo para desarrollo local - en Vercel no se usa
 */
function findStaticDir(): string | null {
  const currentDir = getCurrentDir();
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(currentDir, "..", "dist", "public"),
    path.resolve(currentDir, "..", "..", "dist", "public"),
    path.resolve(".", "dist", "public"),
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      const indexPath = path.resolve(possiblePath, "index.html");
      if (fs.existsSync(indexPath)) {
        return possiblePath;
      }
    }
  }

  return null;
}

/**
 * Configura el middleware para servir archivos estáticos del frontend
 * SOLO para desarrollo local - en Vercel los archivos se sirven automáticamente
 */
export function serveStatic(app: Express) {
  // En Vercel, no servir archivos estáticos desde aquí
  if (process.env.VERCEL) {
    console.log('[Static] Skipping static file serving - Vercel handles this automatically');
    return;
  }

  const distPath = findStaticDir();

  if (!distPath) {
    console.error('[Static] ERROR: Static files directory not found!');
    console.error('[Static] Current working directory:', process.cwd());
    return;
  }

  console.log('[Static] Serving static files from:', distPath);
  
  // Middleware para servir archivos estáticos (CSS, JS, imágenes, etc.)
  app.use((req, res, next) => {
    // Si es una ruta API, saltar el middleware de archivos estáticos
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Intentar servir el archivo estático
    const filePath = path.resolve(distPath, req.path.slice(1));
    
    // Si el archivo existe y no es un directorio, servirlo
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return express.static(distPath)(req, res, next);
    }
    
    // Si no existe, continuar al siguiente middleware (SPA routing)
    next();
  });

  // Fallback a index.html para SPA routing (solo para rutas no-API)
  app.use("*", (req, res, next) => {
    // NO intentar servir index.html para rutas API
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Para rutas no-API, servir index.html (SPA routing)
    const indexPath = path.resolve(distPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('[Static] Error sending index.html:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error serving frontend" });
          }
        }
      });
    } else {
      console.error('[Static] index.html not found at:', indexPath);
      if (!res.headersSent) {
        res.status(404).json({ 
          error: "Frontend not built",
          message: "index.html not found. Please run 'npm run build'"
        });
      }
    }
  });
}
