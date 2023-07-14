import type { AppProps } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { PropsWithChildren } from 'react'
import HeadingProvider from '@/components/providers/HeadingProvider'

export default function AppProviders({
  children,
  pageProps,
}: PropsWithChildren<AppProps>) {
  return (
    <HeadingProvider>
      <ClerkProvider {...pageProps}>{children}</ClerkProvider>
    </HeadingProvider>
  )
}
