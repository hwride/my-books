import { test, expect } from '@playwright/test'

test('Click homepage logo', async ({ page }) => {
  await page.goto('https://www.my-books.dev/')
  await page.getByRole('link', { name: 'My books logo' }).click({ force: true })
  await expect(page).toHaveURL(/^https:\/\/www.my-books.dev\/sign-in.*/)
})
