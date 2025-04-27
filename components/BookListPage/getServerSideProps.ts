import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { BookListBook } from '@/components/BookList'
import getBooks, { cursorToString } from '@/server/books'
import { book } from '@/drizzle/schema'
import { GetServerSidePropsResult } from 'next'

export type BookListProps = {
  books: BookListBook[]
  totalBooks: number
  hasMore: boolean
  nextCursor: string | null
}

export const getServerSidePropsHelper = async (
  filterStatus: typeof book.$inferSelect.status,
  context: any
): Promise<GetServerSidePropsResult<BookListProps>> => {
  const { req, query } = context
  const { userId } = getAuth(req)
  if (userId == null) {
    throw new Error('Should not have access to this page when not signed in')
  }

  const results = await getBooks(userId, filterStatus)

  return {
    props: {
      books: results.books.map((book) => ({
        ...book,
        updatedAt: book.updatedAt,
      })),
      totalBooks: results.totalBooks,
      hasMore: results.hasMore,
      nextCursor: cursorToString(results.nextCursor) || null,
      ...buildClerkProps(req),
    },
  }
}
