import pg from 'pg';

import { databaseConfig } from './database-config.js';

const { Pool } = pg;

export const postgresPool = new Pool({
  connectionString: databaseConfig.connectionString,
});

export async function closePostgresPool(): Promise<void> {
  await postgresPool.end();
}
