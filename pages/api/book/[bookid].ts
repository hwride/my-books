import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

type Data = {
  message?: string
}

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
    await prisma.book.update({
      where: {
        id: bookidNum,
        userId, // Ensure users can only update their own books.
      },
      data: dataToUpdate,
    })
  } catch (e: any) {
    console.error(`Book update error, code: ${e.code}`)
    return res
      .status(500)
      .send({ message: 'An error occurred while performing the update.' })
  }

  return res.status(200).end()
}
