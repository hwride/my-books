import { Status } from '@prisma/client'
import React, { FormEvent, useState } from 'react'
import { Button } from '@/components/Button'
import { clsx } from 'clsx'

export default function AddBook() {
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
