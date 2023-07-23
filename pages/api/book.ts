import type { PageConfig } from 'next'
import { codes } from '@/prisma/constants'
import { FieldsSingle } from '@/lib/formidable/firstValues'
import { File } from 'formidable'
import {
  handleBookResponse,
  KnownError,
  parseAddOrEditBookForm,
  UpdateBookFormDataSchema,
  uploadCoverImage,
  validateCoverImage,
} from '@/server/addOrEditBook'
import {
  getAuthRouter,
  NextApiRequestAuthed,
} from '@/server/middleware/userLoggedIn'
import { prisma } from '@/server/prismaClient'
import z from 'zod'
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
  const requestData = await parseAndValidateData(req, res)
  if (requestData.handled) {
    return
  }
  const { returnCreated, title, author, imageFile } = requestData

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

    handleBookResponse(res, returnCreated, newBook)
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

async function parseAndValidateData(
  req: NextApiRequestAuthed,
  res: NextApiResponse<ResponseData>
): Promise<
  | { handled: true }
  | ({
      handled: false
    } & ParsedRequestData)
> {
  // Parse form fields
  const { handled, fields, imageFile } = await parseAddOrEditBookForm(
    req,
    res,
    'title',
    'author',
    'returnCreated'
  )
  if (handled) return { handled: true }

  // Validate form fields.
  let validatedFields: FormData
  try {
    validatedFields = formDataSchema.parse(fields)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
    return {
      handled: true,
    }
  }

  // Validate uploaded cover image file.
  if (!(await validateCoverImage(imageFile, res)).handled)
    return { handled: true }

  return {
    handled: false,
    ...validatedFields,
    imageFile,
  }
}

export default router.handler()
