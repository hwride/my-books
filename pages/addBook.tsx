import React, { useState } from 'react'
import Head from 'next/head'
import { coreDictionary } from '@/components/dictionary/core'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form } from '@/components/Form'
import { useSetHeading } from '@/components/providers/HeadingProvider'
import { BookListBook } from '@/components/BookList'
import {
  maxCoverImageFileSizeBytes,
  maxCoverImageFileSizeBytesLabel,
} from '@/config'

export default function AddBook() {
  useSetHeading('Add book')

  const router = useRouter()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isUpdatePending, setIsUpdatePending] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0]

    if (file) {
      // Check file size
      if (file.size > maxCoverImageFileSizeBytes) {
        setValidationError(
          `The cover image must be no larger than ${maxCoverImageFileSizeBytesLabel}.`
        )
        return
      }

      // Check image dimensions
      const img = new Image()
      img.onload = function () {
        if (img.width !== 400 || img.height !== 600) {
          setValidationError('The cover image must be 400x600 pixels.')
        } else {
          setValidationError(null)
        }
      }
      img.src = URL.createObjectURL(file)
    }
  }

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
        <div className="mb-4 grid grid-cols-[minmax(50px,150px)_minmax(100px,1fr)] grid-rows-2 items-center gap-2">
          <label htmlFor="new-book-title" className="row-start-1 block">
            Title
          </label>
          <Input
            id="new-book-title"
            name="title"
            type="text"
            required
            minLength={1}
            className="col-start-2 row-start-1"
          />
          <label htmlFor="new-book-author" className="row-start-2 block">
            Author
          </label>
          <Input
            id="new-book-author"
            name="author"
            type="text"
            required
            className="col-start-2 row-start-2"
          />
          <label htmlFor="new-book-image" className="row-start-3 block">
            Cover image (must be 400x600px)
          </label>
          <Input
            id="new-book-image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="col-start-2 row-start-3"
          />
        </div>

        {validationError && (
          <p className="text-center text-red-500">{validationError}</p>
        )}
        <Button
          className="mx-auto mt-4 block"
          disabled={validationError != null || isUpdatePending}
        >
          Add book
        </Button>
      </Form>
    </>
  )
}
