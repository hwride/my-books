import type { NextApiRequest, NextApiResponse, PageConfig } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { BookSerializable } from '@/pages/api/book'
import formidable from 'formidable'
import {
  convertFieldsToSingle,
  FieldsSingle,
} from '@/lib/formidable/firstValues'
import IncomingForm from 'formidable/Formidable'

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

export default async function updateBook(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).end()
  }

  const { userId } = getAuth(req)
  if (userId == null) {
    return res.status(400).json({ message: 'Not logged in' })
  }

  // Parse form fields
  let fields: FieldsSingle
  let files: formidable.Files
  try {
    ;[fields, files] = await parseForm(req)
  } catch (e) {
    console.error(`Error parsing form data`, e)
    return res.status(400).json({ message: 'Error reading form data' })
  }

  const { updatedAt, returnCreated } = fields
  if (!updatedAt) {
    return res.status(400).json({ message: 'updatedAt is required' })
  }

  if (fields._method && fields._method !== 'DELETE') {
    return res.status(400).json({ message: 'Invalid _method' })
  }

  const { bookid } = req.query
  if (typeof bookid !== 'string' || !bookid.match(/^\d+$/)) {
    return res.status(400).json({ message: 'ID is not valid' })
  }
  let bookidNum = Number(bookid)

  // Crate data object from request body. Only add fields the user is allowed to update.
  const dataToUpdate: Record<string, any> = {}
  ;['title', 'author', 'status', 'description'].forEach((key: string) => {
    const val = fields[key]
    if (val !== undefined) dataToUpdate[key] = val
  })

  const prisma = new PrismaClient()
  try {
    // Note we are not using the HTTP verb DELETE, as native forms as of today do not support this without JS, and we're
    // building progressively enhanced forms.
    if (fields._method === 'DELETE') {
      const deletedBook = await prisma.book.delete({
        where: {
          id: bookidNum,
          userId, // Ensure users can only update their own books.
          // Optimistic currency control: ensure you can only update if you have
          // the latest book.
          updatedAt: new Date(updatedAt),
        },
      })

      if (returnCreated === 'true') {
        return res.status(204).end()
      }
      // If return created is not specified, by default we redirect to the appropriate page on return. This enables
      // our progressively enhanced forms to redirect to the correct place without JavaScript.
      else {
        return res.redirect(307, `/readingList`)
      }
    } else {
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
    }
  } catch (e: any) {
    console.error(`Book update error, code: ${e.code}`)
    // P2025 = missing row, could happen if optimistic concurrency control fails
    return res
      .status(500)
      .send({ message: 'An error occurred while performing the update.' })
  }
}

async function parseForm(
  req: NextApiRequest
): Promise<[FieldsSingle, formidable.Files]> {
  const form: IncomingForm = formidable({})

  const [fieldsMultiple, files] = await form.parse(req)
  const fields = convertFieldsToSingle(
    fieldsMultiple,
    '_method',
    'updatedAt',
    'returnCreated',
    'title',
    'author',
    'status',
    'description'
  )
  return [fields, files]
}
