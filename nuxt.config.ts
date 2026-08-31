// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxt/test-utils/module'],
  app: {
    head: {
      title: 'Guapa DevOps App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Application Nuxt pour le TP DevOps CI/CD' }
      ]
    }
  }
})
