import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { Status } from '@prisma/client'

export default function BookListPage({
  title,
  filterStatus,
  initialBooks,
  initialTotalBooks,
  initialHasMore,
}: {
  title: string
  filterStatus: Status
  initialBooks: BookListBook[]
  initialTotalBooks: number
  initialHasMore: boolean
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <BookList
        filterStatus={filterStatus}
        initialBooks={initialBooks}
        initialTotalBooks={initialTotalBooks}
        initialHasMore={initialHasMore}
      />
    </>
  )
}
