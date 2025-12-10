import { createApp } from '../server/app';
import { serveStatic } from '../server/static';
// @ts-ignore - serverless-http no tiene tipos oficiales
import serverless from 'serverless-http';

let app: any = null;
let handler: any = null;
let initError: Error | null = null;

async function handlerFn(req: any, res: any) {
  // Si ya hubo un error de inicialización, devolverlo
  if (initError) {
    console.error('[API] Returning initialization error:', initError);
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : initError.message 
    });
    return;
  }

  // Inicializar la app si no está inicializada
  if (!app) {
    try {
      console.log('[API] Initializing Express app for Vercel...');
      
      // Crear la app Express
      app = await createApp(undefined);
      
      // En producción, servir archivos estáticos DESPUÉS de las rutas API
      // Esto asegura que /api/* tenga prioridad sobre archivos estáticos
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
        try {
          serveStatic(app);
        } catch (staticError) {
          console.warn('[API] Warning: Could not serve static files:', staticError);
          // No fallar si no se pueden servir archivos estáticos
        }
      }
      
      // Crear el handler serverless
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf', 'application/octet-stream'],
      });
      
      console.log('[API] Express app initialized successfully');
    } catch (error) {
      console.error('[API] Error initializing Express app:', error);
      initError = error as Error;
      res.status(500).json({ 
        error: 'Server initialization failed',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : (error as Error).message 
      });
      return;
    }
  }
  
  // Ejecutar el handler
  try {
    return await handler(req, res);
  } catch (error) {
    console.error('[API] Error in handler execution:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Handler execution failed',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : (error as Error).message 
      });
    }
  }
}

// Exportar como default - esbuild lo convertirá a module.exports en CommonJS
export default handlerFn;
