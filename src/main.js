import { createApp } from 'vue'
import App from './App.vue'
import Toast from 'vue-toastification'
import { completeInvitationFromUrl, hasInvitationInUrl } from './lib/invitationFlow'

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

function showInvitationLoadingState() {
  const appRoot = document.querySelector('#app')
  if (!appRoot) return

  appRoot.innerHTML = `
    <main class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <section class="bg-white border rounded-3 shadow-sm p-4 text-center" aria-live="polite">
        <div class="spinner-border text-dark mb-3" role="status" aria-hidden="true"></div>
        <h1 class="h5 fw-bold">Validando invitación</h1>
        <p class="text-muted mb-0">Espera mientras preparamos tu cuenta.</p>
      </section>
    </main>
  `
}

async function bootstrap() {
  if (hasInvitationInUrl()) showInvitationLoadingState()

  try {
    await completeInvitationFromUrl()
  } catch (error) {
    console.error('[Invitation] No se pudo procesar el enlace:', error)
  }

  // El router se crea después de limpiar los tokens para que no interprete el hash como una ruta.
  const { default: router } = await import('./router')
  createApp(App).use(router).use(Toast, toastOptions).mount('#app')
}

bootstrap().catch((error) => {
  console.error('[App] No se pudo iniciar la aplicación:', error)
  const appRoot = document.querySelector('#app')
  if (appRoot) {
    appRoot.innerHTML = '<p class="alert alert-danger m-3">No se pudo iniciar la aplicación.</p>'
  }
})
