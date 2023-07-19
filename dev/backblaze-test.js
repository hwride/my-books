const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3')

main()

async function main() {
  try {
    const bucketName = 'my-books-images'
    const keyName = 'hello_world4.txt'
    const content = 'Hello World 4!'

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
        Bucket: bucketName,
        Key: keyName,
        Body: content,
      })
    )
    console.log(
      `Friendly URL: https://f003.backblazeb2.com/file/${bucketName}/${keyName}`
    )
    console.log(
      `S3 URL: https://${bucketName}.s3.${process.env.BACKBLAZE_REGION}.backblazeb2.com/${keyName}`
    )
    console.log(
      'Native URL: https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=' +
        result.VersionId
    )
    console.log('Successfully uploaded data to ' + bucketName + '/' + keyName)

    // List all objects in the bucket
    const data = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }))
    console.log('Objects in bucket: ', data.Contents)
  } catch (err) {
    console.log('Error: ', err)
  }
}
