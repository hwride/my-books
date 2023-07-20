import zod from 'zod'

const clientSchema = zod.object({
  NEXT_PUBLIC_SENTRY_DSN: zod.string(),
  NEXT_PUBLIC_HTTP: zod.boolean().optional(),
  NEXT_PUBLIC_VERCEL_URL: zod.string(),
})

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_HTTP: process.env.NEXT_PUBLIC_HTTP,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
})
