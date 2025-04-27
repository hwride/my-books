import { book } from '@/drizzle/schema'

export type Book = typeof book.$inferSelect
