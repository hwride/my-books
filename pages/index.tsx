import { Inter } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const inter = Inter({ subsets: ['latin'] })

const getLogoGradient = (
  stop1: number,
  stop2: number,
  stop3: number,
  stop4: number
) =>
  `radial-gradient(
  hsla(53, 82%, 58%, 1) ${stop1}%, 
  hsla(53, 84%, 74%, 1) ${stop2}%, 
  hsla(53, 100%, 91%, 1) ${stop3}%, 
  hsla(0, 0%, 100%, 1)  ${stop4}%
)`
const initialLogoAnimation = {
  backgroundImage: getLogoGradient(0, 15, 25, 35),
}
const hoverLogoAnimation = {
  scale: 1.3,
  backgroundImage: getLogoGradient(0, 20, 40, 60),
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
        initial={initialLogoAnimation}
        whileHover={hoverLogoAnimation}
        whileFocus={hoverLogoAnimation}
        whileTap={{ scale: 0.9 }}
        transition={{
          type: 'spring',
          bounce: 0.5,
          duration: 1.5,
          backgroundImage: {
            duration: 0.8,
          },
        }}
      >
        <Image
          className="max-w-[50vw]"
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
