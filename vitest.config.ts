import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.spec.ts'],
    restoreMocks: true,
  },
})
