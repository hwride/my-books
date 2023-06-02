import { Inter } from 'next/font/google'
import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { PrismaClient } from '@prisma/client'
import { UserButton } from '@clerk/nextjs'

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
    </main>
  )
}

export async function getStaticProps() {
  const prisma = new PrismaClient()
  const books: BookListBook[] = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: true,
    },
  })
  return {
    props: {
      books,
    },
  }
}
