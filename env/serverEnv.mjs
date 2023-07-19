import zod from 'zod'

const serverSchema = zod.object({
  BACKBLAZE_REGION: zod.string(),
  BACKBLAZE_KEY_ID: zod.string(),
  BACKBLAZE_APP_KEY: zod.string(),
  BACKBLAZE_BUCKET_NAME: zod.string(),
})

export const serverEnv = serverSchema.parse({
  BACKBLAZE_REGION: process.env.BACKBLAZE_REGION,
  BACKBLAZE_KEY_ID: process.env.BACKBLAZE_KEY_ID,
  BACKBLAZE_APP_KEY: process.env.BACKBLAZE_APP_KEY,
  BACKBLAZE_BUCKET_NAME: process.env.BACKBLAZE_BUCKET_NAME,
})
