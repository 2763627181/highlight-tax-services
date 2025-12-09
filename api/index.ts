import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import { createApp } from '../server/app';

let handler: ReturnType<typeof serverless> | null = null;

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    if (!handler) {
      console.log('[API] Initializing Express app...');
      const app = await createApp(undefined);
      handler = serverless(app);
      console.log('[API] Express app initialized successfully');
    }
    return handler(req, res);
  } catch (error: any) {
    console.error('[API] Error:', error?.message || error);
    console.error('[API] Stack:', error?.stack);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined 
    });
  }
}
