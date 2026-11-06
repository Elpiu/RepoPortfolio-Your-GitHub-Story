import { defaultProfile, expect, secondaryLocale, site, test, ui } from './fixtures'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

test('/cv mostra gli stessi dati del profilo', async ({ page }) => {
  await page.goto('/cv')
  await expect(page.locator('h1')).toHaveText(defaultProfile.meta.fullName)
  for (const experience of defaultProfile.experiences) {
    await expect(page.getByText(experience.organization, { exact: false }).first()).toBeVisible()
  }
  await expect(page.getByRole('button', { name: ui('cv.downloadPdf') })).toBeVisible()
})

test('il bottone CV apre cvUrl se c è, altrimenti la pagina generata', async ({ page }) => {
  await page.goto('/')
  const button = page.getByTestId('profile-card').getByRole('link', {
    name: ui('bento.cv'),
    exact: true,
  })
  await expect(button).toHaveCount(1)

  if (site.links.cvUrl) {
    await expect(button).toHaveAttribute('href', site.links.cvUrl)
    await expect(button).toHaveAttribute('target', '_blank')
    await expect(button).toHaveAttribute('rel', /noopener/)
  } else {
    await button.click()
    await expect(page).toHaveURL(/\/cv\/?$/)
    await expect(page.locator('h1')).toHaveText(defaultProfile.meta.fullName)
  }

  // In entrambi i casi la pagina generata resta raggiungibile (F9).
  await page.goto('/cv')
  await expect(page.locator('.cv-document')).toBeVisible()
})

test('in stampa spariscono toolbar, header e footer', async ({ page }) => {
  await page.goto('/cv')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.cv-toolbar')).toBeHidden()
  await expect(page.locator('header.sticky')).toHaveCount(0)
  await expect(page.locator('footer')).toHaveCount(0)
  await expect(page.locator('.cv-document')).toBeVisible()
})

test('/resume.json rispetta la forma JSON Resume', async ({ request }) => {
  const response = await request.get('/resume.json')
  expect(response.status()).toBe(200)
  const resume = await response.json()

  expect(resume.basics).toMatchObject({
    name: defaultProfile.meta.fullName,
    label: defaultProfile.meta.role,
    email: site.links.email,
  })
  expect(Array.isArray(resume.basics.profiles)).toBe(true)
  for (const entry of [...resume.work, ...resume.education]) {
    expect(entry.startDate).toMatch(ISO_DATE)
    if (entry.endDate) expect(entry.endDate).toMatch(ISO_DATE)
  }
  expect(Array.isArray(resume.skills)).toBe(true)
  expect(Array.isArray(resume.projects)).toBe(true)
})

test('ogni lingua aggiuntiva ha CV ed export', async ({ request }) => {
  test.skip(!secondaryLocale, 'Una sola lingua configurata')
  expect((await request.get(`/${secondaryLocale!.code}/cv`)).status()).toBe(200)
  const response = await request.get(`/${secondaryLocale!.code}/resume.json`)
  expect(response.status()).toBe(200)
  expect((await response.json()).basics.name).toBeTruthy()
})
