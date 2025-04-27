import type { PageConfig } from 'next'
import { File } from 'formidable'
import {
  handleUpdateBookResponse,
  parseAddOrEditBookForm,
  createRequestHandler,
  UpdateBookFormDataSchema,
  uploadCoverImage,
  validateCoverImage,
  zodErrorResponseHandler,
} from '@/server/addOrEditBook'
import {
  getAuthRouter,
  NextApiRequestAuthed,
} from '@/server/middleware/userLoggedIn'
import z from 'zod'
import { NextApiResponse } from 'next'
import { Book } from '@/models/Book'
import { ErrorResponse } from '@/models/Error'
import { db } from '@/drizzle/db'
import { book } from '@/drizzle/schema'

const formDataSchema = UpdateBookFormDataSchema
type FormData = z.infer<typeof formDataSchema>
type ParsedRequestData = FormData & {
  imageFile: File | undefined
}

type ResponseData = ErrorResponse | Book

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

const router = getAuthRouter<ResponseData>()

router.post(
  createRequestHandler<ResponseData>(
    async (req, res) => {
      // Parse request data and validate.
      const { returnCreated, title, author, imageFile } =
        await parseAndValidateData(req, res)

      // Upload cover image if one was provided.
      const coverImageUrl =
        imageFile != null ? await uploadCoverImage(imageFile) : undefined

      // Create book in the database.
      const newBooks = await db
        .insert(book)
        .values({
          userId: req.userId,
          title,
          author,
          coverImageUrl: coverImageUrl,
          updatedAt: new Date().toISOString(),
          status: 'NOT_READ',
        })
        .returning()
      if (newBooks.length !== 1) {
        throw new Error(
          `Unexpected numbers of results from insert book: ${newBooks.length}`
        )
      }

      const newBook = newBooks[0]
      handleUpdateBookResponse(res, returnCreated, newBook)
    },
    {
      errorMsg: 'Book creation error',
      responseMsg: 'An error occurred while adding the book.',
      errorHook: (res, e) => {
        if (e?.code === '23505') {
          res.status(400).json({
            message:
              e.constraint_name === 'book_userId_title_author_unique'
                ? 'A book with this title and author already exists for this user.'
                : 'Unknown error',
          })
          return { handled: true }
        }
      },
    }
  )
)

async function parseAndValidateData(
  req: NextApiRequestAuthed,
  res: NextApiResponse<ResponseData>
): Promise<ParsedRequestData> {
  // Parse form fields
  const { formFields, formImageFile } = await parseAddOrEditBookForm(req, res, [
    'title',
    'author',
    'returnCreated',
  ])

  // Validate form fields.
  let validatedFields: FormData
  try {
    validatedFields = formDataSchema.parse(formFields)
  } catch (error: any) {
    throw zodErrorResponseHandler(res, error)
  }

  // Validate uploaded cover image file.
  await validateCoverImage(formImageFile, res)

  return {
    ...validatedFields,
    imageFile: formImageFile,
  }
}

export default router.handler()
