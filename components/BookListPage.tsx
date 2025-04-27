import Head from 'next/head'
import { BookListBook, BookList } from '@/components/BookList'
import { Book } from '@/models/Book'

export default function BookListPage({
  title,
  filterStatus,
  initialBooks,
  initialTotalBooks,
  initialHasMore,
  initialNextCursor,
}: {
  title: string
  filterStatus: Book['status']
  initialBooks: BookListBook[]
  initialTotalBooks: number
  initialHasMore: boolean
  initialNextCursor?: string
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
        initialNextCursor={initialNextCursor}
      />
    </>
  )
}
