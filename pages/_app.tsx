import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import { ClerkProvider } from '@clerk/nextjs'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ClerkProvider {...pageProps}>
        <Component {...pageProps} />
        <Analytics />
      </ClerkProvider>
    </>
  )
}
