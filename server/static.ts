import express, { type Express } from "express";
import fs from "fs";
import path from "path";

/**
 * Obtiene el directorio actual en runtime
 * En Vercel, __dirname puede no estar disponible dependiendo del bundler
 */
function getCurrentDir(): string {
  // @ts-ignore - __dirname está disponible en runtime después del build a CommonJS
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  // Fallback para desarrollo
  return process.cwd();
}

/**
 * Encuentra el directorio de archivos estáticos
 * Intenta múltiples ubicaciones posibles para compatibilidad con diferentes entornos
 */
function findStaticDir(): string | null {
  const currentDir = getCurrentDir();
  const possiblePaths = [
    // Vercel Lambda runtime
    path.resolve("/var/task", "dist", "public"),
    // Desde el directorio del handler (api/)
    path.resolve(currentDir, "..", "dist", "public"),
    // Desde el directorio del handler (api/) - alternativa
    path.resolve(currentDir, "..", "..", "dist", "public"),
    // Desde el working directory
    path.resolve(process.cwd(), "dist", "public"),
    // Desde el directorio actual
    path.resolve(".", "dist", "public"),
    // Vercel build output (cuando se copia a la función)
    path.resolve("/var/task", "public"),
    // Alternativa para Vercel
    path.resolve(process.cwd(), "public"),
  ];

  console.log('[Static] Searching for static files in:', possiblePaths);
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      const indexPath = path.resolve(possiblePath, "index.html");
      if (fs.existsSync(indexPath)) {
        console.log('[Static] Found static directory:', possiblePath);
        return possiblePath;
      } else {
        console.log('[Static] Directory exists but no index.html:', possiblePath);
      }
    }
  }

  console.warn('[Static] Could not find dist/public in any of these paths:', possiblePaths);
  return null;
}

/**
 * Configura el middleware para servir archivos estáticos del frontend
 * En Vercel, esto solo se ejecuta cuando las rutas no-API llegan al handler
 */
export function serveStatic(app: Express) {
  const distPath = findStaticDir();

  if (!distPath) {
    console.error('[Static] ERROR: Static files directory not found!');
    console.error('[Static] Current working directory:', process.cwd());
    console.error('[Static] __dirname:', typeof __dirname !== 'undefined' ? __dirname : 'undefined');
    
    // En Vercel, si no encontramos los archivos, puede ser que Vercel los esté sirviendo automáticamente
    // En ese caso, solo necesitamos manejar el fallback a index.html para SPA routing
    console.warn('[Static] Assuming Vercel is serving static files automatically');
    
    // Solo configurar el fallback a index.html para SPA routing
    app.use("*", (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      
      // Si llegamos aquí y no hay respuesta, es porque Vercel no encontró el archivo
      // En Vercel, esto no debería pasar porque Vercel debería servir los archivos automáticamente
      console.warn('[Static] Non-API route reached handler but no static files found:', req.path);
      res.status(404).json({ 
        error: "Frontend not found",
        message: "The frontend files were not found. Please ensure the build completed successfully.",
        path: req.path
      });
    });
    
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
    const filePath = path.resolve(distPath, req.path.slice(1)); // Remover el / inicial
    
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
      console.log('[Static] Serving index.html for SPA route:', req.path);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('[Static] Error sending index.html:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: "Error serving frontend" });
          }
        } else {
          console.log('[Static] Successfully served index.html');
        }
      });
    } else {
      console.error('[Static] index.html not found at:', indexPath);
      if (!res.headersSent) {
        res.status(404).json({ 
          error: "Frontend not built",
          message: "index.html not found. Please ensure the build completed successfully.",
          indexPath
        });
      }
    }
  });
}
