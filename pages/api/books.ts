import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { Book, Status } from '@prisma/client'
import { ReplaceDateWithStrings } from '@/utils/typeUtils'
import getBooks from '@/server/books'

export type BooksSerializable = Pick<
  ReplaceDateWithStrings<Book>,
  'id' | 'updatedAt' | 'title' | 'author' | 'status'
>[]
type Data =
  | {
      message?: string
    }
  | {
      totalBooks: number
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

  try {
    const results = await getBooks(userId, status, Number(cursor))
    return res.status(200).send({
      totalBooks: results.totalBooks,
      books: results.books.map((book) => {
        const { userId, ...rest } = book
        return {
          ...rest,
          updatedAt: book.updatedAt.toISOString(),
        }
      }),
      cursor: results.nextCursor,
    })
  } catch (e: any) {
    console.error(`Books get error, code: ${e.code}`, e)
    return res
      .status(500)
      .send({ message: 'An error occurred while getting books.' })
  }
}
