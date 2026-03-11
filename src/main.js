import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// ✅ Importar estilos globales
import './assets/main.css'
import './assets/css/pacarina.css'

createApp(App).use(router).mount('#app')
