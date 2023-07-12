import { Inter } from 'next/font/google'
import Head from 'next/head'
import { HomepageLogo } from '@/components/HomepageLogo'
import { coreDictionary } from '@/components/dictionary/core'

const inter = Inter({ subsets: ['latin'] })
const metaDescription =
  "Manage yours books - the books you want to read, or the books you've already read."

export default function Home() {
  return (
    <main
      className={`${inter.className} flex h-[100dvh] flex-col items-center`}
    >
      <Head>
        <title>{coreDictionary.siteName}</title>
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
        <meta name="description" content={metaDescription} />
        <meta property="og:url" content="https://www.my-books.dev" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="My books" />
        <meta property="og:description" content={metaDescription} />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_HTTP ? 'http' : 'https'}://${
            process.env.NEXT_PUBLIC_VERCEL_URL
          }/open-graph-1200x630.png`}
        />
      </Head>
      <h1 className="mt-12 text-2xl">My books</h1>
      <HomepageLogo />
    </main>
  )
}
