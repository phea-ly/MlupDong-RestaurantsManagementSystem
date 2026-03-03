import vuetify from './vuetify'
import pinia from './pinia'

export function registerPlugins(app) {
  app.use(pinia)
  app.use(vuetify)
}