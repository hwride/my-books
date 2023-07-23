import type { PageConfig } from 'next'
import { Book, Status } from '@prisma/client'
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
import {
  getAuthRouter,
  NextApiRequestAuthed,
} from '@/server/middleware/userLoggedIn'
import { prisma } from '@/server/prismaClient'
import z from 'zod'
import { booleanExact } from '@/utils/zod'
import { NextApiResponse } from 'next'

import { BookSerializable } from '@/models/Book'

// TODO: Share with edit
const FormDataSchema = z.object({
  returnCreated: booleanExact(),
  title: z.string(),
  author: z.string(),
  status: z.enum([Status.READ, Status.NOT_READ]).optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof FormDataSchema>
type ParsedRequestData = FormData & {
  imageFile: File | undefined
}

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

    if (returnCreated) {
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
      'title',
      'author',
      'returnCreated'
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
  try {
    validatedFields = FormDataSchema.parse(fields)
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
    ...validatedFields,
    imageFile,
  }
}

export default router.handler()
