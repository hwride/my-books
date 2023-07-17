import { Prisma, PrismaClient, Status } from '@prisma/client'
import { pageSize } from '@/config'

export default async function getBooks(
  userId: string,
  status: Status,
  cursor?: number
) {
  const prisma = new PrismaClient()
  const findOpts: Prisma.BookFindManyArgs = {
    // Take one extra so we can check if there are more results to come.
    take: pageSize + 1,
    select: {
      id: true,
      updatedAt: true,
      title: true,
      author: true,
      status: true,
    },
    where: {
      userId,
      status,
    },
    orderBy: {
      createdAt: 'asc',
    },
  }

  // If a cursor was provided start our search from there.
  if (cursor) {
    findOpts.cursor = {
      id: cursor,
    }
    findOpts.skip = 1 // Skip the cursor which was the last result
  }

  const [count, books] = await prisma.$transaction([
    prisma.book.count({
      where: {
        userId,
        status,
      },
    }),
    prisma.book.findMany(findOpts),
  ])

  const hasMore = books.length > pageSize
  if (hasMore) {
    books.pop() // Remove the extra item.
  }
  const nextCursor = hasMore ? books[0].id : null

  return {
    totalBooks: count,
    books,
    nextCursor,
  }
}
