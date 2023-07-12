import { Inter } from 'next/font/google'
import Head from 'next/head'
import { HomepageLogo } from '@/components/HomepageLogo'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`${inter.className} flex h-[100dvh] flex-col items-center`}
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
      <h1 className="mt-12 text-2xl">My books</h1>
      <HomepageLogo />
    </main>
  )
}
