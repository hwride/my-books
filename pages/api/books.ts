import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { Prisma, Book, PrismaClient, Status } from '@prisma/client'
import { ReplaceDateWithStrings } from '@/utils/typeUtils'

export type BooksSerializable = Pick<
  ReplaceDateWithStrings<Book>,
  'id' | 'updatedAt' | 'title' | 'author' | 'status'
>[]
type Data =
  | {
      message?: string
    }
  | {
      books: BooksSerializable
      cursor: number | null
    }

export default async function books(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const { userId } = getAuth(req)
  if (userId == null) {
    return res.status(400).json({ message: 'Not logged in' })
  }

  const { status, cursor } = req.query
  if (status !== Status.READ && status !== Status.NOT_READ) {
    return res.status(400).json({ message: 'status is required' })
  }

  const prisma = new PrismaClient()
  try {
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
        id: 1,
      }
      findOpts.skip = 1 // Skip the cursor which was the last result
    }
    const books = await prisma.book.findMany(findOpts)
    const nextCursor = books?.length > 0 ? books[0].id : null

    return res.status(200).send({
      books: books.map((book) => {
        const { userId, ...rest } = book
        return {
          ...rest,
          updatedAt: book.updatedAt.toISOString(),
        }
      }),
      cursor: nextCursor,
    })
  } catch (e: any) {
    console.error(`Books get error, code: ${e.code}`, e)
    return res
      .status(500)
      .send({ message: 'An error occurred while getting books.' })
  }

  return res.status(200).end()
}
