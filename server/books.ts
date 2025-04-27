import { eq, and, or, gt, asc, count } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import { pageSize } from '@/config'
import { book } from '@/drizzle/schema'
import { Book } from '@/models/Book'

export type GetBooksCursor = {
  id: number
  createdAt: string
}

export default async function getBooks(
  userId: string,
  status: Book['status'],
  cursor?: GetBooksCursor
) {
  // Query for the total number of books.
  const [{ count: totalBooks }] = await db
    .select({ count: count() })
    .from(book)
    .where(and(eq(book.userId, userId), eq(book.status, status)))

  // Query for the books of the current page.
  const booksResult = await db
    .select({
      id: book.id,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      title: book.title,
      author: book.author,
      status: book.status,
      coverImageUrl: book.coverImageUrl,
    })
    .from(book)
    .where(
      and(
        eq(book.userId, userId),
        eq(book.status, status),
        cursor
          ? or(
              gt(book.createdAt, cursor.createdAt),
              and(eq(book.createdAt, cursor.createdAt), gt(book.id, cursor.id))
            )
          : undefined
      )
    )
    .orderBy(asc(book.createdAt), asc(book.id))
    .limit(pageSize + 1)

  // Determine if there's a next page
  const hasMore = booksResult.length > pageSize
  if (hasMore) {
    booksResult.pop() // Remove the extra item
  }

  const nextCursor: GetBooksCursor | undefined = hasMore
    ? {
        id: booksResult[booksResult.length - 1].id,
        createdAt: booksResult[booksResult.length - 1].createdAt,
      }
    : undefined

  return {
    totalBooks,
    books: booksResult,
    hasMore,
    nextCursor,
  }
}

export function stringToCursor(
  cursorQueryString?: string
): GetBooksCursor | undefined {
  let cursor: GetBooksCursor | undefined
  if (cursorQueryString) {
    const [id, createdAt] = cursorQueryString.split('|')
    return {
      id: Number(id),
      createdAt,
    }
  } else {
    return undefined
  }
}

export function cursorToString(cursor?: GetBooksCursor): string | undefined {
  if (cursor) {
    return `${cursor.id}|${cursor.createdAt}`
  } else {
    return undefined
  }
}
