import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { Status } from '@prisma/client'

export default function BookListPage({
  title,
  books,
  nextCursor,
  filterStatus,
}: {
  title: string
  books: BookListBook[]
  nextCursor?: number
  filterStatus: Status
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <BookList
        initialBooks={books}
        nextCursor={nextCursor}
        filterStatus={filterStatus}
      />
    </>
  )
}
