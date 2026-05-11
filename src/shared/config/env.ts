import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  API_PREFIX: z.string().min(1).default('/api'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export const env = envSchema.parse(process.env);
