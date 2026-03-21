import vuetify from './vuetify'
import pinia   from './pinia'

export function registerKdsPlugins(app) {
  app.use(vuetify)
  app.use(pinia)
}