import { Status } from '@prisma/client'
import React, { FormEvent, useState } from 'react'
import { clsx } from 'clsx'
import Head from 'next/head'
import { coreDictionary } from '@/components/dictionary/core'
import { useRouter } from 'next/router'
import { Header } from '@/components/Header'
import { Inter } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const inter = Inter({ subsets: ['latin'] })

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
    <main className={`${inter.className} mx-auto max-w-screen-md`}>
      <Head>
        <title>{`${coreDictionary.siteName} | add a book`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Header heading="Add a book" />
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
          <Input
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
          <Input
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
