import type { NextApiRequest, NextApiResponse, PageConfig } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { Book, PrismaClient } from '@prisma/client'
import { codes } from '@/prisma/constants'
import { ReplaceDateWithStrings } from '@/utils/typeUtils'
import { FieldsSingle } from '@/lib/formidable/firstValues'
import { File } from 'formidable'
import {
  KnownError,
  parseAddOrEditBookForm,
  uploadCoverImage,
  validateCoverImage,
} from '@/server/addOrEditBook'
import { createRouter } from 'next-connect'
import { getAuthRouter } from '@/server/middleware/userLoggedIn'
import { prisma } from '@/server/prismaClient'

export type BookSerializable = ReplaceDateWithStrings<Book>
type Data =
  | {
      message?: string
    }
  | BookSerializable

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

const router = getAuthRouter<Data>()

router.post(async (req, res) => {
  const { userId } = req

  let fields: FieldsSingle
  let imageFile: File | undefined
  try {
    ;[fields, imageFile] = await parseAddOrEditBookForm(
      req,
      'title',
      'author',
      'returnCreated'
    )
  } catch (e: any) {
    console.error(`Error parsing form data`, e)
    return res.status(400).json({
      message: e instanceof KnownError ? e.message : 'Error reading form data',
    })
  }

  const { title, author, returnCreated } = fields
  if (!title || !author) {
    return res.status(400).json({ message: 'title and author is required' })
  }

  if (!(await validateCoverImage(imageFile, res)).valid) {
    return
  }

  try {
    let friendlyUrl
    if (imageFile != null) {
      ;({ friendlyUrl } = await uploadCoverImage(imageFile))
    }

    const newBook = await prisma.book.create({
      data: {
        userId,
        title,
        author,
        coverImageUrl: friendlyUrl,
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
})

export default router.handler()
