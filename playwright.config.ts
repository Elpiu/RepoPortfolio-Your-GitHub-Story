import { defineConfig, devices } from '@playwright/test'

// Gli E2E girano sull'output statico di `pnpm generate` (offline in CI), servito
// come GitHub Pages da scripts/serve-static.mjs.
// E2E_PORT se la 4173 è occupata (es. da un `pnpm serve:static` già aperto).
const PORT = Number(process.env.E2E_PORT) || 4173

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node scripts/serve-static.mjs --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
  },
})
