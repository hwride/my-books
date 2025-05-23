import { GetServerSideProps } from 'next'
import BookListPage from '@/components/BookListPage'
import {
  BookListProps,
  getServerSidePropsHelper,
} from '@/components/BookListPage/getServerSideProps'
import { coreDictionary } from '@/components/dictionary/core'
import { useSetHeading } from '@/components/providers/HeadingProvider'

const filterStatus = 'NOT_READ'

export default function ReadingList({
  books,
  totalBooks,
  hasMore,
  nextCursor,
}: BookListProps) {
  useSetHeading('Reading list')

  return (
    <BookListPage
      title={`${coreDictionary.siteName} | reading list`}
      initialBooks={books}
      initialTotalBooks={totalBooks}
      initialHasMore={hasMore}
      initialNextCursor={nextCursor ?? undefined}
      filterStatus={filterStatus}
    />
  )
}

export const getServerSideProps: GetServerSideProps<BookListProps> = async (
  opts
) => {
  return getServerSidePropsHelper(filterStatus, opts)
}
