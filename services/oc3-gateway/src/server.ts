import { buildApp } from './app';

const port = Number(process.env.OC3_GATEWAY_PORT ?? 4100);
const host = process.env.OC3_GATEWAY_HOST ?? '0.0.0.0';
const app = buildApp();

try {
  await app.listen({ port, host });
  console.log(`[oc3-gateway] seeded gateway listening on http://${host}:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
