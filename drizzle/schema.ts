import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const status = pgEnum('Status', ['NOT_READ', 'READ'])

export const book = pgTable(
  'book',
  {
    id: serial().primaryKey().notNull(),
    userId: varchar({ length: 32 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    author: text(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    description: varchar({ length: 1024 }),
    status: status().default('NOT_READ').notNull(),
    coverImageUrl: text(),
  },
  (table) => [unique().on(table.userId, table.title, table.author)]
)
