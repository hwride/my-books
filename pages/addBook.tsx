import React, { useState } from 'react'
import Head from 'next/head'
import { coreDictionary } from '@/components/dictionary/core'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form } from '@/components/Form'
import { useSetHeading } from '@/components/providers/HeadingProvider'
import { BookListBook } from '@/components/BookList'

export default function AddBook() {
  useSetHeading('Add book')

  const router = useRouter()
  const [isUpdatePending, setIsUpdatePending] = useState(false)

  return (
    <>
      <Head>
        <title>{`${coreDictionary.siteName} | add a book`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Form<BookListBook>
        action="/api/book"
        method="post"
        className="mx-auto max-w-md p-page"
        isUpdatePending={isUpdatePending}
        setIsUpdatePending={setIsUpdatePending}
        onSuccess={(newBook) => router.push(`/book/${newBook.id}`)}
        onError={() => console.error(`Failed to add book`)}
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
          <label htmlFor="new-book-author" className="row-start-2 block">
            Author
          </label>
          <Input
            id="new-book-author"
            name="author"
            type="text"
            required
            className="col-start-2 row-start-2 self-stretch"
          />
          <label htmlFor="new-book-image" className="row-start-3 block">
            Cover image
          </label>
          <Input
            id="new-book-image"
            name="image"
            type="file"
            accept="image/*"
            className="col-start-2 row-start-3 self-stretch"
          />
        </div>
        <Button className="mx-auto block" disabled={isUpdatePending}>
          Add book
        </Button>
      </Form>
    </>
  )
}
