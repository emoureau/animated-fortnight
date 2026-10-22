// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      // Dark mode only: the class is fixed and Nuxt UI's color-mode switching is off (ui.colorMode).
      htmlAttrs: { lang: 'en', class: 'dark' },
    },
  },

  icon: {
    serverBundle: {
      collections: ['mdi'],
    },
  },

  ui: {
    colorMode: false,
    theme: {
      colors: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
      ],
    },
  },

  experimental: {
    typedPages: true,
  },
})
