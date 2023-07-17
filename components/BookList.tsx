import { Status } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { BookSerializable } from '@/pages/api/book'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/Form'

export type BookListBook = Pick<
  BookSerializable,
  'id' | 'updatedAt' | 'title' | 'author' | 'status'
>
export function BookList({
  initialTotalBooks,
  initialBooks,
  initialNextCursor,
  filterStatus,
}: {
  initialTotalBooks: number
  initialBooks: BookListBook[]
  initialNextCursor: number | null
  filterStatus: Status
}) {
  const filterBooks = (books: BookListBook[]) =>
    books.filter((book) => book.status === filterStatus)
  const [books, setBooks] = useState<BookListBook[]>(() =>
    filterBooks(initialBooks)
  )

  const [totalBooks, setTotalBooks] = useState(initialTotalBooks)
  const [loadMore, setLoadMore] = useState('idle')
  const [cursor, setCursor] = useState(initialNextCursor)

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="px-page text-right italic text-gray-600">
        Showing {books.length} of {totalBooks}
      </div>
      <ul className="overflow-auto px-page">
        <AnimatePresence initial={false}>
          {books.map((book) => (
            <BookListItem
              key={book.id}
              book={book}
              onBookChange={(updatedBook) =>
                setBooks((booksInner) =>
                  filterBooks(
                    booksInner.map((bookInner) =>
                      updatedBook.id === bookInner.id ? updatedBook : bookInner
                    )
                  )
                )
              }
            />
          ))}
        </AnimatePresence>
      </ul>
      {cursor ? (
        <Button
          className="mx-auto"
          variant="outline"
          disabled={loadMore === 'pending'}
          onClick={async () => {
            setLoadMore('pending')
            const response = await fetch(
              `/api/books?status=NOT_READ&cursor=${cursor}`
            )
            if (response.ok) {
              const json = await response.json()
              const newBooks = json.books
              setBooks((books) => [...books, ...newBooks])
              setTotalBooks(json.totalBooks)
              setCursor(json.cursor)
              setLoadMore('success')
            } else {
              setLoadMore('error')
            }
          }}
        >
          Load more
        </Button>
      ) : null}
    </div>
  )
}

function BookListItem({
  book,
  onBookChange,
}: {
  book: BookListBook
  onBookChange: (book: BookListBook) => void
}) {
  const [isUpdatePending, setIsUpdatePending] = useState(false)

  return (
    <motion.li
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      key={book.id}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-[1fr_auto] grid-rows-1 items-center gap-2 py-4">
        <Link className="group" href={`book/${book.id}`}>
          <div className="col-start-1 row-start-1 text-lg group-hover:underline">
            {book.title}
          </div>
          <div className="col-start-1 row-start-2 text-gray-400 group-hover:underline">
            by {book.author}
          </div>
        </Link>

        <Form<BookListBook>
          className="col-start-2 row-span-2"
          method="post"
          action={`/api/book/${book.id}`}
          isUpdatePending={isUpdatePending}
          setIsUpdatePending={setIsUpdatePending}
          onSuccess={onBookChange}
          onError={() => console.error(`Error when changing book read status`)}
        >
          <input type="hidden" name="updatedAt" value={book.updatedAt} />
          <input
            type="hidden"
            name="status"
            value={book.status === Status.READ ? Status.NOT_READ : Status.READ}
          />
          <Button disabled={isUpdatePending}>
            {book.status === Status.READ ? 'Mark as un-read' : 'Mark as read'}
          </Button>
        </Form>
      </div>
    </motion.li>
  )
}
