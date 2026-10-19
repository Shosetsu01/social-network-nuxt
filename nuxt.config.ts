import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  // FSD: components are imported explicitly through slice public APIs.
  components: { dirs: [] },
  // FSD layer aliases: `@entities/post` instead of `~/entities/post`. `#shared` stays for client/server contracts.
  alias: {
    '@shared': fileURLToPath(new URL('./app/shared', import.meta.url)),
    '@entities': fileURLToPath(new URL('./app/entities', import.meta.url)),
    '@features': fileURLToPath(new URL('./app/features', import.meta.url)),
    '@widgets': fileURLToPath(new URL('./app/widgets', import.meta.url)),
  },
  css: ['~/assets/styles/tokens.css', '~/assets/styles/base.css'],
  app: {
    head: {
      title: 'Socio Network',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Urbanist:wght@400;600;700&display=swap',
        },
      ],
    },
  },
  compatibilityDate: '2026-10-01',
  typescript: {
    strict: true,
    // Unit tests run outside the Nuxt runtime but should still be type-checked.
    tsConfig: { include: ['../tests/unit/**/*', '../tests/e2e/**/*', '../playwright.config.ts'] },
  },
})
