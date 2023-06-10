import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

type Data = {
  message?: string
}

export default async function handler(
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

  const { title, author } = req.body
  if (!title || !author) {
    return res.status(400).json({ message: 'title and author is required' })
  }

  const prisma = new PrismaClient()
  await prisma.book.create({
    data: {
      userId,
      title,
      author,
    },
  })

  return res.status(200).end()
}
