import { Inter } from 'next/font/google'
import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { PrismaClient } from '@prisma/client'
import { UserButton } from '@clerk/nextjs'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'

const inter = Inter({ subsets: ['latin'] })

export default function Home({ books }: { books: BookListBook[] }) {
  return (
    <main className={`${inter.className}`}>
      <Head>
        <title>My books</title>
      </Head>
      <div className="ml-auto w-fit p-3 pb-0">
        <UserButton afterSignOutUrl="/" />
      </div>
      <h1 className="mx-auto mt-6 w-fit text-2xl">My books</h1>
      <BookList books={books} />
      <form action="/api/book" method="post">
        <div className="border border-gray-100 p-2">
          <label className="block">
            Title
            <input
              name="title"
              type="text"
              required
              minLength={1}
              className="border border-gray-100"
            />
          </label>
          <label className="block">
            Author
            <input
              name="author"
              type="text"
              required
              className="border border-gray-100"
            />
          </label>
          <button className="mt-2 rounded-full bg-black px-2 py-1 text-white">
            Add book
          </button>
        </div>
      </form>
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
    },
  })

  return {
    props: {
      books,
      ...buildClerkProps(req),
    },
  }
}
