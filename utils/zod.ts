import z from 'zod'
export const booleanExact = () =>
  z
    .string()
    .refine((value) => ['true', 'false'].includes(value), {
      message: 'Must be "true" or "false"',
    })
    .optional()
    .transform((val) => val === 'true')
