// Needs to be SSRd because it can vary based on signed-in user.
import { PrismaClient, Status } from '@prisma/client'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { BookListBook } from '@/components/BookList'

export type BookListProps = {
  books: BookListBook[]
  cursor?: number
}

export const getServerSidePropsHelper = async (
  filterStatus: Status,
  { req }: { req: any }
) => {
  const { userId } = getAuth(req)
  if (userId == null) {
    throw new Error('Should not have access to this page when not signed in')
  }
  const prisma = new PrismaClient()
  const books = await prisma.book.findMany({
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
  })
  const cursor = books?.length > 0 ? books[0].id : undefined

  return {
    props: {
      books: books.map((book) => ({
        ...book,
        updatedAt: book.updatedAt.toISOString(),
      })),
      cursor,
      ...buildClerkProps(req),
    },
  }
}
