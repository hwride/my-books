import { Inter } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
      <MotionLink
        href="/readingList"
        whileHover={{ scale: 1.3 }}
        whileFocus={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
        transition={{
          type: 'spring',
          // duration: 0.5,
          bounce: 0.5,
        }}
      >
        <Image
          src="/android-chrome-512x512.png"
          alt="My books logo"
          width={250}
          height={250}
        />
      </MotionLink>
      <h1 className="mt-12 text-2xl">My books</h1>
    </main>
  )
}

const MotionLink = motion(Link)
