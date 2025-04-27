import 'dotenv/config'
import { db } from '../drizzle/db'
import { book } from '../drizzle/schema'

/*
  Simple script to make some requests with the Drizzle client.
*/

async function main() {
  try {
    console.log('Performing Drizzle query db.select().from(book).execute()')
    const results = await db
      .select({
        id: book.id,
        updatedAt: book.updatedAt,
        createdAt: book.createdAt,
        title: book.title,
        author: book.author,
        status: book.status,
        coverImageUrl: book.coverImageUrl,
      })
      .from(book)
    console.log('Results', results)
  } catch (error) {
    console.log('Error', error)
  }
}

main()
  .then(async () => {
    console.log('Done')
    await db.$client.end()
  })
  .catch(async (error) => {
    console.log('Error', error)
    await db.$client.end()
    process.exit(1)
  })
