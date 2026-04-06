import { z } from 'zod';

// Keys must match exact env var names — NestJS passes raw process.env to validate()
// z.coerce.number() converts string env vars to numbers (env vars are always strings)
const envSchema = z.object({
  PORT: z.coerce.number().positive().max(65535).default(3004),
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  // JAL SSO — required credentials for redirecting users into JAL's booking portal
  JAL_SSO_URL: z.string().url(),
  JAL_SEAMLESS_ID: z.string().min(1),
  JAL_ACCESS_CODE: z.string().min(1),
  JAL_ACUD_ID: z.string().min(1),
  JAL_ACUD_PASSWORD: z.string().min(1),
});

/**
 * Validates environment variables at startup using zod.
 * Fail-fast: app refuses to start if config is invalid.
 * Called by ConfigModule.forRoot({ validate }) during bootstrap.
 * @throws Error with readable field-level messages on validation failure
 */
export function validate(
  config: Record<string, unknown> | undefined,
): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(config ?? {});

  if (!result.success) {
    const messages = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(
      `Invalid environment configuration:\n${messages.join('\n')}`,
    );
  }

  return result.data;
}
