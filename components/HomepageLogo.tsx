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

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 m-auto flex items-center justify-center"
      initial={initialLogoAnimation}
      animate={
        // On touch devices you can't really hover, so in that case just always apply the animation
        {
          ...(isTouchDevice() || isBookHovering
            ? hoverLogoAnimation
            : undefined),
          y: [0, 18, 0],
        }
      }
      whileTap={{ scale: 0.9 }}
      transition={{
        y: {
          repeat: Infinity,
          // When using the current keyframes setting type: spring seems to break the animation for some reason.
          duration: 2,
          ease: 'easeInOut',
        },
        scale: {
          type: 'spring',
          bounce: 0.5,
          duration: 1.2,
        },
        backgroundImage: { duration: 0.6 },
      }}
    >
      <MotionLink
        href="/readingList"
        className="pointer-events-auto"
        onHoverStart={() => setIsBookHovering(true)}
        onHoverEnd={() => setIsBookHovering(false)}
        onFocus={() => setIsBookHovering(true)}
        onBlur={() => setIsBookHovering(false)}
        whileTap={{ scale: 0.8 }}
      >
        <MotionImage
          className="max-w-[50vw] py-2"
          src="/android-chrome-512x512.png"
          alt="My books logo"
          width={250}
          height={250}
          priority={true}
        />
      </MotionLink>
    </motion.div>
  )
}

function isTouchDevice() {
  if (typeof window === 'undefined') return false // Handle SSG/SSR
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  )
}
