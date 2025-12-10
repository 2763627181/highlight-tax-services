import { createApp } from '../server/app';
import { serveStatic } from '../server/static';
// @ts-ignore - serverless-http no tiene tipos oficiales
import serverless from 'serverless-http';

let app: any = null;
let handler: any = null;

export default async function handlerFn(req: any, res: any) {
  if (!app) {
    console.log('[API] Initializing Express app for Vercel...');
    app = await createApp(undefined);
    
    // En producción, servir archivos estáticos DESPUÉS de las rutas API
    // Esto asegura que /api/* tenga prioridad sobre archivos estáticos
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
      serveStatic(app);
    }
    
    // Crear el handler serverless
    handler = serverless(app, {
      binary: ['image/*', 'application/pdf', 'application/octet-stream'],
    });
    
    console.log('[API] Express app initialized successfully');
  }
  
  return handler(req, res);
}
