import { Status } from '@prisma/client'
import React, { useRef, useState } from 'react'
import { motion, AnimatePresence, AnimationDefinition } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/Form'
import { AnimatingNumber } from '@/components/AnimatingNumber'
import { BookSerializable } from '@/models/Book'

export type BookListBook = Pick<
  BookSerializable,
  'id' | 'updatedAt' | 'title' | 'author' | 'status' | 'coverImageUrl'
>
export function BookList({
  initialTotalBooks,
  initialBooks,
  initialHasMore,
  filterStatus,
}: {
  initialTotalBooks: number
  initialBooks: BookListBook[]
  initialHasMore: boolean
  filterStatus: Status
}) {
  const filterBooks = (books: BookListBook[]) =>
    books.filter((book) => book.status === filterStatus)
  const [books, setBooks] = useState<BookListBook[]>(() =>
    filterBooks(initialBooks)
  )

  // Don't scroll books to end for initial page load, as we want users to see the start of the list.
  const [shouldScrollBooksToEnd, setShouldScrollBooksToEnd] = useState(false)
  const [previousCurBooks, setPreviousCurBooks] = useState(books.length)
  const [previousTotalBooks, setPreviousTotalBooks] =
    useState(initialTotalBooks)
  const [totalBooks, setTotalBooks] = useState(initialTotalBooks)
  const [loadMore, setLoadMore] = useState('idle')
  const [hasMore, setHasMore] = useState(initialHasMore)

  // If we have books then use the last book's ID for the cursor.
  // Otherwise request from the beginning. This case can happen if you mark all currently visible books as read, but
  // there are more that have not yet been loaded.
  const cursor = books.length > 0 ? books[books.length - 1].id : null

  const endOfListRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="px-page pb-2 text-right italic text-gray-600">
        Showing <AnimatingNumber from={previousCurBooks} to={books.length} /> of{' '}
        <AnimatingNumber from={previousTotalBooks} to={totalBooks} />
      </div>
      <ul className="overflow-auto px-page">
        <AnimatePresence initial={false}>
          {books.map((book) => (
            <BookListItem
              key={book.id}
              book={book}
              onBookChange={(updatedBook) => {
                const curBooksLen = books.length
                let newBooksLen: number
                setPreviousCurBooks(curBooksLen)
                setBooks((booksInner) => {
                  const newBooks = filterBooks(
                    booksInner.map((bookInner) =>
                      updatedBook.id === bookInner.id ? updatedBook : bookInner
                    )
                  )
                  newBooksLen = newBooks.length
                  return newBooks
                })
                setPreviousTotalBooks(totalBooks)
                setTotalBooks((totalBooks) =>
                  newBooksLen > curBooksLen ? totalBooks + 1 : totalBooks - 1
                )
              }}
              // Scroll to the end of the list whenever books changes. Need to wait for framer motion animations to
              // finish first though.
              onAnimationComplete={() => {
                if (shouldScrollBooksToEnd) {
                  endOfListRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            />
          ))}
          <div ref={endOfListRef} />
        </AnimatePresence>
        <Button
          className="mx-auto mb-4 block"
          variant="outline"
          disabled={!hasMore || loadMore === 'pending'}
          onClick={async () => {
            setLoadMore('pending')
            const response = await fetch(
              `/api/books?status=${filterStatus}&cursor=${cursor}`
            )
            if (response.ok) {
              const json = await response.json()
              const newBooks = json.books
              setShouldScrollBooksToEnd(true)
              setPreviousCurBooks(books.length)
              setBooks((books) => [...books, ...newBooks])
              setPreviousTotalBooks(totalBooks)
              setTotalBooks(json.totalBooks)
              setHasMore(json.hasMore)
              setLoadMore('success')
            } else {
              setLoadMore('error')
            }
          }}
        >
          Load more
        </Button>
      </ul>
    </div>
  )
}

function BookListItem({
  book,
  onBookChange,
  onAnimationComplete,
}: {
  book: BookListBook
  onBookChange: (book: BookListBook) => void
  onAnimationComplete: (definition: AnimationDefinition) => void
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
      onAnimationComplete={onAnimationComplete}
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
