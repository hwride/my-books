import { Inter } from 'next/font/google'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={`${inter.className}`}>
      <Head>
        <title>My books</title>
      </Head>
      <h1 className="mx-auto mt-6 w-fit text-2xl">My books</h1>
    </main>
  )
}
