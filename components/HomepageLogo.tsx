import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const getLogoGradient = (
  stop1: number,
  stop2: number,
  stop3: number,
  stop4: number
) =>
  `radial-gradient(circle, 
  hsla(53, 82%, 58%, 1) ${stop1}%, 
  hsla(53, 84%, 74%, 1) ${stop2}%, 
  hsla(53, 100%, 91%, 1) ${stop3}%, 
  transparent  ${stop4}%
)`
const initialLogoAnimation = {
  backgroundImage: getLogoGradient(0, 15, 25, 35),
}
const hoverLogoAnimation = {
  scale: 1.3,
  backgroundImage: getLogoGradient(0, 20, 40, 60),
}

const MotionLink = motion(Link)
const MotionImage = motion(Image)
export function HomepageLogo() {
  const [isBookHovering, setIsBookHovering] = useState(false)
  console.log(isBookHovering)

  return (
    <MotionLink
      className="fixed inset-0 m-auto flex items-center justify-center"
      href="/readingList"
      initial={initialLogoAnimation}
      animate={isBookHovering ? hoverLogoAnimation : undefined}
      // whileHover={hoverLogoAnimation}
      // whileFocus={hoverLogoAnimation}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: 'spring',
        bounce: 0.5,
        duration: 1.2,
        backgroundImage: {
          duration: 0.6,
        },
      }}
    >
      <MotionImage
        className="max-w-[50vw]"
        src="/android-chrome-512x512.png"
        alt="My books logo"
        onHoverStart={(e) => setIsBookHovering(true)}
        onHoverEnd={(e) => setIsBookHovering(false)}
        onFocus={(e) => {
          console.log('focus', e)
        }}
        width={250}
        height={250}
        priority={true}
      />
    </MotionLink>
  )
}
