// Needs to be SSRd because it can vary based on signed-in user.
import { PrismaClient, Status } from '@prisma/client'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { BookListBook } from '@/components/BookList'
import { Prisma } from '@prisma/client'

export type BookListProps = {
  books: BookListBook[]
  cursor?: number
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
  const prisma = new PrismaClient()
  const findOpts: Prisma.BookFindManyArgs = {
    take: 1,
    select: {
      id: true,
      updatedAt: true,
      title: true,
      author: true,
      status: true,
    },
    where: {
      userId,
      status: filterStatus,
    },
    orderBy: {
      createdAt: 'asc',
    },
  }
  if (query.cursor) {
    findOpts.cursor = {
      id: Number(query.cursor),
    }
    findOpts.skip = 1 // Skip the cursor which was the last result
  }
  const books = await prisma.book.findMany(findOpts)
  const nextCursor = books?.length > 0 ? books[0].id : undefined

  return {
    props: {
      books: books.map((book) => ({
        ...book,
        updatedAt: book.updatedAt.toISOString(),
      })),
      cursor: nextCursor,
      ...buildClerkProps(req),
    },
  }
}
