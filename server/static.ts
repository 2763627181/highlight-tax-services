import express, { type Express } from "express";
import fs from "fs";
import path from "path";

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
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath!, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });
}
