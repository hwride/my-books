import { Inter } from 'next/font/google'
import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { PrismaClient, Status } from '@prisma/client'
import { UserButton } from '@clerk/nextjs'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { MenuBar } from '@/components/MenuBar'
import { Header } from '@/components/Header'

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
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <BookList initialBooks={books} filterStatus={filterStatus} />
    </>
  )
}
