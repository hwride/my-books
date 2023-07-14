import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'

export const HeadingContext = createContext<{
  heading?: string
  setHeading: (newHeading: string) => void
}>({
  heading: undefined,
  setHeading: () => {},
})

export function useSetHeading(newHeading: string) {
  const { setHeading } = useContext(HeadingContext)
  useEffect(() => setHeading(newHeading), [setHeading, newHeading])
}

export function useHeading() {
  const { heading } = useContext(HeadingContext)
  return heading
}

/**
 * Provider for the page heading.
 */
export default function HeadingProvider({ children }: PropsWithChildren) {
  const [heading, setHeading] = useState(undefined)

  return (
    <HeadingContext.Provider value={{ heading, setHeading }}>
      {children}
    </HeadingContext.Provider>
  )
}
