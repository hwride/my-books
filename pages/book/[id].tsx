import { BookListBook } from '@/components/BookList'
import { GetServerSideProps } from 'next'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import React, { useState } from 'react'
import Head from 'next/head'
import { coreDictionary } from '@/components/dictionary/core'
import { Button } from '@/components/ui/button'
import { useSetHeading } from '@/components/providers/HeadingProvider'
import { Form } from '@/components/Form'
import { Input } from '@/components/ui/input'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import Image from 'next/image'
import placeholderImg from '../../public/image-placeholder-1.5x1.jpg'
import {
  coverImageMaxFileSizeBytes,
  coverImageMaxFileSizeBytesLabel,
  coverImageRequiredHeightPx,
  coverImageRequiredWidthPx,
} from '@/config'
import { db } from '@/drizzle/db'
import { and, eq } from 'drizzle-orm'
import { book } from '@/drizzle/schema'

type BookProps = { initialBook: BookListBook }

export default function Book({ initialBook }: BookProps) {
  const [book, setBook] = useState<BookListBook>(initialBook)
  const { title, author } = book
  useSetHeading('')

  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeletePending, setIsDeletePending] = useState(false)

  return (
    <>
      <Head>
        <title>{`${coreDictionary.siteName} | ${title}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      {isEditing ? (
        <EditBookForm
          book={book}
          onSuccess={(updatedBook) => {
            setBook(updatedBook)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="mt-4 w-full max-w-screen-sm self-center px-page">
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Image
                className="rounded-lg"
                src={book.coverImageUrl ?? placeholderImg}
                alt="Image placeholder"
                priority={true}
                width={200}
                height={300}
              />
              <div className="sm:ml-2 sm:mt-2">
                <div className=" text-xl">{title}</div>
                <div className="text-lg text-gray-400">by {author}</div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              aria-label="Edit book"
              size="icon"
              variant="outline"
              disabled={
                isDeletePending /* Don't let users edit when a delete is pending */
              }
            >
              <Pencil1Icon />
            </Button>
          </div>
          <Form<undefined>
            method="post"
            action={`/api/book/${book.id}`}
            isUpdatePending={isDeletePending}
            setIsUpdatePending={setIsDeletePending}
            parseResponseJson={false}
            onSuccess={() => router.push(`/readingList`)}
            onError={() => console.error(`Failed to delete book`)}
          >
            <input type="hidden" name="updatedAt" value={book.updatedAt} />
            <input type="hidden" name="_method" value="DELETE" />
            <Button
              className="mx-auto mt-4 block"
              variant="destructive"
              disabled={isDeletePending}
            >
              Delete book
            </Button>
          </Form>
        </div>
      )}
    </>
  )
}

export function EditBookForm({
  book,
  onSuccess,
  onCancel,
}: {
  book: BookListBook
  onSuccess: (updatedBook: BookListBook) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author ?? '')
  const [validationErrors, setValidationsError] = useState<string[]>([])
  const [isUpdatePending, setIsUpdatePending] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let errors: string[] = []
    const file = event.target.files && event.target.files[0]

    if (file) {
      // Check file size
      if (file.size > coverImageMaxFileSizeBytes) {
        errors.push(
          `The cover image must be no larger than ${coverImageMaxFileSizeBytesLabel}.`
        )
      }

      // Check image dimensions
      const img = new window.Image()
      img.onload = function () {
        if (
          img.width !== coverImageRequiredWidthPx ||
          img.height !== coverImageRequiredHeightPx
        ) {
          errors.push(
            `The cover image must be ${coverImageRequiredWidthPx}x${coverImageRequiredHeightPx} pixels.`
          )
        }

        setValidationsError(errors)
      }
      img.src = URL.createObjectURL(file)
    }
  }

  return (
    <Form<BookListBook>
      action={`/api/book/${book.id}`}
      method="post"
      className="mx-auto max-w-md p-page"
      isUpdatePending={isUpdatePending}
      setIsUpdatePending={setIsUpdatePending}
      onSuccess={onSuccess}
      onError={() => console.error(`Failed to edit book`)}
    >
      <div className="mb-4 grid grid-cols-[minmax(50px,150px)_minmax(100px,1fr)] grid-rows-2 items-center gap-x-2 gap-y-2">
        <input type="hidden" name="updatedAt" value={book.updatedAt} />
        <label htmlFor="book-title" className="row-start-1 block">
          Title
        </label>
        <Input
          id="book-title"
          name="title"
          type="text"
          required
          minLength={1}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="col-start-2 row-start-1 self-stretch"
        />
        <label htmlFor="book-author" className="row-start-2 block">
          Author
        </label>
        <Input
          id="book-author"
          name="author"
          type="text"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="col-start-2 row-start-2 self-stretch"
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
      {validationErrors && (
        <ul className="mx-auto w-fit text-red-500" role="alert">
          {validationErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <div className="flex justify-around">
        <Button disabled={isUpdatePending}>Save book</Button>
        <Button
          variant="secondary"
          disabled={isUpdatePending}
          onClick={(e) => {
            e.preventDefault()
            onCancel()
          }}
        >
          Cancel
        </Button>
      </div>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps<
  BookProps,
  {
    id: string
  }
> = async ({ req, params }) => {
  const { userId } = getAuth(req)
  if (params?.id == null) {
    throw new Error('Book page requires an id param')
  }

  if (userId == null) {
    throw new Error('Should not have access to this page when not signed in')
  }
  const foundBooks = await db
    .select({
      id: book.id,
      updatedAt: book.updatedAt,
      createdAt: book.createdAt,
      title: book.title,
      author: book.author,
      status: book.status,
      coverImageUrl: book.coverImageUrl,
    })
    .from(book)
    .where(and(eq(book.userId, userId), eq(book.id, Number(params.id))))
    .limit(1)

  if (foundBooks.length === 0) {
    return {
      notFound: true,
    }
  } else if (foundBooks.length > 1) {
    throw new Error(`Found more than 1 book for id ${params.id}`)
  } else {
    const foundBook = foundBooks[0]
    return {
      props: {
        initialBook: foundBook,
        ...buildClerkProps(req),
      },
    }
  }
}
