import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import AppProviders from '@/components/Providers/AppProviders'
import { useHeading } from '@/components/Providers/HeadingProvider'

const inter = Inter({ subsets: ['latin'] })

export default function App(appProps: AppProps) {
  return (
    <AppProviders {...appProps}>
      <AppContent {...appProps} />
    </AppProviders>
  )
}

function AppContent({ Component, pageProps }: AppProps) {
  const heading = useHeading()
  return (
    <main className={`${inter.className} mx-auto h-[100dvh] max-w-screen-md`}>
      <Header heading={heading} />
      <Component {...pageProps} />
      <Analytics />
    </main>
  )
}
