import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
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
    <NavigationMenu className={clsx(className, 'mx-auto')}>
      <NavigationMenuList>
        {menuConfig.map((component) => (
          <NavigationMenuItem key={component.href}>
            <Link href={component.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                active={router.pathname == component.href}
              >
                {component.title}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
