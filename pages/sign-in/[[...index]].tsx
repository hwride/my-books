import { SignIn } from '@clerk/nextjs'
import Head from 'next/head'

export default function SignInPage() {
  return (
    <main>
      <Head>
        <title>Sign in</title>
      </Head>
      <SignIn />
    </main>
  )
}
