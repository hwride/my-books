import { Inter } from 'next/font/google'
import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { PrismaClient, Status } from '@prisma/client'
import { UserButton } from '@clerk/nextjs'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { MenuBar } from '@/components/MenuBar'

const inter = Inter({ subsets: ['latin'] })

export default function BookListPage({
  title,
  heading,
  books,
  filterStatus,
}: {
  title: string
  heading: string
  books: BookListBook[]
  filterStatus: Status
}) {
  return (
    <main
      className={`${inter.className} mx-auto flex h-[100dvh] max-w-screen-md flex-col`}
    >
      <Head>
        <title>{title}</title>
      </Head>
      <h1 className="mx-auto mt-4 w-fit text-2xl">{heading}</h1>
      <MenuBar className="mb-2" />
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            rootBox: 'absolute mt-4 mr-4 top-0 right-0',
          },
        }}
      />
      <BookList initialBooks={books} filterStatus={filterStatus} />
    </main>
  )
}
