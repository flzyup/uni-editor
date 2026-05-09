import App from './App.vue'
import i18n from './locales/index.js'
import { ViteSSG } from 'vite-ssg'

export const createApp = ViteSSG(App, { base: import.meta.env.BASE_URL, routes: [] }, ({ app }) => {
  app.use(i18n)
})
