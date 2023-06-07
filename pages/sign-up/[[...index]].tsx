import { SignUp } from '@clerk/nextjs'
import Head from 'next/head'

export default function SignUpPage() {
  return (
    <main>
      <Head>
        <title>Sign in</title>
        <meta name="description" content="Sign up for my books" />
      </Head>
      <SignUp />
    </main>
  )
}
