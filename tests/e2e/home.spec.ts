import { IMAGE_HOSTS, defaultProfile, expect, test, ui } from './fixtures'

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

test('la GitHub Story parte dal lavoro e si filtra per tipo', async ({ page }) => {
  test.skip(
    !defaultProfile.experiences.some((entry) => entry.type === 'work') ||
      !defaultProfile.experiences.some((entry) => entry.type === 'education'),
    'Servono esperienze di lavoro e di formazione',
  )
  await page.goto('/')
  const nodes = page.locator('#experience li[data-kind]')
  const kinds = () => nodes.evaluateAll((items) => items.map((item) => item.dataset.kind))
  expect(new Set(await kinds())).toEqual(new Set(['work']))

  const tabs = page.getByRole('tablist', { name: ui('story.filters.label') })
  const tab = (key: string) => tabs.getByRole('tab', { name: new RegExp(`^${ui(key)}`) })
  await expect(tab('story.filters.work')).toHaveAttribute('aria-selected', 'true')

  // Scelta singola: Formazione sostituisce Lavoro, non si somma.
  await tab('story.filters.education').click()
  await expect(page).toHaveURL(/[?&]story=education/)
  await expect.poll(async () => new Set(await kinds())).toEqual(new Set(['education']))

  await page.reload()
  await expect.poll(async () => new Set(await kinds())).toEqual(new Set(['education']))

  await tab('story.filters.all').click()
  await expect.poll(async () => (await kinds()).length).toBeGreaterThan(2)
  await tab('story.filters.all').press('Home')
  await expect(tab('story.filters.work')).toBeFocused()
  await expect(page).not.toHaveURL(/[?&]story=/)
})

test('i filtri non spostano la pagina, anche dopo un link di sezione', async ({ page }) => {
  await page.goto('/')
  await page
    .locator('header nav')
    .getByRole('link', { name: ui('nav.experience') })
    .click()
  await expect(page).toHaveURL(/#experience$/)
  const tabs = page.getByRole('tablist', { name: ui('story.filters.label') })
  await expect(tabs).toBeInViewport()
  // Attende la fine dello scroll smooth del link di sezione.
  let before = -1
  await expect
    .poll(async () => {
      const current = await page.evaluate(() => Math.round(window.scrollY))
      const stable = current === before
      before = current
      return stable
    })
    .toBe(true)
  await tabs.getByRole('tab').last().click()
  await expect(page).toHaveURL(/[?&]story=/)
  await page.waitForTimeout(300)
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThan(4)
})

test('un link di sezione porta il titolo appena sotto l header', async ({ page }) => {
  await page.goto('/')
  for (const section of ['projects', 'about']) {
    await page
      .locator('header nav')
      .getByRole('link', { name: ui(`nav.${section}`) })
      .click()
    await expect(page).toHaveURL(new RegExp(`#${section}$`))
    await expect
      .poll(() =>
        page.evaluate((id) => {
          const header = document.querySelector('header')!.getBoundingClientRect().bottom
          return Math.abs(
            Math.round(document.getElementById(id)!.getBoundingClientRect().top - header),
          )
        }, section),
      )
      .toBeLessThanOrEqual(2)
  }
  // Ricliccare la sezione già nell'URL riporta comunque lì.
  await page.mouse.wheel(0, 1500)
  await page
    .locator('header nav')
    .getByRole('link', { name: ui('nav.about') })
    .click()
  await expect(page.locator('#about')).toBeInViewport()
})

test('le letture compaiono solo se il profilo elenca dei libri', async ({ page }) => {
  await page.goto('/')
  const navLink = page.locator('header nav').getByRole('link', { name: ui('nav.reading') })
  if (defaultProfile.books.length === 0) {
    await expect(page.locator('#reading')).toHaveCount(0)
    await expect(navLink).toHaveCount(0)
    return
  }
  await expect(page.getByTestId('book-card')).toHaveCount(defaultProfile.books.length)
  await navLink.click()
  await expect(page).toHaveURL(/#reading$/)
  await expect(page.locator('#reading')).toBeInViewport()
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
