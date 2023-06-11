import { BookListBook } from '@/components/BookList'
import { Status } from '@prisma/client'
import { GetServerSideProps } from 'next'
import BookListPage from '@/components/BookListPage'
import { getServerSidePropsHelper } from '@/components/BookListPage/getServerSideProps'

const filterStatus = Status.NOT_READ

export default function ReadingList({ books }: { books: BookListBook[] }) {
  return (
    <BookListPage
      title="My books - reading list"
      heading="Reading list"
      books={books}
      filterStatus={filterStatus}
    />
  )
}

export const getServerSideProps: GetServerSideProps = async (opts) => {
  return getServerSidePropsHelper(filterStatus, opts)
}
