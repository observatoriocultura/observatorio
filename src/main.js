import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'

// Importar Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'vue-toastification/dist/index.css'

// ✅ Importar estilos globales
import './assets/main.css'
import './assets/css/pacarina.css'

const toastOptions = {
  position: 'top-right',
  timeout: 4200,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  hideProgressBar: false,
}

createApp(App).use(router).use(Toast, toastOptions).mount('#app')
