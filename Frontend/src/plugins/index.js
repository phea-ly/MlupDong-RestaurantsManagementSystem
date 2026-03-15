import vuetify from './vuetify'
import pinia  from './pinia'
import router from '@/router'

export function registerPlugins(app) {
  app.use(vuetify)
  app.use(pinia)
  app.use(router)
}