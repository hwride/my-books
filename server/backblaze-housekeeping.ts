import {
  _Object,
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'
import 'dotenv/config'
import zod from 'zod'
import { db } from '@/drizzle/db'
import { book } from '@/drizzle/schema'
import { isNotNull } from 'drizzle-orm'

// Env
const envSchema = zod.object({
  DELETE_ORPHAN_IMAGES: zod.string().optional(),
  DATABASE_URL: zod.string(),
  BACKBLAZE_REGION: zod.string(),
  BACKBLAZE_KEY_ID: zod.string(),
  BACKBLAZE_APP_KEY: zod.string(),
  BACKBLAZE_BUCKET_NAME: zod.string(),
})
const env = envSchema.parse({
  DELETE_ORPHAN_IMAGES: process.env.DELETE_ORPHAN_IMAGES,
  DATABASE_URL: process.env.DATABASE_URL,
  BACKBLAZE_REGION: process.env.BACKBLAZE_REGION,
  BACKBLAZE_KEY_ID: process.env.BACKBLAZE_KEY_ID,
  BACKBLAZE_APP_KEY: process.env.BACKBLAZE_APP_KEY,
  BACKBLAZE_BUCKET_NAME: process.env.BACKBLAZE_BUCKET_NAME,
})

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})

async function main() {
  console.log(
    `Running Backblaze housekeeping for bucket ${env.BACKBLAZE_BUCKET_NAME}...`
  )

  const s3Client = createBBS3Client()

  // Find all our cover image URLs.
  const coverImageUrls = await getCoverImageUrlsFromDb()
  console.log(
    `Found ${coverImageUrls.length} unique cover image URLs in the database`
  )

  // Find all images we currently have in our Backblaze bucket.
  const currentBucketContents = await getObjectsInBackblazeBucket(s3Client)
  console.log(
    `Found ${currentBucketContents.length} items in the Backblaze bucket`
  )
  if (currentBucketContents.length === 0) {
    console.warn('Found no items in the Backblaze buckets, is this expected?')
    return
  }

  // Find orphan images.
  const { bucketImagesReferencedByDb, orphanImages } = findOrphanImages(
    coverImageUrls,
    currentBucketContents
  )
  console.log('')
  console.log(
    `Found ${bucketImagesReferencedByDb.length} images in the Backblaze bucket ` +
      `still referenced in the database: ` +
      JSON.stringify(bucketImagesReferencedByDb, null, 2)
  )
  console.log(
    `Found ${orphanImages.length} orphan images in the Backblaze bucket ` +
      `no longer referenced by the database: ` +
      JSON.stringify(orphanImages, null, 2)
  )

  // Perform deletion of orphans.
  if (orphanImages.length > 0) {
    if (env.DELETE_ORPHAN_IMAGES === 'true') {
      await deleteOrphans(s3Client, orphanImages)
    } else {
      console.log(
        'Not deleting orphan images. Set DELETE_ORPHAN_IMAGES=true to perform the delete.'
      )
    }
  } else {
    console.log('No orphan images found, nothing to delete.')
  }
}

function createBBS3Client() {
  return new S3Client({
    endpoint: `https://s3.${env.BACKBLAZE_REGION}.backblazeb2.com`,
    region: env.BACKBLAZE_REGION,
    credentials: {
      accessKeyId: env.BACKBLAZE_KEY_ID,
      secretAccessKey: env.BACKBLAZE_APP_KEY,
    },
  })
}

async function getObjectsInBackblazeBucket(s3Client: S3Client) {
  try {
    // List all objects in the bucket
    const data = await s3Client.send(
      new ListObjectsV2Command({ Bucket: env.BACKBLAZE_BUCKET_NAME })
    )
    return data.Contents ?? []
  } catch (err) {
    console.log('Error getting objects from Backblaze: ', err)
    throw err
  }
}

async function getCoverImageUrlsFromDb(): Promise<string[]> {
  try {
    const booksWithCoverImage = await db
      .selectDistinct({
        coverImageUrl: book.coverImageUrl,
      })
      .from(book)
      .where(isNotNull(book.coverImageUrl))
    const coverImageUrlsInDb = booksWithCoverImage
      .map((b) => b.coverImageUrl)
      .filter((b): b is string => b != null)
    return coverImageUrlsInDb
  } catch (e: any) {
    console.log(
      `Failed to get cover image URLs from the database, code: ${e.code}, message: ${e.message}`
    )
    throw e
  }
}

type BucketImageResult = { imageUrl: string; bucketObj: _Object }

function findOrphanImages(
  coverImageUrls: string[],
  currentBucketContents: _Object[]
) {
  const coverImgIdToUrl: Record<string, string> = {}
  const coverImgInDBKeyMap: Record<string, boolean> = {}
  for (const coverImageUrl of coverImageUrls) {
    const match = coverImageUrl.match(/\/([^/]*)$/)
    if (match) {
      const key = match[1]
      coverImgIdToUrl[key] = coverImageUrl
      coverImgInDBKeyMap[key] = true
    } else {
      console.warn(
        `Could not parse ID out of cover image URL: ${coverImageUrl}`
      )
    }
  }

  const bucketImagesReferencedByDb: BucketImageResult[] = []
  const orphanImages: BucketImageResult[] = []
  for (const bucketObj of currentBucketContents) {
    if (bucketObj.Key) {
      const isImgInDb = coverImgInDBKeyMap[bucketObj.Key]
      if (isImgInDb) {
        bucketImagesReferencedByDb.push({
          imageUrl: coverImgIdToUrl[bucketObj.Key],
          bucketObj,
        })
      } else {
        orphanImages.push({
          imageUrl: `https://f003.backblazeb2.com/file/${env.BACKBLAZE_BUCKET_NAME}/${bucketObj.Key}`,
          bucketObj,
        })
      }
    } else {
      console.warn(
        `Bucket obj has a null key: ${JSON.stringify(bucketObj, null, 2)}`
      )
    }
  }
  return { bucketImagesReferencedByDb, orphanImages }
}

async function deleteOrphans(s3Client: S3Client, orphans: BucketImageResult[]) {
  for (const orphan of orphans) {
    try {
      process.stdout.write(`Deleting orphan ${orphan.bucketObj.Key}... `)
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.BACKBLAZE_BUCKET_NAME,
          Key: orphan.bucketObj.Key,
        })
      )

      console.log(`success`)
    } catch (error) {
      console.error(`error: `, error)
    }
  }
}
