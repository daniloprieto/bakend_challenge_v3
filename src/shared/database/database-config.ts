import { env } from '../config/env.js';

const databaseUrl = new URL(env.DATABASE_URL);

export const databaseConfig = {
  connectionString: env.DATABASE_URL,
  database: databaseUrl.pathname.replace('/', ''),
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 5432),
};
