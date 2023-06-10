import { Book, Status } from '@prisma/client'
import { clsx } from 'clsx'
import { FormEvent, useState } from 'react'
import { BookSerializable } from '@/pages/api/book/[bookid]'

export type BookListBook = Pick<
  BookSerializable,
  'id' | 'updatedAt' | 'title' | 'author' | 'status'
>
export function BookList({ initialBooks }: { initialBooks: BookListBook[] }) {
  const [books, setBooks] = useState<BookListBook[]>(initialBooks)

  return (
    <>
      <ul>
        {books.map((book) => (
          <BookListItem
            key={book.id}
            book={book}
            onBookChange={(updatedBook) =>
              setBooks((booksInner) =>
                booksInner.map((bookInner) =>
                  updatedBook.id === bookInner.id ? updatedBook : bookInner
                )
              )
            }
          />
        ))}
      </ul>
      <AddBook />
    </>
  )
}

function BookListItem({
  book,
  onBookChange,
}: {
  book: BookListBook
  onBookChange: (book: BookListBook) => void
}) {
  async function markBookReadOrUnread(
    book: BookListBook,
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
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
  }

  return (
    <li
      key={book.id}
      className="grid grid-cols-[1fr_auto] grid-rows-2 items-center p-4"
    >
      <div className="col-start-1 row-start-1 text-lg">{book.title}</div>
      <div className="col-start-1 row-start-2 text-gray-400">
        by {book.author}
      </div>

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
        <button className="rounded-full bg-black px-2 py-1 text-white">
          {book.status === Status.READ ? 'Mark as un-read' : 'Mark as read'}
        </button>
      </form>
    </li>
  )
}

function AddBook() {
  return (
    <form
      action="/api/book"
      method="post"
      className="grid max-w-md grid-cols-[auto_1fr_auto] grid-rows-2 items-center gap-x-2 p-4"
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
      <button className="row-span-2 rounded-full bg-black px-2 py-1 text-white">
        Add book
      </button>
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
