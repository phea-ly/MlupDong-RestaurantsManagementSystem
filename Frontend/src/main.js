import { createApp } from 'vue'
import App from './App.vue'
import { registerPlugins } from './plugins'
import './assets/main.css'
import i18n from './i18n' // Import the i18n instance 

const app = createApp(App)
registerPlugins(app)
app.use(i18n) // Use the i18n instance
app.mount('#app')

