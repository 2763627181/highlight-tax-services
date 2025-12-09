import { createApp } from '../server/app';

let app: any = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    console.log('[API] Initializing Express app...');
    app = await createApp(undefined);
    console.log('[API] Express app initialized successfully');
  }
  return app(req, res);
}
