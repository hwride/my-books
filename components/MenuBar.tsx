import Link from 'next/link'
import { useRouter } from 'next/router'
import { clsx } from 'clsx'

const activeLinkClass = 'text-black'
const nonActiveLinkClass = 'text-slate-400'

export function MenuBar({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <nav className={clsx('mx-auto w-fit', className)}>
      <ol className="flex gap-3">
        <li>
          <Link
            className={
              router.pathname == '/readingList'
                ? activeLinkClass
                : nonActiveLinkClass
            }
            href="/readingList"
          >
            Reading list
          </Link>
        </li>
        <li>
          <Link
            className={
              router.pathname == '/finishedBooks'
                ? activeLinkClass
                : nonActiveLinkClass
            }
            href="/finishedBooks"
          >
            Finished books
          </Link>
        </li>
      </ol>
    </nav>
  )
}
