import getBooks, { stringToCursor } from '@/server/books'
import { getAuthRouter } from '@/server/middleware/userLoggedIn'
import { Book } from '@/models/Book'
import { ErrorResponse } from '@/models/Error'

export type Books = Pick<
  Book,
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
  const { status, cursor: cursorQueryString } = req.query
  if (status !== 'READ' && status !== 'NOT_READ') {
    return res.status(400).json({ message: 'status is required' })
  }

  const cursor =
    typeof cursorQueryString === 'string'
      ? stringToCursor(cursorQueryString)
      : undefined

  try {
    const results = await getBooks(userId, status, cursor)
    return res.status(200).send({
      totalBooks: results.totalBooks,
      books: results.books,
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
