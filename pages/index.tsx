import { Inter } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`${inter.className} flex h-[100dvh] flex-col items-center justify-center overflow-hidden`}
    >
      <Head>
        <title>My books</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'My books',
              url: 'https://www.my-books.dev/',
            }),
          }}
        />
        <meta
          name="description"
          content="Manage yours books - the books you want to read, or the books you've already read."
        />
      </Head>
      <h1 className="text-2xl">My books</h1>
      <Link href="/readingList">Reading list</Link>
      <Link href="/finishedBooks">Finished books</Link>
    </main>
  )
}
