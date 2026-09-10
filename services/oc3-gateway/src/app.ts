import Fastify from 'fastify';
import { seededHealth } from './health';

export function buildApp() {
  const app = Fastify({ logger: false });

  app.get('/health', async () => seededHealth);

  return app;
}
