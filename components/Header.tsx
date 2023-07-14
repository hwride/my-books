import { MenuBar } from '@/components/MenuBar'
import { UserButton } from '@clerk/nextjs'
import { ReactNode } from 'react'

const userButtonWidthRem = 2
const userButtonMarginRem = 1
const userButtonSize = userButtonWidthRem + userButtonMarginRem

export function Header({ heading }: { heading: ReactNode }) {
  heading = 'The Curious Incident of the Dog in the Night-Time'
  return (
    <div>
      <h1
        className={`mb-2 ml-auto mr-[${userButtonSize}rem] mt-4 w-fit px-page text-2xl`}
      >
        {/* If no heading include a non breaking space to ensure we still reserve the space
            If changing this make sure you check the case when coming from home page as heading in empty initially */}
        {heading ? heading : <>&nbsp;</>}
      </h1>
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
