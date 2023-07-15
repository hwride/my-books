import { BookListBook } from '@/components/BookList'
import { GetServerSideProps } from 'next'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import React, { useState } from 'react'
import Head from 'next/head'
import { coreDictionary } from '@/components/dictionary/core'
import { Button } from '@/components/ui/button'
import { useSetHeading } from '@/components/providers/HeadingProvider'
import { Form } from '@/components/Form'
import { Input } from '@/components/ui/input'
import { router } from 'next/client'
import { useRouter } from 'next/router'

export default function Book({ book }: { book: BookListBook }) {
  useSetHeading(book.title)
  const [isEditing, setIsEditing] = useState(false)
  return (
    <>
      <Head>
        <title>{`${coreDictionary.siteName} | ${book.title}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      {isEditing ? (
        <EditBookForm book={book} />
      ) : (
        <div className="px-page">
          <div className="text-xl">{book.title}</div>
          <div className="text-lg text-gray-400">by {book.author}</div>
          <Button className="mt-4" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      )}
    </>
  )
}

export function EditBookForm({ book }: { book: BookListBook }) {
  const router = useRouter()
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author ?? '')
  const [isUpdatePending, setIsUpdatePending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  return (
    <Form
      action={`/api/book/${book.id}`}
      method="post"
      className="mx-auto max-w-md p-page"
      isUpdatePending={isUpdatePending}
      setIsUpdatePending={setIsUpdatePending}
      onSuccess={(newBook) => {
        setIsSuccess(true)
        router.reload()
      }}
      onError={() => console.error(`Failed to edit book`)}
    >
      <div className="mb-4 grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-x-2 gap-y-2">
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
      </div>
      <Button className="mx-auto block" disabled={isUpdatePending}>
        Save book
      </Button>
    </Form>
  )
}

export const getServerSideProps: GetServerSideProps<
  {
    book: BookListBook
  },
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
  const prisma = new PrismaClient()
  const book = await prisma.book.findFirst({
    select: {
      id: true,
      updatedAt: true,
      title: true,
      author: true,
      status: true,
    },
    where: {
      userId, // Make sure users can only view their own books at the moment.
      id: Number(params.id),
    },
  })

  if (book == null) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      book: {
        ...book,
        updatedAt: book.updatedAt.toISOString(),
      },
      ...buildClerkProps(req),
    },
  }
}
