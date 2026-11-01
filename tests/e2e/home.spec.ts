import { IMAGE_HOSTS, defaultProfile, expect, test } from './fixtures'

test('la griglia di default è già nell HTML statico', async ({ request }) => {
  const html = await (await request.get('/')).text()
  expect(html).toContain('data-testid="project-card"')
  expect(html).toContain('data-testid="profile-card"')
})

test('home: un solo h1 e Bento completa', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText(defaultProfile.meta.fullName)
  await expect(page.getByTestId('profile-card')).toBeVisible()
  await expect(page.getByTestId('top-repo-card')).toBeVisible()
  await expect(page.getByTestId('activity-card')).toBeVisible()
})

test('nessuna richiesta a API, font o icone esterne', async ({ page, externalRequests }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.getByTestId('project-card').first().scrollIntoViewIfNeeded()

  const disallowed = externalRequests.filter((url) => !IMAGE_HOSTS.has(new URL(url).hostname))
  expect(disallowed).toEqual([])
  expect(externalRequests.some((url) => url.includes('api.github.com'))).toBe(false)
})

test('gli id di sezione del legacy esistono', async ({ page }) => {
  await page.goto('/')
  for (const id of ['home', 'about', 'projects', 'skills', 'experience', 'contact']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
})

test('un vecchio link con hash atterra sulla sezione', async ({ page }) => {
  await page.goto('/#projects')
  await expect(page.locator('#projects')).toBeInViewport()
})

test('l HTML statico contiene solo date assolute', async ({ request }) => {
  const html = await (await request.get('/')).text()
  const activity = html.slice(html.indexOf('data-testid="activity-card"'))
  expect(activity).toMatch(/<time[^>]*>\s*\d{4}\.\d{2}\.\d{2}\s*<\/time>/)
})

test('la GitHub Story si espande e collassa', async ({ page }) => {
  await page.goto('/')
  const node = page.locator('#experience details').first()
  await expect(node).toBeVisible()
  await expect(node).not.toHaveAttribute('open', '')
  await node.locator('summary').click()
  await expect(node).toHaveAttribute('open', '')
  await node.locator('summary').press('Enter')
  await expect(node).not.toHaveAttribute('open', '')
  await expect(node.locator('time').first()).toHaveAttribute('datetime', /^\d{4}-\d{2}/)
})
