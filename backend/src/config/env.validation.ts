import { z } from 'zod';

// Keys must match exact env var names — NestJS passes raw process.env to validate()
// z.coerce.number() converts string env vars to numbers (env vars are always strings)
export const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().max(65535).default(3004),
    NODE_ENV: z
      .enum(['development', 'staging', 'production', 'test'])
      .default('development'),

    // JAL SSO — required credentials for redirecting users into JAL's booking portal
    JAL_SSO_URL: z.string().url(),
    JAL_SEAMLESS_ID: z.string().trim().min(1),
    JAL_ACCESS_CODE: z.string().trim().min(1),
    JAL_ACUD_ID: z.string().trim().min(1),
    JAL_ACUD_PASSWORD: z.string().trim().min(1),

    // JAL SOAP — RetrieveProcedure service WSDL + corporate id for in0 + optional HTTP Basic auth
    JAL_SOAP_WSDL_URL: z.string().url(),
    /** Corporate ID sent as SOAP `in0` (collection uses C0050874 for RetrieveProcedure) */
    JAL_SOAP_CORPORATE_ID: z.string().trim().min(1),
    JAL_SOAP_BASIC_USER: z.string().trim().min(1).optional(),
    JAL_SOAP_BASIC_PASSWORD: z.string().trim().min(1).optional(),
    /** SOAP operation name without `Async` suffix (default: getRecordDetailFromProject) */
    JAL_SOAP_RETRIEVE_OPERATION: z
      .string()
      .trim()
      .min(1)
      .default('getRecordDetailFromProject'),
    /** SOAP HTTP request timeout in milliseconds (default: 30 000 ms) */
    JAL_SOAP_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  })
  .refine(
    (env) =>
      (!env.JAL_SOAP_BASIC_USER && !env.JAL_SOAP_BASIC_PASSWORD) ||
      (Boolean(env.JAL_SOAP_BASIC_USER) &&
        Boolean(env.JAL_SOAP_BASIC_PASSWORD)),
    {
      message:
        'JAL_SOAP_BASIC_USER and JAL_SOAP_BASIC_PASSWORD must both be set or both omitted',
      path: ['JAL_SOAP_BASIC_USER'],
    },
  );

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables at startup using zod.
 * Fail-fast: app refuses to start if config is invalid.
 * Called by ConfigModule.forRoot({ validate }) during bootstrap.
 * @throws Error with readable field-level messages on validation failure
 */
export function validate(
  config: Record<string, unknown> | undefined,
): EnvConfig {
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
