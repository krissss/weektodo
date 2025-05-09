import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

import { languages } from './assets/languages/languages.js'
import { store } from './store/store'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import 'bootstrap-icons/font/bootstrap-icons.css'

import './assets/style/main.scss'
import './assets/style/uiComponents.scss'

const messages = Object.assign(languages)
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

const app = createApp(App)

app.use(store)
app.use(i18n)
app.mount('#app')
