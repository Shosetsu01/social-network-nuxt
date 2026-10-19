export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  // FSD: components are imported explicitly through slice public APIs.
  components: { dirs: [] },
  css: ['~/assets/styles/tokens.css', '~/assets/styles/base.css'],
  app: {
    head: {
      title: 'Socio Network',
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
    tsConfig: { include: ['../tests/unit/**/*'] },
  },
})
