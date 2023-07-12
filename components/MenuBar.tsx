import Link from 'next/link'
import { useRouter } from 'next/router'
import { clsx } from 'clsx'

const activeLinkClass = 'text-black'
const nonActiveLinkClass = 'text-slate-400'

const menuConfig = [
  {
    title: 'Reading list',
    href: '/readingList',
  },
  {
    title: 'Finished books',
    href: '/finishedBooks',
  },
  {
    title: 'Add a book',
    href: '/addBook',
  },
]

export function MenuBar({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <nav className={clsx('mx-auto w-fit', className)}>
      <ol className="flex gap-3">
        {menuConfig.map((config) => (
          <li key={config.href}>
            <Link
              className={
                router.pathname == config.href
                  ? activeLinkClass
                  : nonActiveLinkClass
              }
              href={config.href}
            >
              {config.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
