import React, { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

export function AnimatingNumber({
  from,
  to,
  duration = 0.3,
}: {
  from: number
  to: number
  duration?: number
}) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      onUpdate(value) {
        if (ref.current) {
          ref.current.textContent = value.toFixed(0)
        }
      },
    })
    return () => controls.stop()
  }, [from, to, duration])

  return <span ref={ref} />
}
