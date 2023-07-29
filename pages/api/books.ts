import { Status } from '@prisma/client'
import getBooks from '@/server/books'
import { getAuthRouter } from '@/server/middleware/userLoggedIn'
import { BookSerializable } from '@/models/Book'
import { ErrorResponse } from '@/models/Error'

export type Books = Pick<
  BookSerializable,
  'id' | 'updatedAt' | 'title' | 'author' | 'status'
>[]
type Data =
  | ErrorResponse
  | {
      totalBooks: number
      books: Books
      hasMore: boolean
    }

const router = getAuthRouter<Data>()

router.get(async (req, res) => {
  const { userId } = req
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
      hasMore: results.hasMore,
    })
  } catch (e: any) {
    console.error(`Books get error, code: ${e.code}`, e)
    return res
      .status(500)
      .send({ message: 'An error occurred while getting books.' })
  }
})

export default router.handler()
