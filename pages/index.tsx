import { Inter } from 'next/font/google'
import Head from 'next/head'
import { Book, BookList } from '@/components/BookList'

const inter = Inter({ subsets: ['latin'] })

export default function Home({books}: { books: Book[]
}) {
  return (
    <main className={`${inter.className}`}>
      <Head>
        <title>My books</title>
      </Head>
      <h1 className="mx-auto mt-6 w-fit text-2xl">My books</h1>
      <BookList books={books} />
    </main>
  )
}

export async function getStaticProps() {
  return {
    props : {
      books: [{
        title: 'The Final Empire',
        author: 'Brandon Sanderson'
      }, {
        title: 'The Well of Ascension',
        author: 'Brandon Sanderson'
      }, {
        title: 'The Hero of Ages',
        author: 'Brandon Sanderson'
      }]
    }
  }
}
