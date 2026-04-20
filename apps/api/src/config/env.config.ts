import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_GLOBAL_PREFIX: z.string().default('api'),
  API_VERSION: z.string().default('v1'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  SESSION_SECRET: z
    .string()
    .min(16, 'SESSION_SECRET must be at least 16 characters'),
  SESSION_TTL_SECONDS: z.coerce.number().int().min(60).default(60 * 60 * 24 * 7),
  COOKIE_NAME: z.string().default('au_sid'),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional().transform((v) => (v && v.trim().length ? v : undefined)),

  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),

  EXECUTION_RUNNER: z.enum(['local', 'docker']).default('local'),
  EXECUTION_TIMEOUT_MS: z.coerce.number().int().min(100).max(30_000).default(3000),
  EXECUTION_MEMORY_MB: z.coerce.number().int().min(32).max(2048).default(256),
  EXECUTION_WORKDIR: z.string().default('/tmp/au-judge'),

  DOCKER_IMAGE_C: z.string().default('au-runner-c:latest'),
  DOCKER_IMAGE_CPP: z.string().default('au-runner-cpp:latest'),
  DOCKER_IMAGE_PYTHON: z.string().default('au-runner-python:latest'),
  DOCKER_IMAGE_JS: z.string().default('au-runner-js:latest'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export interface AppConfig {
  nodeEnv: EnvConfig['NODE_ENV'];
  port: number;
  apiGlobalPrefix: string;
  apiVersion: string;
  databaseUrl: string;
  sessionSecret: string;
  sessionTtlSeconds: number;
  cookieName: string;
  cookieSecure: boolean;
  cookieSameSite: 'lax' | 'strict' | 'none';
  cookieDomain?: string;
  webOrigin: string;
  execution: {
    runner: 'local' | 'docker';
    timeoutMs: number;
    memoryMb: number;
    workdir: string;
    dockerImages: {
      C: string;
      CPP: string;
      PYTHON: string;
      JAVASCRIPT: string;
    };
  };
}

export function loadAppConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const messages = parsed.error.errors
      .map((e) => `- ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${messages}`);
  }
  const e = parsed.data;
  return {
    nodeEnv: e.NODE_ENV,
    port: e.PORT,
    apiGlobalPrefix: e.API_GLOBAL_PREFIX,
    apiVersion: e.API_VERSION,
    databaseUrl: e.DATABASE_URL,
    sessionSecret: e.SESSION_SECRET,
    sessionTtlSeconds: e.SESSION_TTL_SECONDS,
    cookieName: e.COOKIE_NAME,
    cookieSecure: e.COOKIE_SECURE,
    cookieSameSite: e.COOKIE_SAMESITE,
    cookieDomain: e.COOKIE_DOMAIN,
    webOrigin: e.WEB_ORIGIN,
    execution: {
      runner: e.EXECUTION_RUNNER,
      timeoutMs: e.EXECUTION_TIMEOUT_MS,
      memoryMb: e.EXECUTION_MEMORY_MB,
      workdir: e.EXECUTION_WORKDIR,
      dockerImages: {
        C: e.DOCKER_IMAGE_C,
        CPP: e.DOCKER_IMAGE_CPP,
        PYTHON: e.DOCKER_IMAGE_PYTHON,
        JAVASCRIPT: e.DOCKER_IMAGE_JS,
      },
    },
  };
}

// Joi is not used; provide a no-op for the ConfigModule validationSchema option.
export const envValidationSchema = undefined;
