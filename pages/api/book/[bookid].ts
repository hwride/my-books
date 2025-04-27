import type { NextApiResponse, PageConfig } from 'next'
import { File } from 'formidable'
import {
  UpdateBookFormDataSchema,
  parseAddOrEditBookForm,
  uploadCoverImage,
  validateCoverImage,
  handleUpdateBookResponse,
  zodErrorResponseHandler,
  createRequestHandler,
} from '@/server/addOrEditBook'
import {
  getAuthRouter,
  NextApiRequestAuthed,
} from '@/server/middleware/userLoggedIn'
import z from 'zod'

import { Book } from '@/models/Book'
import { ErrorResponse } from '@/models/Error'
import { db } from '@/drizzle/db'
import { book } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

type ResponseData = ErrorResponse | Book
type Response = NextApiResponse<ResponseData>

const formDataSchema = UpdateBookFormDataSchema.extend({
  _method: z.enum(['DELETE']).optional(),
  // A book should never be without title and author. But if not included we don't update them, rather than setting them
  // to empty.
  title: z.string().optional(),
  author: z.string().optional(),
  updatedAt: z.string(),
})
type FormData = z.infer<typeof formDataSchema>
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

const router = getAuthRouter<ResponseData>()
router.post(
  createRequestHandler<ResponseData>(
    async (req, res) => {
      // Parse request data and validate.
      const requestData = await parseAndValidateData(req, res)

      // Note we are not using the HTTP verb DELETE, as native forms as of today do not support this without JS, and we're
      // building progressively enhanced forms.
      if (requestData._method === 'DELETE') {
        await deleteBook(res, req.userId, requestData)
      } else {
        await updateBook(res, req.userId, requestData)
      }
    },
    {
      errorMsg: 'Book update error',
      responseMsg: 'An error occurred while updating the book.',
    }
  )
)

async function parseAndValidateData(
  req: NextApiRequestAuthed,
  res: NextApiResponse<ResponseData>
): Promise<ParsedRequestData> {
  // Parse form fields
  const { formFields, formImageFile } = await parseAddOrEditBookForm(req, res, [
    '_method',
    'updatedAt',
    'returnCreated',
    'title',
    'author',
    'status',
    'description',
  ])

  // Validate form fields.
  let validatedFormFields: FormData
  let bookId: number
  try {
    validatedFormFields = formDataSchema.parse(formFields)
    bookId = z.coerce.number().parse(req.query.bookid)
  } catch (error: any) {
    throw zodErrorResponseHandler(res, error)
  }

  // Validate uploaded cover image file.
  await validateCoverImage(formImageFile, res)

  return {
    bookId: bookId,
    ...validatedFormFields,
    imageFile: formImageFile,
  }
}

async function deleteBook(
  res: Response,
  userId: string,
  requestData: ParsedRequestData
) {
  const { bookId, _method, returnCreated, updatedAt } = requestData

  const result = await db
    .delete(book)
    .where(
      and(
        eq(book.id, bookId),
        // Ensure users can only update their own books.
        eq(book.userId, userId),
        // Optimistic currency control: ensure you can only update if you have
        // the latest book.
        eq(book.updatedAt, updatedAt)
      )
    )
    .returning()

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

  // Upload cover image if one was provided.
  if (imageFile != null) {
    dataToUpdate.coverImageUrl = await uploadCoverImage(imageFile)
  }

  // Update book in the database.
  const updatedBooks = await db
    .update(book)
    .set(dataToUpdate)
    .where(
      and(
        eq(book.id, bookId),
        // Ensure users can only update their own books.
        eq(book.userId, userId),
        // Optimistic currency control: ensure you can only update if you have
        // the latest book.
        eq(book.updatedAt, updatedAt)
      )
    )
    .returning()
  if (updatedBooks.length !== 1) {
    throw new Error(
      `Expected to update 1 book but updated ${
        updatedBooks.length
      }: ${updatedBooks.map((b) => b.id).join(', ')}`
    )
  }

  const updatedBook = updatedBooks[0]
  handleUpdateBookResponse(res, returnCreated, updatedBook)
}

export default router.handler()
