import { MenuBar } from '@/components/MenuBar'
import { UserButton } from '@clerk/nextjs'
import { ReactNode } from 'react'

export function Header({ heading }: { heading: ReactNode }) {
  return (
    <div>
      {/*
          We add some padding to the right to make sure the heading can never go behind the user icon.

          On larger screens add equivalent amount of padding to the left so the heading is still centered relative to
          the entire screen. This looks better as the eye is drawn to the heading and nav being aligned.

          But on smaller screens, it wastes space having that extra padding on the left, so in that case remove it.
          This has the effect of centering the heading between the left edge of the screen and the user icon in this
          case, but it makes better use of the space.

          359px was chosen because that's the point the menu starts to overflow (at time of writing), so it matches.
       */}
      <h1
        className={`mx-auto mb-2 mt-4 w-fit pl-page pr-[3.5rem] text-2xl min-[359px]:pl-[3.5rem]`}
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
