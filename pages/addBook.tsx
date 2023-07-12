import { Status } from '@prisma/client'
import React, { FormEvent, useState } from 'react'
import { Button } from '@/components/Button'
import { clsx } from 'clsx'
import Head from 'next/head'
import { coreDictionary } from '@/components/dictionary/core'
import { useRouter } from 'next/router'

export default function AddBook() {
  const router = useRouter()
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
      router.push(`/book/${newBook.id}`)
    } else {
      console.error(`Error when creating book`)
    }

    setIsUpdatePending(false)
  }

  return (
    <main className="mx-auto max-w-screen-md pt-8">
      <Head>
        <title>{`${coreDictionary.siteName} | add a book`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <h1 className="mx-auto w-fit text-2xl">Add a book</h1>
      <form
        action="/api/book"
        method="post"
        className="mx-auto max-w-md p-4"
        onSubmit={(e) => addBook(e)}
      >
        <div className="mb-4 grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-x-2 gap-y-2">
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
        </div>
        <Button className="mx-auto block" disabled={isUpdatePending}>
          Add book
        </Button>
      </form>
    </main>
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
