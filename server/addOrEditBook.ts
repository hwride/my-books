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

export class KnownError extends Error {}

export async function parseAddOrEditBookForm(
  req: NextApiRequest,
  ...singleFields: string[]
): Promise<[FieldsSingle, File | undefined]> {
  const form: IncomingForm = formidable({
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
      throw new KnownError(
        `cover image cannot be greater than ${coverImageMaxFileSizeBytesLabel}`
      )
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
        imageFile = imgArr[0]
      } else {
        throw new KnownError('multiple images not supported')
      }
    } else {
      imageFile = files.image
    }
  }

  return [fields, imageFile]
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