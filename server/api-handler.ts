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

  // Log de inicio de petición para debugging en Vercel
  const startTime = Date.now();
  console.log(`[API] Request started: ${req.method} ${req.path || req.url} at ${new Date().toISOString()}`);

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
      
      // Crear el handler serverless con configuración optimizada para Vercel
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf', 'application/octet-stream'],
        // Aumentar timeout para cold starts en Vercel
        requestId: 'x-vercel-id',
        // Manejar errores de timeout mejor
        response: {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
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
  
  // Ejecutar el handler con timeout para evitar que se cuelgue
  try {
    if (!handler) {
      throw new Error('Handler no está inicializado');
    }
    
    // Timeout de 55 segundos (menos que el maxDuration de 60s para dar margen)
    const handlerTimeout = 55000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Handler timeout after ${handlerTimeout}ms`));
      }, handlerTimeout);
    });

    const handlerPromise = handler(req, res);
    
    // Race entre el handler y el timeout
    const result = await Promise.race([handlerPromise, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    const path = req.path || req.url || '';
    console.log(`[API] Request completed: ${req.method} ${path} in ${duration}ms`);
    
    // Asegurar que la respuesta se haya enviado
    // SOLO para rutas API - no interferir con rutas del frontend
    if (!res.headersSent && !res.writableEnded) {
      // Solo enviar respuesta por defecto para rutas API
      if (path.startsWith('/api/')) {
        console.warn('[API] Warning: API route response not sent, sending default response');
        res.status(200).json({ message: 'OK' });
      } else {
        // Para rutas no-API (frontend), verificar si static.ts ya manejó la respuesta
        // Si no se envió respuesta, puede ser que static.ts no encontró el archivo
        // En ese caso, intentar servir index.html manualmente
        console.warn('[API] Warning: Non-API route response not sent:', path);
        console.log('[API] Attempting to serve index.html for SPA route');
        
        // Intentar servir index.html para SPA routing
        try {
          const fs = await import('fs');
          const pathModule = await import('path');
          const possiblePaths = [
            pathModule.resolve(process.cwd(), 'dist', 'public', 'index.html'),
            pathModule.resolve(process.cwd(), '..', 'dist', 'public', 'index.html'),
            pathModule.resolve('/var/task', 'dist', 'public', 'index.html'),
          ];
          
          let indexPath: string | null = null;
          for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
              indexPath = possiblePath;
              break;
            }
          }
          
          if (indexPath) {
            console.log('[API] Serving index.html from:', indexPath);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            const html = fs.readFileSync(indexPath, 'utf-8');
            res.send(html);
          } else {
            console.error('[API] index.html not found in any of these paths:', possiblePaths);
            res.status(404).json({ 
              error: 'Frontend not found',
              message: 'The frontend files were not found. Please ensure the build completed successfully.'
            });
          }
        } catch (staticError) {
          console.error('[API] Error serving static file:', staticError);
          res.status(500).json({ 
            error: 'Error serving frontend',
            message: 'Could not serve the frontend application'
          });
        }
      }
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] Error in handler execution after ${duration}ms:`, error);
    const err = error as Error;
    
    // Asegurar que siempre se envíe una respuesta
    if (!res.headersSent && !res.writableEnded) {
      // @ts-ignore - process está disponible en runtime
      const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      res.status(500).json({ 
        error: 'Handler execution failed',
        message: isProduction 
          ? 'Internal server error' 
          : err.message,
        stack: isProduction ? undefined : err.stack,
        duration: `${duration}ms`
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
