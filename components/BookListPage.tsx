import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { Status } from '@prisma/client'

export default function BookListPage({
  title,
  books,
  initialTotalBooks,
  nextCursor,
  filterStatus,
}: {
  title: string
  books: BookListBook[]
  initialTotalBooks: number
  nextCursor: number | null
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
        initialTotalBooks={initialTotalBooks}
        initialNextCursor={nextCursor}
        filterStatus={filterStatus}
      />
    </>
  )
}
