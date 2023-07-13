import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { Book, PrismaClient } from '@prisma/client'
import { codes } from '@/prisma/constants'
import { ReplaceDateWithStrings } from '@/utils/typeUtils'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export type BookSerializable = ReplaceDateWithStrings<Book>
type Data =
  | {
      message?: string
    }
  | BookSerializable

export default async function addBook(
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

  const { title, author, returnCreated } = req.body
  if (!title || !author) {
    return res.status(400).json({ message: 'title and author is required' })
  }

  const prisma = new PrismaClient()
  try {
    const newBook = await prisma.book.create({
      data: {
        userId,
        title,
        author,
      },
    })

    if (returnCreated === 'true') {
      return res.status(200).send({
        ...newBook,
        createdAt: newBook.createdAt.toISOString(),
        updatedAt: newBook.updatedAt.toISOString(),
      })
    }
    // If return created is not specified, by default we redirect to the appropriate page on return. This enables
    // our progressively enhanced forms to redirect to the correct place without JavaScript.
    else {
      return res.redirect(307, `/book/${newBook.id}`)
    }
  } catch (e: any) {
    console.error(`Book creation error, code: ${e.code}`)
    if (e?.code === codes.UniqueConstraintFailed) {
      return res.status(400).json({
        message:
          'A book with this title and author already exists for this user.',
      })
    } else {
      console.log(e)
      return res
        .status(500)
        .send({ message: 'An error occurred while creating the book.' })
    }
  }

  return res.status(200).end()
}
