import { test, expect } from '@playwright/experimental-ct-react'
import { Button } from '@/components/ui/button'

test('handles click events', async ({ mount }) => {
  let clickCount = 0

  const component = await mount(
    <Button onClick={() => clickCount++}>Click me</Button>
  )

  await expect(component).toBeVisible()
  await component.click()
  expect(clickCount).toBe(1)

  await component.click()
  expect(clickCount).toBe(2)
})

test('renders a button with default variant and size', async ({ mount }) => {
  const component = await mount(<Button>Click me</Button>)

  await expect(component).toContainText('Click me')
  const buttonClass = await component.getAttribute('class')
  expect(buttonClass).toContain('bg-slate-900')
  expect(buttonClass).toContain('h-9 px-4 py-2')
})

test('renders a button with destructive variant', async ({ mount }) => {
  const component = await mount(<Button variant="destructive">Delete</Button>)

  await expect(component).toContainText('Delete')
  expect(await component.getAttribute('class')).toContain('bg-red-500')
})

test('renders a button with small size', async ({ mount }) => {
  const component = await mount(<Button size="sm">Small Button</Button>)

  await expect(component).toContainText('Small Button')
  expect(await component.getAttribute('class')).toContain(
    'h-8 rounded-md px-3 text-xs'
  )
})
