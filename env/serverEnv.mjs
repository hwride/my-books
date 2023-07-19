import zod from 'zod'

const serverSchema = zod.object({
  NEXT_PUBLIC_SENTRY_DSN: zod.string(),
  BACKBLAZE_REGION: zod.string(),
  BACKBLAZE_KEY_ID: zod.string(),
  BACKBLAZE_APP_KEY: zod.string(),
  BACKBLAZE_BUCKET_NAME: zod.string(),
})

export const serverEnv = serverSchema.parse({
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  BACKBLAZE_REGION: process.env.BACKBLAZE_REGION,
  BACKBLAZE_KEY_ID: process.env.BACKBLAZE_KEY_ID,
  BACKBLAZE_APP_KEY: process.env.BACKBLAZE_APP_KEY,
  BACKBLAZE_BUCKET_NAME: process.env.BACKBLAZE_BUCKET_NAME,
})
