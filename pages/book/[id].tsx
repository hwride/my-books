import { BookListBook } from '@/components/BookList'
import { GetServerSideProps } from 'next'
import { buildClerkProps, getAuth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import React from 'react'
import Head from 'next/head'
import { coreDictionary } from '@/components/dictionary/core'
import { Inter } from 'next/font/google'
import { useSetHeading } from '@/components/Providers/HeadingProvider'

const inter = Inter({ subsets: ['latin'] })

export default function Book({ book }: { book: BookListBook }) {
  useSetHeading(book.title)
  return (
    <>
      <Head>
        <title>{`${coreDictionary.siteName} | ${book.title}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      {book.title} <span className="text-gray-400">by {book.author}</span>
    </>
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
