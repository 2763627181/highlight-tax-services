import { createApp } from '../server/app';
import { serveStatic } from '../server/static';
// @ts-ignore - serverless-http no tiene tipos oficiales
import serverless from 'serverless-http';

let app: any = null;
let handler: any = null;
let initError: Error | null = null;

async function handlerFn(req: any, res: any) {
  // Log de inicio de petición para debugging en Vercel
  const startTime = Date.now();
  
  // Preservar el método HTTP original - CRÍTICO para que las rutas funcionen
  const originalMethod = req.method;
  
  // En Vercel con rewrites, cuando se hace rewrite de /api/* a /api/handler,
  // la ruta original viene en req.url pero puede estar en diferentes formatos
  // Vercel preserva la ruta original en req.url después del rewrite
  let path = req.url || req.path || '';
  
  // Log detallado para debugging
  console.log('[API] Raw request info:', {
    method: req.method,
    url: req.url,
    path: req.path,
    originalUrl: req.originalUrl,
    query: req.query,
    headers: {
      'x-vercel-original-path': req.headers['x-vercel-original-path'],
      'x-original-url': req.headers['x-original-url'],
    }
  });
  
  // Si el path es /api/handler o /handler, significa que Vercel hizo el rewrite
  // En este caso, la ruta original debería estar en req.originalUrl o podemos extraerla
  // Pero en realidad, con rewrites de Vercel, req.url debería tener la ruta original
  // Si no, intentar obtenerla de headers o usar una ruta por defecto
  if (path === '/api/handler' || path === '/handler' || !path.startsWith('/api/')) {
    // Intentar obtener la ruta real de diferentes fuentes
    const originalPath = req.originalUrl || 
                        req.headers['x-vercel-original-path'] || 
                        req.headers['x-original-url'] ||
                        (req.query && req.query.path);
    
    if (originalPath) {
      path = originalPath;
    } else {
      // Si no podemos determinar la ruta, usar /api como fallback
      // Esto debería ser raro, pero es mejor que fallar completamente
      path = '/api';
      console.warn('[API] Could not determine original path, using /api as fallback');
    }
  }
  
  // Normalizar el path - asegurarnos de que tenga el formato correcto
  let normalizedPath = path;
  
  // Remover query string si existe
  if (normalizedPath.includes('?')) {
    normalizedPath = normalizedPath.split('?')[0];
  }
  
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // Asegurar que todas las rutas que llegan aquí tengan el prefijo /api/
  // (excepto si es exactamente /api)
  if (!normalizedPath.startsWith('/api/') && normalizedPath !== '/api') {
    normalizedPath = `/api${normalizedPath}`;
  }
  
  // CRÍTICO: Asegurar que el método HTTP se preserve
  // serverless-http a veces puede cambiar el método, así que lo restauramos
  req.method = originalMethod;
  
  // Actualizar req.path y req.url para que Express maneje correctamente las rutas
  req.path = normalizedPath;
  req.url = normalizedPath;
  
  console.log(`[API] Request started: ${req.method} ${normalizedPath} (original: ${path}) at ${new Date().toISOString()}`);

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
      
      // En Vercel, NO servir archivos estáticos desde el handler
      // Vercel los sirve automáticamente desde outputDirectory (dist/public)
      // Solo servir estáticos en desarrollo local
      const isVercel = !!process.env.VERCEL;
      const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      
      if (!isVercel && !isProduction) {
        // Solo en desarrollo local, servir archivos estáticos
        try {
          serveStatic(app);
        } catch (staticError) {
          console.warn('[API] Warning: Could not serve static files:', staticError);
        }
      } else {
        console.log('[API] Skipping static file serving - Vercel handles this automatically');
      }
      
      // NO agregar catch-all aquí - debe estar después de todas las rutas
      // El catch-all se agregará en app.ts después de que todas las rutas estén registradas
      
      // Crear el handler serverless con configuración optimizada para Vercel
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf', 'application/octet-stream'],
        // Preservar el método HTTP original
        requestId: 'x-vercel-id',
        // Configuración para manejar correctamente los métodos HTTP y el body
        basePath: '', // No usar basePath para que las rutas funcionen correctamente
        // Manejar errores de timeout mejor
        response: {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
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
  
  // CRÍTICO: Preservar el método HTTP ANTES de que serverless-http lo procese
  // El problema es que serverless-http puede cambiar POST a GET en ciertos casos
  const preservedMethod = req.method || 'GET';
  
  console.log(`[API] Preserving method: ${preservedMethod} for path: ${normalizedPath}`);
  
  // Guardar el método en un header personalizado que Express puede leer
  // Esto es necesario porque serverless-http puede cambiar el método
  req.headers['x-preserved-http-method'] = preservedMethod;

  // Ejecutar el handler - NO usar timeout manual, dejar que Vercel lo maneje
  try {
    if (!handler) {
      throw new Error('Handler no está inicializado');
    }

    // Ejecutar el handler directamente
    // El método se restaurará en el middleware de Express usando el header
    // Vercel maneja el timeout automáticamente según maxDuration
    
    // Interceptar res.end para detectar cuando la respuesta se completa
    let responseComplete = false;
    const originalEnd = res.end;
    
    // Crear promesa que se resuelve cuando res.end se llama
    const responsePromise = new Promise<void>((resolve) => {
      res.end = function(...args: any[]) {
        responseComplete = true;
        const result = originalEnd.apply(this, args);
        resolve();
        return result;
      };
    });
    
    // Ejecutar el handler
    const handlerResult = await handler(req, res);
    
    // Si la respuesta ya fue enviada, marcar como completa
    if (res.headersSent || res.writableEnded || res.finished) {
      responseComplete = true;
    }
    
    // Esperar un poco a que la respuesta se complete (máximo 500ms)
    // Esto permite que Express termine de procesar antes de verificar
    await Promise.race([
      responsePromise,
      new Promise(resolve => setTimeout(resolve, 500))
    ]);
    
    const duration = Date.now() - startTime;
    const finalPath = req.path || req.url || path;
    
    // Verificar si la respuesta fue enviada
    // Solo mostrar warning si realmente no se envió nada
    const isResponseSent = res.headersSent || res.writableEnded || res.finished || responseComplete;
    
    if (!isResponseSent) {
      console.warn(`[API] Warning: API route response not sent: ${req.method} ${finalPath}`);
      // Solo enviar respuesta de error si realmente no se envió nada
      if (!res.headersSent && !res.writableEnded) {
        res.status(500).json({ 
          error: 'Internal server error',
          message: 'The API route did not send a response'
        });
      }
    } else {
      console.log(`[API] Request completed: ${req.method} ${finalPath} in ${duration}ms (status: ${res.statusCode || 'unknown'})`);
    }
    
    return handlerResult;
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
    
    // Re-lanzar el error para que Vercel lo maneje
    throw error;
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
