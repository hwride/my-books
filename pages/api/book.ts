import type { NextApiRequest, NextApiResponse, PageConfig } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import { Book, PrismaClient } from '@prisma/client'
import { codes } from '@/prisma/constants'
import { ReplaceDateWithStrings } from '@/utils/typeUtils'
import {
  convertFieldsToSingle,
  FieldsSingle,
} from '@/lib/formidable/firstValues'
import formidable, { File } from 'formidable'
import IncomingForm from 'formidable/Formidable'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { serverEnv } from '@/env/serverEnv.mjs'
import sharp from 'sharp'

export type BookSerializable = ReplaceDateWithStrings<Book>
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

// TODO: Check env vars are here for files stuff.

export default async function addBook(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { userId } = getAuth(req)
  if (userId == null) {
    return res.status(400).json({ message: 'Not logged in' })
  }

  let fields: FieldsSingle
  let imageFile: File | undefined
  try {
    ;[fields, imageFile] = await parseForm(req)
  } catch (e) {
    console.error(`Error parsing form data`, e)
    return res.status(400).json({
      message: e instanceof KnownError ? e.message : 'Error reading form data',
    })
  }

  const { title, author, returnCreated } = fields
  if (!title || !author) {
    return res.status(400).json({ message: 'title and author is required' })
  }

  // Check image dimensions
  if (imageFile != null) {
    const image = sharp(imageFile.filepath)
    const metadata = await image.metadata()

    // This support 2x device pixel ratio displays as 200x300 CSS pixel size.
    if (metadata.width !== 400 || metadata.height !== 600) {
      return res
        .status(400)
        .json({ message: 'cover images must be 400x600 pixels' })
    }
  }

  const prisma = new PrismaClient()
  try {
    let friendlyUrl
    if (imageFile != null) {
      ;({ friendlyUrl } = await uploadImage(imageFile))
    }

    const newBook = await prisma.book.create({
      data: {
        userId,
        title,
        author,
        coverImageUrl: friendlyUrl,
      },
    })

    if (returnCreated === 'true') {
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
}

class KnownError extends Error {}

async function parseForm(
  req: NextApiRequest
): Promise<[FieldsSingle, File | undefined]> {
  const form: IncomingForm = formidable({})

  const [fieldsMultiple, files] = await form.parse(req)
  const fields = convertFieldsToSingle(
    fieldsMultiple,
    'title',
    'author',
    'returnCreated'
  )

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

async function uploadImage(image: File) {
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
