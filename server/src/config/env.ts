import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().default('peoplebooks_dev_jwt_secret_key_2026_super_secure'),
  PLATFORM_COMMISSION_PERCENT: z.coerce.number().default(20), // 20% to PeopleBooks, 80% to Author
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);

