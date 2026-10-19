import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests cover framework-free modules, so the Nuxt aliases are mirrored by hand.
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '@shared': fileURLToPath(new URL('./app/shared', import.meta.url)),
      '@entities': fileURLToPath(new URL('./app/entities', import.meta.url)),
      '@features': fileURLToPath(new URL('./app/features', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./app/widgets', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
