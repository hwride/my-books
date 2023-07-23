import type { PageConfig } from 'next'
import { PrismaClient, Status } from '@prisma/client'
import { BookSerializable } from '@/pages/api/book'
import { File } from 'formidable'
import { FieldsSingle } from '@/lib/formidable/firstValues'
import {
  KnownError,
  parseAddOrEditBookForm,
  uploadCoverImage,
  validateCoverImage,
} from '@/server/addOrEditBook'
import { getAuthRouter } from '@/server/middleware/userLoggedIn'
import z from 'zod'

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

const queryParamsSchema = z.object({
  _method: z.enum(['DELETE']).optional(),
  updatedAt: z.string().datetime({
    message: 'Must be a valid ISO 8601 string',
  }),
  returnCreated: z
    .string()
    .refine((value) => ['true', 'false'].includes(value), {
      message: 'Must be a stringified boolean ("true" or "false")',
    })
    .transform((val) => Boolean(val)),
  title: z.string(),
  author: z.string(),
  status: z.enum([Status.READ, Status.NOT_READ]).optional(),
  description: z.string().optional(),
})
type QueryParams = z.infer<typeof queryParamsSchema>

const fieldsUserCanUpdate = [
  'title',
  'author',
  'status',
  'description',
  'coverImageUrl',
] as const
type UpdatableFields = (typeof fieldsUserCanUpdate)[number]

router.post(async (req, res) => {
  const { userId } = req

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
    return res.status(400).json({
      message: e instanceof KnownError ? e.message : 'Error reading form data',
    })
  }

  let validatedFields: QueryParams
  let bookidNum: number
  try {
    validatedFields = queryParamsSchema.parse(fields)
    bookidNum = z.coerce.number().parse(req.query.bookid)
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
  const { updatedAt, returnCreated } = fields

  if (!(await validateCoverImage(imageFile, res)).valid) {
    return
  }

  // Crate data object from request body. Only add fields the user is allowed to update.
  const dataToUpdate: Partial<Record<UpdatableFields, any>> = {}
  fieldsUserCanUpdate.forEach((key) => {
    // Users don't specify cover image URL, but instead upload an actual image, which we handle below.
    if (key === 'coverImageUrl') return
    const val = validatedFields[key]
    if (val !== undefined) dataToUpdate[key] = val
  })

  const prisma = new PrismaClient()
  try {
    // Note we are not using the HTTP verb DELETE, as native forms as of today do not support this without JS, and we're
    // building progressively enhanced forms.
    if (validatedFields._method === 'DELETE') {
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
      let friendlyUrl
      if (imageFile != null) {
        ;({ friendlyUrl } = await uploadCoverImage(imageFile))
        dataToUpdate.coverImageUrl = friendlyUrl
      }

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
        return res.redirect(307, `/book/${bookidNum}`)
      }
    }
  } catch (e: any) {
    console.error(`Book update error, code: ${e.code}`)
    // P2025 = missing row, could happen if optimistic concurrency control fails
    return res
      .status(500)
      .send({ message: 'An error occurred while performing the update.' })
  }
})

export default router.handler()
