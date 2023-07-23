import { ZodIssue } from 'zod'

export type ErrorResponse = {
  message?: string
  issues?: ZodIssue[]
}
