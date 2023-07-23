import type { NextApiResponse, PageConfig } from 'next'
import { Book, Status } from '@prisma/client'
import { BookSerializable } from '@/pages/api/book'
import { File } from 'formidable'
import { FieldsSingle } from '@/lib/formidable/firstValues'
import {
  KnownError,
  parseAddOrEditBookForm,
  uploadCoverImage,
  validateCoverImage,
} from '@/server/addOrEditBook'
import {
  getAuthRouter,
  NextApiRequestAuthed,
} from '@/server/middleware/userLoggedIn'
import z from 'zod'
import { prisma } from '@/server/prismaClient'
import { booleanExact } from '@/utils/zod'

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

type Data =
  | {
      message?: string
    }
  | BookSerializable
type Response = NextApiResponse<Data>

const FormDataSchema = z.object({
  _method: z.enum(['DELETE']).optional(),
  updatedAt: z.string().datetime({
    message: 'Must be a valid ISO 8601 string',
  }),
  returnCreated: booleanExact(),
  title: z.string().optional(),
  author: z.string().optional(),
  status: z.enum([Status.READ, Status.NOT_READ]).optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof FormDataSchema>
type ParsedRequestData = FormData & {
  bookId: number
  imageFile: File | undefined
}

// We don't let the user for example update createdAt.
const fieldsUserCanUpdate = [
  'title',
  'author',
  'status',
  'description',
  'coverImageUrl',
] as const
type BookUpdateData = Partial<Pick<Book, (typeof fieldsUserCanUpdate)[number]>>

const router = getAuthRouter<Data>()
router.post(async (req, res) => {
  // Parse request data and validate.
  const requestData = await parseAndValidateData(req, res)
  if (requestData.handled) {
    return
  }

  // Perform request operation.
  try {
    // Note we are not using the HTTP verb DELETE, as native forms as of today do not support this without JS, and we're
    // building progressively enhanced forms.
    if (requestData._method === 'DELETE') {
      await deleteBook(res, req.userId, requestData)
    } else {
      await updateBook(res, req.userId, requestData)
    }
  } catch (e: any) {
    console.error(`Book update error, code: ${e.code}`, e)
    // P2025 = missing row, could happen if optimistic concurrency control fails
    return res
      .status(500)
      .send({ message: 'An error occurred while performing the update.' })
  }
})

async function parseAndValidateData(
  req: NextApiRequestAuthed,
  res: NextApiResponse<Data>
): Promise<
  | { handled: true }
  | ({
      handled: false
    } & ParsedRequestData)
> {
  // Parse form fields
  let fields: FieldsSingle
  let imageFile: File | undefined
  try {
    ;[fields, imageFile] = await parseAddOrEditBookForm(
      req,
      '_method',
      'updatedAt',
      'returnCreated',
      'title',
      'author',
      'status',
      'description'
    )
  } catch (e: any) {
    console.error(`Error parsing form data`, e)
    res.status(400).json({
      message: e instanceof KnownError ? e.message : 'Error reading form data',
    })
    return {
      handled: true,
    }
  }

  // Validate form fields.
  let validatedFields: FormData
  let bookId: number
  try {
    validatedFields = FormDataSchema.parse(fields)
    bookId = z.coerce.number().parse(req.query.bookid)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
    return {
      handled: true,
    }
  }

  // Validate uploaded cover image file.
  if (!(await validateCoverImage(imageFile, res)).valid) {
    return {
      handled: true,
    }
  }

  return {
    handled: false,
    bookId,
    ...validatedFields,
    imageFile,
  }
}

async function deleteBook(
  res: Response,
  userId: string,
  requestData: ParsedRequestData
) {
  const { bookId, _method, returnCreated, updatedAt } = requestData

  await prisma.book.delete({
    where: {
      id: bookId,
      userId, // Ensure users can only update their own books.
      // Optimistic currency control: ensure you can only update if you have
      // the latest book.
      updatedAt: new Date(updatedAt),
    },
  })

  if (returnCreated) {
    res.status(204).end()
  }
  // If return created is not specified, by default we redirect to the appropriate page on return. This enables
  // our progressively enhanced forms to redirect to the correct place without JavaScript.
  else {
    res.redirect(307, `/readingList`)
  }
}

async function updateBook(
  res: Response,
  userId: string,
  requestData: ParsedRequestData
) {
  const { bookId, _method, returnCreated, updatedAt, imageFile } = requestData

  // Crate data object from request body. Only add fields the user is allowed to update.
  const dataToUpdate: BookUpdateData = {}
  fieldsUserCanUpdate.forEach((key) => {
    // Users don't specify cover image URL, but instead upload an actual image, which we handle below.
    if (key === 'coverImageUrl') return

    const val = requestData[key]
    if (val !== undefined) {
      // Have to special case status to keep TypeScript happy, it can't infer both status are the same otherwise due to
      // our generic loop.
      if (key === 'status') dataToUpdate.status = requestData.status
      else dataToUpdate[key] = val
    }
  })

  let friendlyUrl
  if (imageFile != null) {
    ;({ friendlyUrl } = await uploadCoverImage(imageFile))
    dataToUpdate.coverImageUrl = friendlyUrl
  }

  const updatedBook = await prisma.book.update({
    where: {
      id: bookId,
      userId, // Ensure users can only update their own books.
      // Optimistic currency control: ensure you can only update if you have
      // the latest book.
      updatedAt: new Date(updatedAt),
    },
    data: dataToUpdate,
  })

  if (returnCreated) {
    return res.status(200).send({
      ...updatedBook,
      createdAt: updatedBook.createdAt.toISOString(),
      updatedAt: updatedBook.updatedAt.toISOString(),
    })
  }
  // If return created is not specified, by default we redirect to the appropriate page on return. This enables
  // our progressively enhanced forms to redirect to the correct place without JavaScript.
  else {
    return res.redirect(307, `/book/${bookId}`)
  }
}

export default router.handler()
