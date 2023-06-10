const { PrismaClient } = require('@prisma/client')

/*
  Simple script ot make some requests with the Prisma client.
  Run pscale connect first to form a tunnel to the database.
*/

const prisma = new PrismaClient()

async function main() {
  try {
    const book = await prisma.book.create({
      data: {
        userId: 'user_2Qe8cujIZDQ53bknVE8ePlYt3vL',
        title: 'The Final Empire',
        author: 'Brandon Sanderson',
      },
    })
    console.log(book)
  } catch (error: any) {
    console.log(error.code)
    console.log(error.message)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
