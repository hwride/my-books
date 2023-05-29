import { Inter } from 'next/font/google'
import Head from 'next/head'
import { Book, BookList } from '@/components/BookList'
import mysql from 'mysql2/promise';

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
  let books: Book[] = [];
  if(process.env.DATABASE_URL != null) {
    const connection = await mysql.createConnection(process.env.DATABASE_URL)
    const [rows, fields] = await connection.query('SELECT title, author from Book');
    books = rows as Book[];
    await connection.end();
  }

  return {
    props : {
      books
    }
  }
}
