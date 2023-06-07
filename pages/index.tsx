import { Inter } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`${inter.className} flex flex-col items-center justify-center overflow-hidden`}
      style={{ height: '100dvh' }} /* Tailwind doesn't have dvh atm */
    >
      <Head>
        <title>My books</title>
        <meta
          name="description"
          content="Manage yours books - the books you want to read, or the books you've already read."
        />
      </Head>
      <h1 className="text-2xl">My books</h1>
      <Link href="/dashboard">Dashboard</Link>
    </main>
  )
}
