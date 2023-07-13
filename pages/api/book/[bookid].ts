import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { BookSerializable } from '@/pages/api/book'

type Data =
  | {
      message?: string
    }
  | BookSerializable

export default async function updateBook(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { userId } = getAuth(req)
  if (userId == null) {
    return res.status(400).json({ message: 'Not logged in' })
  }

  const { updatedAt, returnCreated } = req.body
  if (!updatedAt) {
    return res.status(400).json({ message: 'updatedAt is required' })
  }

  const { bookid } = req.query
  if (typeof bookid !== 'string' || !bookid.match(/^\d+$/)) {
    return res.status(400).json({ message: 'ID is not valid' })
  }
  let bookidNum = Number(bookid)

  // Crate data object from request body. Only add fields the user is allowed to update.
  const dataToUpdate: Record<string, any> = {}
  ;['title', 'author', 'status', 'description'].forEach((key: string) => {
    const val = req.body[key]
    if (val !== undefined) dataToUpdate[key] = val
  })

  const prisma = new PrismaClient()
  try {
    const updatedBook = await prisma.book.update({
      where: {
        id: bookidNum,
        userId, // Ensure users can only update their own books.
        // Optimistic currency control: ensure you can only update if you have
        // the latest book.
        updatedAt: new Date(updatedAt),
      },
      data: dataToUpdate,
    })

    if (returnCreated === 'true') {
      return res.status(200).send({
        ...updatedBook,
        createdAt: updatedBook.createdAt.toISOString(),
        updatedAt: updatedBook.updatedAt.toISOString(),
      })
    }
    // If return created is not specified, by default we redirect to the appropriate page on return. This enables
    // our progressively enhanced forms to redirect to the correct place without JavaScript.
    else {
      return res.redirect(307, `/book/${bookid}`)
    }
  } catch (e: any) {
    console.error(`Book update error, code: ${e.code}`)
    // P2025 = missing row, could happen if optimistic concurrency control fails
    return res
      .status(500)
      .send({ message: 'An error occurred while performing the update.' })
  }
}
