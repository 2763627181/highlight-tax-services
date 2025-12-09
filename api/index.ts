import serverless from 'serverless-http';
import { createApp } from '../server/app';

let handler: any;

export default async function (req: any, res: any) {
  if (!handler) {
    const app = await createApp(undefined);
    handler = serverless(app);
  }
  return handler(req, res);
}
