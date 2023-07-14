import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.className} mx-auto h-[100dvh] max-w-screen-md`}>
      <ClerkProvider {...pageProps}>
        <Header heading={''} />
        <Component {...pageProps} />
        <Analytics />
      </ClerkProvider>
    </main>
  )
}
