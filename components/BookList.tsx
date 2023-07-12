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
      <AddBook
        onBookAdd={(newBook) =>
          setBooks((oldBooks) =>
            filterBooks(oldBooks.map((b) => b).concat([newBook]))
          )
        }
      />
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

function AddBook({ onBookAdd }: { onBookAdd: (book: BookListBook) => void }) {
  const [isUpdatePending, setIsUpdatePending] = useState(false)

  const nameTitle = 'title'
  const nameAuthor = 'author'
  async function addBook(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setIsUpdatePending(true)

    const form = e.currentTarget
    const data = new FormData(form)
    const title = data.get(nameTitle) as Status
    const author = data.get(nameAuthor) as Status
    const options = {
      method: form.method,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        title,
        author,
      }),
    }

    const r = await fetch(form.action, options)

    if (r.ok) {
      const newBook = await r.json()
      onBookAdd(newBook)
    } else {
      console.error(`Error when creating book`)
    }

    setIsUpdatePending(false)
  }

  return (
    <form
      action="/api/book"
      method="post"
      className="mx-auto grid max-w-md grid-cols-[auto_1fr_auto] grid-rows-2 items-center gap-x-2 p-4"
      onSubmit={(e) => addBook(e)}
    >
      <label htmlFor="new-book-title" className="row-start-1 block">
        Title
      </label>
      <AddBookInput
        id="new-book-title"
        name="title"
        type="text"
        required
        minLength={1}
        className="col-start-2 row-start-1 self-stretch"
      />
      <label
        htmlFor="col-start-1 row-start-2 new-book-author"
        className="row-start-2 block"
      >
        Author
      </label>
      <AddBookInput
        id="new-book-author"
        name="author"
        type="text"
        required
        className="col-start-2 row-start-2 self-stretch"
      />
      <Button className="row-span-2" disabled={isUpdatePending}>
        Add book
      </Button>
    </form>
  )
}

function AddBookInput({
  className,
  ...args
}: {
  className?: string
  [x: string]: any
}) {
  return (
    <input
      {...args}
      className={clsx(
        className,
        'w-full self-stretch rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
      )}
    />
  )
}
