import { createApp } from 'vue'
import { registerKdsPlugins } from '@/plugins/index.kds.js'
import KdsApp from '@/views/kds/KdsApp.vue'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(KdsApp)
registerKdsPlugins(app)
app.mount('#app')
