import { Inter } from 'next/font/google'
import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { PrismaClient, Status } from '@prisma/client'
import { UserButton } from '@clerk/nextjs'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { MenuBar } from '@/components/MenuBar'

const inter = Inter({ subsets: ['latin'] })

export default function ReadingList({ books }: { books: BookListBook[] }) {
  return (
    <main className={`${inter.className} mx-auto max-w-screen-md`}>
      <Head>
        <title>My books - reading list</title>
      </Head>
      <h1 className="mx-auto mt-4 w-fit text-2xl">Reading list</h1>
      <MenuBar />
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            rootBox: 'absolute mt-4 mr-4 top-0 right-0',
          },
        }}
      />
      <BookList initialBooks={books} filterStatus={Status.NOT_READ} />
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
  const books = await prisma.book.findMany({
    select: {
      id: true,
      updatedAt: true,
      title: true,
      author: true,
      status: true,
    },
    where: {
      userId,
      status: 'NOT_READ',
    },
  })

  return {
    props: {
      books: books.map((book) => ({
        ...book,
        updatedAt: book.updatedAt.toISOString(),
      })),
      ...buildClerkProps(req),
    },
  }
}
