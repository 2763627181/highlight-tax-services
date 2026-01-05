import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Obtener __dirname - después del build con esbuild a CommonJS, __dirname está disponible
// Usamos una función que se ejecuta en runtime para obtener el directorio actual
function getCurrentDir(): string {
  // @ts-ignore - __dirname está disponible en runtime después del build a CommonJS
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  // Fallback para desarrollo (aunque no debería llegar aquí)
  return process.cwd();
}

export function serveStatic(app: Express) {
  // Intentar múltiples rutas posibles para dist/public
  // Esto es necesario porque en Vercel el path puede variar
  const currentDir = getCurrentDir();
  const possiblePaths = [
    path.resolve(currentDir, "..", "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve("/var/task", "dist", "public"), // Vercel Lambda
    path.resolve(".", "dist", "public"),
  ];

  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      break;
    }
  }

  if (!distPath) {
    console.warn('[Static] Could not find dist/public, trying:', possiblePaths);
    // En Vercel, intentar servir desde el directorio actual como fallback
    distPath = path.resolve(process.cwd(), "dist", "public");
  }

  console.log('[Static] Serving static files from:', distPath);
  
  // Servir archivos estáticos SOLO para rutas que NO sean API
  app.use((req, res, next) => {
    // Si es una ruta API, saltar el middleware de archivos estáticos
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Continuar con express.static para rutas no-API
    express.static(distPath)(req, res, next);
  });

  // fall through to index.html if the file doesn't exist (SPA routing)
  // PERO solo para rutas que NO sean API
  app.use("*", (req, res, next) => {
    // NO intentar servir index.html para rutas API
    if (req.path.startsWith('/api/')) {
      // Si llegamos aquí, es una ruta API no encontrada
      // Esto no debería pasar porque las rutas API deberían estar manejadas antes
      console.warn('[Static] Catch-all captured API route:', req.method, req.path, '- This should not happen!');
      // NO responder aquí - dejar que el catch-all de API lo maneje
      return next();
    }
    
    // Para rutas no-API, intentar servir index.html (SPA routing)
    const indexPath = path.resolve(distPath!, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('[Static] index.html not found at:', indexPath);
      if (!res.headersSent) {
        res.status(404).json({ error: "Frontend not built. Please run 'npm run build'" });
      }
    }
  });
}
