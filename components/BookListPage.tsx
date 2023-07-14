import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { Status } from '@prisma/client'

export default function BookListPage({
  title,
  books,
  filterStatus,
}: {
  title: string
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
