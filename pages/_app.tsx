import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import AppProviders from '@/components/Providers/AppProviders'
import { useHeading } from '@/components/Providers/HeadingProvider'
import { useRouter } from 'next/router'

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

  // Don't apply our general layout to the home page.
  // Could make this into the full layout pattern if any more changes made here
  // See https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts#layout-pattern
  const router = useRouter()
  const isHomePage = router.pathname === '/'
  return isHomePage ? (
    <Component {...pageProps} />
  ) : (
    <main
      className={`${inter.className} mx-auto flex h-[100dvh] max-w-screen-md flex-col`}
    >
      <Header heading={heading} />
      <Component {...pageProps} />
      <Analytics />
    </main>
  )
}
