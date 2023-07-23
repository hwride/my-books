import type { PageConfig } from 'next'
import { codes } from '@/prisma/constants'
import { FieldsSingle } from '@/lib/formidable/firstValues'
import { File } from 'formidable'
import {
  handleUpdateBookResponse,
  KnownError,
  parseAddOrEditBookForm,
  RequestFailedAndHandled,
  UpdateBookFormDataSchema,
  uploadCoverImage,
  validateCoverImage,
  validateRequestWithZod,
  zodErrorResponseHandler,
} from '@/server/addOrEditBook'
import {
  getAuthRouter,
  NextApiRequestAuthed,
} from '@/server/middleware/userLoggedIn'
import { prisma } from '@/server/prismaClient'
import z, { ZodError } from 'zod'
import { NextApiResponse } from 'next'
import { BookSerializable } from '@/models/Book'
import { ErrorResponse } from '@/models/Error'

const formDataSchema = UpdateBookFormDataSchema
type FormData = z.infer<typeof formDataSchema>
type ParsedRequestData = FormData & {
  imageFile: File | undefined
}

type ResponseData = ErrorResponse | BookSerializable

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

const router = getAuthRouter<ResponseData>()

router.post(async (req, res) => {
  const { userId } = req

  // Parse request data and validate.
  const { returnCreated, title, author, imageFile } =
    await parseAndValidateData(req, res)

  try {
    // Upload cover image if one was provided.
    const coverImageUrl =
      imageFile != null ? await uploadCoverImage(imageFile) : undefined

    // Create book in the database.
    const newBook = await prisma.book.create({
      data: {
        userId,
        title,
        author,
        coverImageUrl: coverImageUrl,
      },
    })

    handleUpdateBookResponse(res, returnCreated, newBook)
  } catch (e: any) {
    if (e instanceof RequestFailedAndHandled) {
      return // Already handled
    } else {
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
  }
})

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
