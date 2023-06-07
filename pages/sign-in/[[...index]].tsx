import { SignIn } from '@clerk/nextjs'
import Head from 'next/head'

export default function SignInPage() {
  return (
    <main className="flex h-[100dvh] items-center justify-center">
      <Head>
        <title>Sign in</title>
        <meta name="description" content="Sign in to my books" />
      </Head>
      <SignIn />
    </main>
  )
}
