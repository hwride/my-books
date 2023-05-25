import { Inter } from 'next/font/google'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={`${inter.className}`}>
      <Head>
        <title>My books</title>
      </Head>
      <h1>My books</h1>
    </main>
  )
}
