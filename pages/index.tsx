import { Inter } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const inter = Inter({ subsets: ['latin'] })
const initialAnimation = {
  backgroundImage: 'none',
}
const hoverAnimation = {
  scale: 1.3,
  backgroundImage:
    'radial-gradient(hsla(53, 82%, 58%, 1) 0%, hsla(53, 84%, 74%, 1) 20%, hsla(53, 100%, 91%, 1) 38%, hsla(0, 0%, 100%, 1) 56%)',
}

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
      <h1 className="invisible mt-12 text-2xl">My books</h1>
      <MotionLink
        className="p-[150px]"
        href="/readingList"
        initial={initialAnimation}
        whileHover={hoverAnimation}
        whileFocus={hoverAnimation}
        whileTap={{ scale: 0.9 }}
        transition={{
          type: 'spring',
          bounce: 0.5,
          duration: 1.5,
          backgroundImage: {
            duration: 0.8,
            // Starts animation part way through. Useful as the start of the gradient is hidden by the image, so this
            // means we start the animation near where it's visible.
            delay: -0.25,
          },
        }}
      >
        <Image
          src="/android-chrome-512x512.png"
          alt="My books logo"
          width={250}
          height={250}
        />
      </MotionLink>
    </main>
  )
}

/*
padding: 150px;
    background-image: radial-gradient( white 0%, yellow 10%, gold 20%, white 30% );
 */

const MotionLink = motion(Link)
