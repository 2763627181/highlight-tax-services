import { createApp } from '../server/app';
import { serveStatic } from '../server/static';
// @ts-ignore - serverless-http no tiene tipos oficiales
import serverless from 'serverless-http';

let app: any = null;
let handler: any = null;
let initError: Error | null = null;

async function handlerFn(req: any, res: any) {
  // Asegurar que siempre devolvamos JSON
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json');
  }

  // Si ya hubo un error de inicialización, devolverlo
  if (initError) {
    console.error('[API] Returning initialization error:', initError);
    console.error('[API] Error stack:', initError.stack);
    // @ts-ignore - process está disponible en runtime
    const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Server initialization failed',
        message: isProduction 
          ? 'Internal server error' 
          : initError.message,
        stack: isProduction ? undefined : initError.stack
      });
    }
    return;
  }

  // Inicializar la app si no está inicializada
  if (!app || !handler) {
    try {
      console.log('[API] Initializing Express app for Vercel...');
      
      // Crear la app Express
      app = await createApp(undefined);
      
      // En producción, servir archivos estáticos DESPUÉS de las rutas API
      // Esto asegura que /api/* tenga prioridad sobre archivos estáticos
      // @ts-ignore - process está disponible en runtime
      const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      if (isProduction) {
        try {
          serveStatic(app);
        } catch (staticError) {
          console.warn('[API] Warning: Could not serve static files:', staticError);
          // No fallar si no se pueden servir archivos estáticos
        }
      }
      
      // Catch-all para rutas API no encontradas (después de serveStatic)
      // Solo para rutas /api/* que no fueron manejadas
      app.use('/api/*', (_req: any, res: any) => {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json');
          res.status(404).json({ message: "Ruta API no encontrada" });
        }
      });
      
      // Crear el handler serverless
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf', 'application/octet-stream'],
      });
      
      console.log('[API] Express app initialized successfully');
    } catch (error) {
      const err = error as Error;
      console.error('[API] Error initializing Express app:', err.message);
      console.error('[API] Error stack:', err.stack);
      initError = err;
      // @ts-ignore - process está disponible en runtime
      const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      res.status(500).json({ 
        error: 'Server initialization failed',
        message: isProduction 
          ? 'Internal server error' 
          : err.message,
        stack: isProduction ? undefined : err.stack
      });
      return;
    }
  }
  
  // Ejecutar el handler
  try {
    if (!handler) {
      throw new Error('Handler no está inicializado');
    }
    return await handler(req, res);
  } catch (error) {
    console.error('[API] Error in handler execution:', error);
    const err = error as Error;
    if (!res.headersSent) {
      // @ts-ignore - process está disponible en runtime
      const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      res.status(500).json({ 
        error: 'Handler execution failed',
        message: isProduction 
          ? 'Internal server error' 
          : err.message,
        stack: isProduction ? undefined : err.stack
      });
    }
  }
}

// Wrapper para capturar errores no manejados
const wrappedHandler = async (req: any, res: any) => {
  try {
    return await handlerFn(req, res);
  } catch (error) {
    console.error('[API] Unhandled error in wrapped handler:', error);
    const err = error as Error;
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      res.status(500).json({
        error: 'Unhandled server error',
        message: isProduction ? 'Internal server error' : err.message,
        stack: isProduction ? undefined : err.stack
      });
    }
  }
};

// Exportar como default - esbuild lo convertirá a module.exports en CommonJS
export default wrappedHandler;
