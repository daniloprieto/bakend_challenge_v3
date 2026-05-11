import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { databaseConfig } from './database-config.js';
import { postgresPool } from './postgres-pool.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsPath = path.resolve(dirname, '../../../database/migrations');
const expectedLocalDatabase = {
  database: 'emergencias_challenge',
  host: 'localhost',
  port: 5433,
};

function assertSafeMigrationTarget(): void {
  const isExpectedLocalDatabase =
    databaseConfig.host === expectedLocalDatabase.host &&
    databaseConfig.port === expectedLocalDatabase.port &&
    databaseConfig.database === expectedLocalDatabase.database;

  if (!isExpectedLocalDatabase) {
    throw new Error(
      [
        'Refusing to run migrations against a non-challenge database.',
        `Current target: ${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`,
        `Expected target: ${expectedLocalDatabase.host}:${expectedLocalDatabase.port}/${expectedLocalDatabase.database}`,
      ].join(' '),
    );
  }
}

async function ensureMigrationsTable(): Promise<void> {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await postgresPool.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations ORDER BY filename',
  );

  return new Set(result.rows.map((row) => row.filename));
}

async function runMigration(filename: string): Promise<void> {
  const migration = await readFile(path.join(migrationsPath, filename), 'utf8');
  const client = await postgresPool.connect();

  try {
    await client.query('BEGIN');
    await client.query(migration);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [
      filename,
    ]);
    await client.query('COMMIT');
    console.log(`Applied migration ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function migrate(): Promise<void> {
  assertSafeMigrationTarget();
  await ensureMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const migrationFiles = (await readdir(migrationsPath))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const filename of migrationFiles) {
    if (!executedMigrations.has(filename)) {
      await runMigration(filename);
    }
  }

  console.log('Database migrations are up to date');
}

migrate()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await postgresPool.end();
  });
