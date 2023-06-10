import { BookListBook } from '@/components/BookList'
import { Status } from '@prisma/client'
import { GetServerSideProps } from 'next'
import BookListPage from '@/components/BookListPage'
import { getServerSidePropsHelper } from '@/components/BookListPage/getServerSideProps'

const filterStatus = Status.READ

export default function FinishedBooks({ books }: { books: BookListBook[] }) {
  return (
    <BookListPage
      title="My books - finished books"
      heading="Finished books"
      books={books}
      filterStatus={filterStatus}
    />
  )
}

export const getServerSideProps: GetServerSideProps = async (opts) => {
  return getServerSidePropsHelper(filterStatus, opts)
}
