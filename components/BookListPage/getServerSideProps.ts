import { PrismaClient, Status } from '@prisma/client'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { BookListBook } from '@/components/BookList'
import { Prisma } from '@prisma/client'
import getBooks from '@/server/books'

export type BookListProps = {
  books: BookListBook[]
  cursor: number | null
}

export const getServerSidePropsHelper = async (
  filterStatus: Status,
  context: any
) => {
  const { req, query } = context
  const { userId } = getAuth(req)
  if (userId == null) {
    throw new Error('Should not have access to this page when not signed in')
  }

  const results = await getBooks(
    userId,
    filterStatus,
    query.cursor ? Number(query.cursor) : undefined
  )

  return {
    props: {
      books: results.books.map((book) => ({
        ...book,
        updatedAt: book.updatedAt.toISOString(),
      })),
      cursor: results.nextCursor,
      ...buildClerkProps(req),
    },
  }
}
