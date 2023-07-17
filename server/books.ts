import { Prisma, PrismaClient, Status } from '@prisma/client'

export default async function getBooks(
  userId: string,
  status: Status,
  cursor?: number
) {
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
      status,
    },
    orderBy: {
      createdAt: 'asc',
    },
  }
  if (cursor) {
    findOpts.cursor = {
      id: cursor,
    }
    findOpts.skip = 1 // Skip the cursor which was the last result
  }
  const books = await prisma.book.findMany(findOpts)
  const nextCursor = books?.length > 0 ? books[0].id : null
  return {
    books,
    nextCursor,
  }
}
