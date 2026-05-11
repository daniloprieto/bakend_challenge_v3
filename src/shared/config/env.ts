import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  API_PREFIX: z.string().min(1).default('/api'),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgres://challenge:challenge@localhost:5433/emergencias_challenge'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export const env = envSchema.parse(process.env);
