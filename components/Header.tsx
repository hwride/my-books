import { useRouter } from 'next/router'
import { MenuBar } from '@/components/MenuBar'
import { UserButton } from '@clerk/nextjs'
import { ReactNode } from 'react'

export function Header({ heading }: { heading: ReactNode }) {
  const router = useRouter()
  return (
    <div>
      <h1 className="mx-auto mb-2 mt-4 w-fit text-2xl">{heading}</h1>
      <MenuBar className="mb-2" />
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            rootBox: 'absolute mt-4 mr-4 top-0 right-0',
          },
        }}
      />
    </div>
  )
}
