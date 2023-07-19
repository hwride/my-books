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
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import * as fs from 'fs'

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
    return res.status(400).json({ message: 'Error reading form data' })
  }

  const { title, author, returnCreated } = fields
  if (!title || !author) {
    return res.status(400).json({ message: 'title and author is required' })
  }

  // TODO
  // if (imageFile != null && Array.isArray(imageFile.image)) {
  //   return res.status(400).json({ message: 'you can only upload one image' })
  // }

  const prisma = new PrismaClient()
  try {
    if (imageFile != null) {
      const { friendlyUrl } = await uploadImage(imageFile)
      // TODO: write URL to database
    }

    const newBook = await prisma.book.create({
      data: {
        userId,
        title,
        author,
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
        throw new Error('multiple images not supported')
      }
    } else {
      imageFile = files.image
    }
  }

  return [fields, imageFile]
}

async function uploadImage(image: File) {
  const keyName = 'todo-name'

  // Create an S3 client, Backblaze has an S3 compatible API.
  const s3 = new S3Client({
    endpoint: `https://s3.${process.env.BACKBLAZE_REGION}.backblazeb2.com`,
    region: process.env.BACKBLAZE_REGION,
    credentials: {
      accessKeyId: process.env.BACKBLAZE_KEY_ID,
      secretAccessKey: process.env.BACKBLAZE_APP_KEY,
    },
  })

  // Upload the object to the bucket.
  const result = await s3.send(
    new PutObjectCommand({
      Bucket: process.env.BACKBLAZE_BUCKET_NAME,
      Key: keyName,
      ContentType: image.mimetype ?? undefined,
      Body: fs.createReadStream(image.filepath),
    })
  )
  const friendlyUrl = `https://f003.backblazeb2.com/file/${process.env.BACKBLAZE_BUCKET_NAME}/${keyName}`
  console.log(`Friendly URL: ${friendlyUrl}`)
  console.log(
    `S3 URL: https://${process.env.BACKBLAZE_BUCKET_NAME}.s3.${process.env.BACKBLAZE_REGION}.backblazeb2.com/${keyName}`
  )
  console.log(
    'Native URL: https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=' +
      result.VersionId
  )
  console.log(
    'Successfully uploaded data to ' +
      process.env.BACKBLAZE_BUCKET_NAME +
      '/' +
      keyName
  )

  // List all objects in the bucket
  const data = await s3.send(
    new ListObjectsV2Command({ Bucket: process.env.BACKBLAZE_BUCKET_NAME })
  )
  console.log('Objects in bucket: ', data.Contents)

  return { friendlyUrl }
}
