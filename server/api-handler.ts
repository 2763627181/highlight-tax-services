import { createApp } from '../server/app';
import { serveStatic } from '../server/static';
// @ts-ignore - serverless-http no tiene tipos oficiales
import serverless from 'serverless-http';

let app: any = null;
let handler: any = null;
let initError: Error | null = null;

async function handlerFn(req: any, res: any) {
  // NO forzar Content-Type aquí - dejar que Express lo maneje
  // Esto permite que los archivos estáticos se sirvan con sus tipos MIME correctos

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
      console.log('[API] ========== INITIALIZING ==========');
      console.log('[API] Initializing Express app for Vercel...');
      console.log('[API] Environment check:', {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSessionSecret: !!process.env.SESSION_SECRET,
        nodeEnv: process.env.NODE_ENV,
        hasViteAppUrl: !!process.env.VITE_APP_URL,
      });
      
      // Validar variables críticas antes de continuar
      const missingVars: string[] = [];
      if (!process.env.DATABASE_URL) {
        missingVars.push('DATABASE_URL');
      }
      if (!process.env.SESSION_SECRET) {
        missingVars.push('SESSION_SECRET');
      }
      if (missingVars.length > 0) {
        const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
        console.error('[API]', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Crear la app Express
      console.log('[API] Creating Express app...');
      app = await createApp(undefined);
      console.log('[API] Express app created successfully');
      
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
      console.error('[API] ========== CRITICAL ERROR ==========');
      console.error('[API] Error initializing Express app:', err.message);
      console.error('[API] Error name:', err.name);
      console.error('[API] Error stack:', err.stack);
      console.error('[API] Environment at error:', {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSessionSecret: !!process.env.SESSION_SECRET,
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd(),
        vercel: !!process.env.VERCEL,
      });
      console.error('[API] =====================================');
      initError = err;
      
      // En Vercel, siempre mostrar el mensaje de error completo para debugging
      // @ts-ignore - process está disponible en runtime
      const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      const isVercel = !!process.env.VERCEL;
      
      // En Vercel, mostrar más detalles para debugging
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Server initialization failed',
          message: (isProduction && !isVercel) 
            ? 'Internal server error' 
            : err.message,
          stack: (isProduction && !isVercel) ? undefined : err.stack,
          // En Vercel, incluir información adicional para debugging
          ...(isVercel ? {
            environment: {
              hasDatabaseUrl: !!process.env.DATABASE_URL,
              hasSessionSecret: !!process.env.SESSION_SECRET,
              nodeEnv: process.env.NODE_ENV,
            }
          } : {})
        });
      }
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
