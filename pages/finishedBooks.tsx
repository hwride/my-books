import { BookListBook } from '@/components/BookList'
import { Status } from '@prisma/client'
import { GetServerSideProps } from 'next'
import BookListPage from '@/components/BookListPage'
import {
  BookListProps,
  getServerSidePropsHelper,
} from '@/components/BookListPage/getServerSideProps'
import { coreDictionary } from '@/components/dictionary/core'
import { useSetHeading } from '@/components/providers/HeadingProvider'

const filterStatus = Status.READ

export default function FinishedBooks({
  books,
  totalBooks,
  cursor,
}: BookListProps) {
  useSetHeading('Finished books')

  return (
    <BookListPage
      title={`${coreDictionary.siteName} | finished books`}
      initialBooks={books}
      initialTotalBooks={totalBooks}
      initialNextCursor={cursor}
      filterStatus={filterStatus}
    />
  )
}

export const getServerSideProps: GetServerSideProps<BookListProps> = async (
  opts
) => {
  return getServerSidePropsHelper(filterStatus, opts)
}
