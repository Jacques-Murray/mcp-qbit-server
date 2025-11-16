// Author: Jacques Murray

/**
 * Loads and exposes configuration from environment variables.
 */
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  QBIT_BASE_URL: z.string({
    required_error: 'QBIT_BASE_URL is required',
  }).url('QBIT_BASE_URL must be a valid URL (e.g., http://localhost:8080)'),
  QBIT_USERNAME: z.string({
    required_error: 'QBIT_USERNAME is required',
  }).min(1, 'QBIT_USERNAME cannot be empty'),
  QBIT_PASSWORD: z.string({
    required_error: 'QBIT_PASSWORD is required',
  }).min(1, 'QBIT_PASSWORD cannot be empty'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('[config] Invalid environment configuration:', parsedEnv.error.format());
  throw new Error('Missing or invalid qBittorrent configuration.');
}

const env = parsedEnv.data;

module.exports = {
  port: env.PORT,
  qbit: {
    baseUrl: env.QBIT_BASE_URL,
    username: env.QBIT_USERNAME,
    password: env.QBIT_PASSWORD,
  }
}