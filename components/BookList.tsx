import { Status } from '@prisma/client'
import { clsx } from 'clsx'
import React, { FormEvent, useState } from 'react'
import { Button } from '@/components/Button'
import { BookSerializable } from '@/pages/api/book'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export type BookListBook = Pick<
  BookSerializable,
  'id' | 'updatedAt' | 'title' | 'author' | 'status'
>
export function BookList({
  initialBooks,
  filterStatus,
}: {
  initialBooks: BookListBook[]
  filterStatus: Status
}) {
  const filterBooks = (books: BookListBook[]) =>
    books.filter((book) => book.status === filterStatus)
  const [books, setBooks] = useState<BookListBook[]>(() =>
    filterBooks(initialBooks)
  )

  return (
    <div className="flex flex-col overflow-hidden">
      <ul className="overflow-auto">
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
      <Link href="/addBook" className="self-center py-3">
        Add a book
      </Link>
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

  async function markBookReadOrUnread(
    book: BookListBook,
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setIsUpdatePending(true)

    const form = e.currentTarget
    const data = new FormData(form)
    const newStatus = data.get('status') as Status
    const options = {
      method: form.method,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        updatedAt: book.updatedAt,
        status: newStatus,
      }),
    }

    const r = await fetch(form.action, options)

    if (r.ok) {
      const updatedBook = await r.json()
      onBookChange(updatedBook)
    } else {
      console.error(`Error when changing book read status`)
    }

    setIsUpdatePending(false)
  }

  return (
    <motion.li
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      key={book.id}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-[1fr_auto] grid-rows-1 items-center p-4">
        <Link className="group" href={`book/${book.id}`}>
          <div className="col-start-1 row-start-1 text-lg group-hover:underline">
            {book.title}
          </div>
          <div className="col-start-1 row-start-2 text-gray-400 group-hover:underline">
            by {book.author}
          </div>
        </Link>

        <form
          action={`/api/book/${book.id}`}
          method="post"
          className="col-start-2 row-span-2"
          onSubmit={(e) => markBookReadOrUnread(book, e)}
        >
          <input
            type="hidden"
            name="status"
            value={book.status === Status.READ ? Status.NOT_READ : Status.READ}
          />
          <Button disabled={isUpdatePending}>
            {book.status === Status.READ ? 'Mark as un-read' : 'Mark as read'}
          </Button>
        </form>
      </div>
    </motion.li>
  )
}
