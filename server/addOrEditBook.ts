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
import z from 'zod'
import { booleanExact } from '@/utils/zod'
import { Book, Status } from '@prisma/client'

export class KnownError extends Error {}

export const UpdateBookFormDataSchema = z.object({
  returnCreated: booleanExact(),
  title: z.string(),
  author: z.string(),
  status: z.enum([Status.READ, Status.NOT_READ]).optional(),
  description: z.string().optional(),
})

export async function parseAddOrEditBookForm(
  req: NextApiRequest,
  res: NextApiResponse,
  ...singleFields: string[]
): Promise<
  | {
      handled: false
      fields: FieldsSingle
      imageFile: File | undefined
    }
  | {
      handled: true
    }
> {
  const form: IncomingForm = formidable({
    allowEmptyFiles: true,
    minFileSize: 0,
    maxFileSize: coverImageMaxFileSizeBytes,
  })

  let fieldsMultiple
  let files
  try {
    ;[fieldsMultiple, files] = await form.parse(req)
  } catch (e: any) {
    if (
      // @ts-ignore types are out of date, biggerThanTotalMaxFileSize does exist
      e.code === formidableErrors.biggerThanTotalMaxFileSize ||
      e.code === formidableErrors.biggerThanMaxFileSize
    ) {
      console.error(`Error parsing form data`, e)
      res.status(400).json({
        message: `cover image cannot be greater than ${coverImageMaxFileSizeBytesLabel}`,
      })
      return {
        handled: true,
      }
    } else {
      throw e
    }
  }

  const fields = convertFieldsToSingle(fieldsMultiple, ...singleFields)

  let imageFile: File | undefined
  if (files.image != null) {
    if (Array.isArray(files.image)) {
      const imgArr = files.image
      if (files.image.length === 1) {
        const imageFileVal = imgArr[0]
        // When including no file in our file input at all, we still get an empty value sent to the server. So here
        // assuming if we get a single empty file, the user has uploaded no image at all.
        if (imageFileVal.size > 0) {
          imageFile = imgArr[0]
        }
      } else {
        throw new KnownError('multiple images not supported')
      }
    } else {
      imageFile = files.image
    }
  }

  return { handled: false, fields, imageFile }
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
      metadata.size
      res.status(400).json({
        message: `cover images must be ${coverImageRequiredWidthPx}x${coverImageRequiredHeightPx} pixels`,
      })
      return { valid: false }
    }
  }

  return { valid: true }
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
  return { friendlyUrl }
}

export function handleBookResponse(
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
