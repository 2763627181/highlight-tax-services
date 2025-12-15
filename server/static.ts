import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Cachear index.html en memoria para evitar lecturas de disco repetidas
let cachedIndexHtml: string | null = null;
let cachedIndexPath: string | null = null;

function getIndexHtml(distPath: string): string | null {
  const indexPath = path.resolve(distPath, "index.html");
  
  // Si el path cambió o no está cacheado, leerlo
  if (cachedIndexHtml === null || cachedIndexPath !== indexPath) {
    try {
      if (fs.existsSync(indexPath)) {
        cachedIndexHtml = fs.readFileSync(indexPath, "utf-8");
        cachedIndexPath = indexPath;
        console.log(`[Static] Cached index.html from: ${indexPath}`);
      } else {
        return null;
      }
    } catch (error) {
      console.error(`[Static] Error reading index.html:`, error);
      return null;
    }
  }
  
  return cachedIndexHtml;
}

export function serveStatic(app: Express) {
  // En Vercel, el directorio de trabajo es la raíz del proyecto
  // Los archivos estáticos están en dist/public
  // Intentar múltiples rutas posibles
  const possiblePaths = [
    path.resolve(__dirname, "public"), // Desarrollo local
    path.resolve(__dirname, "../dist/public"), // Vercel (desde api/handler.js compilado)
    path.resolve(process.cwd(), "dist/public"), // Vercel (desde raíz)
    path.resolve(process.cwd(), "public"), // Fallback
  ];

  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      break;
    }
  }

  if (!distPath) {
    console.error("Could not find the build directory. Tried paths:", possiblePaths);
    // No lanzar error, solo loguear para que Vercel pueda servir los archivos estáticos directamente
    return;
  }

  console.log(`Serving static files from: ${distPath}`);
  
  // Pre-cachear index.html al inicializar
  getIndexHtml(distPath);
  
  // Servir archivos estáticos (JS, CSS, imágenes, etc.)
  app.use(express.static(distPath, {
    // No servir index.html aquí, lo haremos manualmente para rutas SPA
    index: false,
    // Cachear archivos estáticos por 1 año (son versionados por Vite)
    maxAge: 31536000, // 1 año en segundos
  }));

  // Servir index.html para todas las rutas que NO sean /api/*
  // Esto permite que el frontend React maneje el routing (SPA)
  // Usar app.use con función para capturar todas las rutas no manejadas
  app.use((req, res, next) => {
    // Si es una ruta de API, pasar al siguiente middleware (debería haber sido manejada)
    if (req.path.startsWith("/api/")) {
      return next();
    }
    
    // Si es un archivo estático (tiene extensión), intentar servirlo primero
    if (req.path.match(/\.[\w]+$/)) {
      // Express.static ya intentó servirlo, si llegamos aquí es que no existe
      return next();
    }
    
    // Para todas las demás rutas (/, /portal, /admin, /dashboard, etc.)
    // servir index.html desde cache (muy rápido)
    const indexHtml = getIndexHtml(distPath!);
    if (indexHtml) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(indexHtml);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });
}
