import { Inter } from 'next/font/google'
import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { PrismaClient } from '@prisma/client'
import { UserButton } from '@clerk/nextjs'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'

const inter = Inter({ subsets: ['latin'] })

export default function Dashboard({ books }: { books: BookListBook[] }) {
  return (
    <main className={`${inter.className}`}>
      <Head>
        <title>My books - finished books</title>
      </Head>
      <h1 className="mx-auto mt-4 w-fit text-2xl">Finished books</h1>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            rootBox: 'absolute mt-4 mr-4 top-0 right-0',
          },
        }}
      />
      <BookList books={books} />
    </main>
  )
}

// Needs to be SSRd because it can vary based on signed-in user.
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { userId } = getAuth(req)
  if (userId == null) {
    throw new Error('Should not have access to this page when not signed in')
  }

  const prisma = new PrismaClient()
  const books: BookListBook[] = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: true,
    },
    where: {
      userId,
      status: 'READ',
    },
  })

  return {
    props: {
      books,
      ...buildClerkProps(req),
    },
  }
}
