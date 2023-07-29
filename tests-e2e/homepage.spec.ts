import { test, expect } from '@playwright/test'

test('Click homepage logo', async ({ page, baseURL }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'My books logo' }).click({ force: true })
  await expect(page).toHaveURL(new RegExp('^' + baseURL + '/sign-in.*'))
})
