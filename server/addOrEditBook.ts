import { NextApiRequest, NextApiResponse } from 'next'
import {
  convertFieldsToSingle,
  FieldsSingle,
} from '@/lib/formidable/firstValues'
import formidable, { errors as formidableErrors, File } from 'formidable'
import IncomingForm from 'formidable/Formidable'
import {
  coverImageMaxFileSizeBytes,
  coverImageMaxFileSizeBytesLabel,
  coverImageRequiredHeightPx,
  coverImageRequiredWidthPx,
} from '@/config'
import sharp from 'sharp'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { serverEnv } from '@/env/serverEnv.mjs'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import z, { ZodError } from 'zod'
import { booleanExact } from '@/utils/zod'
import { Book, Status } from '@prisma/client'
import { NextApiRequestAuthed } from '@/server/middleware/userLoggedIn'
import { ErrorResponse } from '@/models/Error'

export class KnownError extends Error {}
export class RequestFailedAndHandled extends Error {}

export const UpdateBookFormDataSchema = z.object({
  returnCreated: booleanExact(),
  title: z.string(),
  author: z.string(),
  status: z.enum([Status.READ, Status.NOT_READ]).optional(),
  description: z.string().optional(),
})

export function createRequestHandler<ResponseData>(
  processRequest: (
    req: NextApiRequestAuthed,
    res: NextApiResponse<ErrorResponse | ResponseData>
  ) => Promise<any>,
  {
    errorMsg = 'Unhandled error occurred in route handler',
    responseMsg = 'A server error occurred',
    errorHook,
  }: {
    errorMsg?: string
    responseMsg?: string
    errorHook?: (
      res: NextApiResponse<ErrorResponse | ResponseData>,
      e: any
    ) => { handled: boolean } | undefined
  } = {}
) {
  return async (
    req: NextApiRequestAuthed,
    res: NextApiResponse<ErrorResponse | ResponseData>
  ) => {
    try {
      return await processRequest(req, res)
    } catch (e: any) {
      if (e instanceof RequestFailedAndHandled) {
        return // Already handled
      } else {
        console.error(`${errorMsg}`, e)
        if (errorHook) {
          const result = errorHook(res, e)
          if (result?.handled) return
        }
        return res.status(500).send({ message: responseMsg })
      }
    }
  }
}

export async function parseAddOrEditBookForm(
  req: NextApiRequest,
  res: NextApiResponse,
  singleFields: string[]
): Promise<{
  formFields: FieldsSingle
  formImageFile: File | undefined
}> {
  const form: IncomingForm = formidable({
    allowEmptyFiles: true,
    minFileSize: 0,
    maxFileSize: coverImageMaxFileSizeBytes,
  })

  // Parse the form data.
  let fieldsMultiple
  let files
  try {
    ;[fieldsMultiple, files] = await form.parse(req)
  } catch (e: any) {
    console.error(`Error parsing form data`, e)
    if (
      // @ts-ignore types are out of date, biggerThanTotalMaxFileSize does exist
      e.code === formidableErrors.biggerThanTotalMaxFileSize ||
      e.code === formidableErrors.biggerThanMaxFileSize
    ) {
      res.status(400).json({
        message: `cover image cannot be greater than ${coverImageMaxFileSizeBytesLabel}`,
      })
    } else {
      res.status(400).json({
        message: `Error reading form data`,
      })
    }
    throw new RequestFailedAndHandled()
  }

  const formFields = convertFieldsToSingle(fieldsMultiple, ...singleFields)

  // Handle image files.
  let formImageFile: File | undefined
  if (files.image != null) {
    if (Array.isArray(files.image)) {
      const imgArr = files.image
      if (files.image.length === 1) {
        const imageFileVal = imgArr[0]
        // When including no file in our file input at all, we still get an empty value sent to the server. So here
        // assuming if we get a single empty file, the user has uploaded no image at all.
        if (imageFileVal.size > 0) {
          formImageFile = imgArr[0]
        }
      } else {
        throw new KnownError('multiple images not supported')
      }
    } else {
      formImageFile = files.image
    }
  }

  return { formFields, formImageFile }
}

export function validateRequestWithZod<T>(
  res: NextApiResponse,
  validate: () => T
): { handled: false; data: T } | { handled: true; data: undefined } {
  try {
    const data = validate()
    return {
      handled: false,
      data,
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({ issues: error.issues })
    } else {
      res.status(500).json({ message: 'There was a problem reading form data' })
    }
    return {
      handled: true,
      data: undefined,
    }
  }
}

export function zodErrorResponseHandler(res: NextApiResponse, error: any) {
  if (error instanceof ZodError) {
    res.status(400).json({ issues: error.issues })
  } else {
    res.status(500).json({ message: 'There was a problem reading form data' })
  }
  return new RequestFailedAndHandled()
}

export async function validateCoverImage(
  imageFile: File | undefined,
  res: NextApiResponse
) {
  // Check image dimensions
  if (imageFile != null) {
    const image = sharp(imageFile.filepath)
    const metadata = await image.metadata()

    if (
      metadata.width !== coverImageRequiredWidthPx ||
      metadata.height !== coverImageRequiredHeightPx
    ) {
      res.status(400).json({
        message: `cover images must be ${coverImageRequiredWidthPx}x${coverImageRequiredHeightPx} pixels`,
      })
      throw new RequestFailedAndHandled()
    }
  }
}

export async function uploadCoverImage(image: File) {
  const keyName = uuidv4()

  // Create an S3 client, Backblaze has an S3 compatible API.
  const s3 = new S3Client({
    endpoint: `https://s3.${serverEnv.BACKBLAZE_REGION}.backblazeb2.com`,
    region: serverEnv.BACKBLAZE_REGION,
    credentials: {
      accessKeyId: serverEnv.BACKBLAZE_KEY_ID,
      secretAccessKey: serverEnv.BACKBLAZE_APP_KEY,
    },
  })

  // Upload the object to the bucket.
  await s3.send(
    new PutObjectCommand({
      Bucket: serverEnv.BACKBLAZE_BUCKET_NAME,
      Key: keyName,
      ContentType: image.mimetype ?? undefined,
      Body: fs.createReadStream(image.filepath),
    })
  )
  const friendlyUrl = `https://f003.backblazeb2.com/file/${serverEnv.BACKBLAZE_BUCKET_NAME}/${keyName}`
  return friendlyUrl
}

export function handleUpdateBookResponse(
  res: NextApiResponse,
  returnCreated: boolean,
  book: Book
) {
  if (returnCreated) {
    return res.status(200).send({
      ...book,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    })
  }
  // If return created is not specified, by default we redirect to the appropriate page on return. This enables
  // our progressively enhanced forms to redirect to the correct place without JavaScript.
  else {
    return res.redirect(307, `/book/${book.id}`)
  }
}
