<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { hasSupabaseConfig, supabase } from '../../lib/supabase'
import { getAuthCallbackDestination } from '../../lib/authCallback'
import { rememberPasswordRecoverySession } from '../../lib/passwordRecoveryFlow'
import '../../assets/styles/auth.css'

const route = useRoute()
const router = useRouter()
const authLogoUrl = `${import.meta.env.BASE_URL}resources/images/app/logotipo-navbar.png`

const status = ref('loading')
const feedback = ref('Validando el enlace seguro...')

const flow = computed(() =>
  Array.isArray(route.query.flow) ? route.query.flow[0] : route.query.flow,
)
const isPasswordSetup = computed(() => ['invitation', 'recovery'].includes(flow.value))
const fallbackRoute = computed(() => (isPasswordSetup.value ? '/forgot-password' : '/login/link'))
const fallbackLabel = computed(() =>
  isPasswordSetup.value ? 'Solicitar otro enlace' : 'Volver al inicio de sesión',
)

function getUrlParameters() {
  return new URLSearchParams(window.location.search)
}

function clearCallbackParameters() {
  const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`
  window.history.replaceState(window.history.state, document.title, cleanUrl)
}

function setError(message) {
  status.value = 'error'
  feedback.value = message
}

async function completeAuthCallback() {
  if (!supabase || !hasSupabaseConfig) {
    clearCallbackParameters()
    setError('La configuración de Supabase no está completa en esta aplicación.')
    return
  }

  const destination = getAuthCallbackDestination(flow.value)

  if (!destination) {
    clearCallbackParameters()
    setError('El enlace no contiene un flujo de autenticación válido.')
    return
  }

  const parameters = getUrlParameters()
  const callbackError =
    route.query.invite_error || parameters.get('error_description') || parameters.get('error')

  if (callbackError) {
    clearCallbackParameters()
    setError(callbackError)
    return
  }

  try {
    const code = parameters.get('code')

    if (!code) throw new Error('El enlace no contiene un código válido o ya fue utilizado.')

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
    if (!data?.session) throw new Error('Supabase no devolvió una sesión válida.')

    if (isPasswordSetup.value) rememberPasswordRecoverySession()

    clearCallbackParameters()
    await router.replace(destination)
  } catch (error) {
    clearCallbackParameters()
    console.error('[AuthCallback] No se pudo completar la autenticación:', error)
    setError(
      error.message || 'No se pudo validar el enlace. Solicita uno nuevo e inténtalo otra vez.',
    )
  }
}

onMounted(completeAuthCallback)
</script>

<template>
  <main class="auth-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <section class="auth-card bg-white overflow-hidden">
            <div class="auth-card-body">
              <div class="auth-brand">
                <img
                  :src="authLogoUrl"
                  alt="Observatorio y Gestión del Conocimiento Cultural"
                  class="auth-brand-logo"
                />
              </div>

              <div class="auth-form-container text-center">
                <div v-if="status === 'loading'" aria-live="polite">
                  <div class="spinner-border mb-3" role="status" aria-hidden="true"></div>
                  <h1 class="auth-title h3 fw-bold">Completando acceso</h1>
                  <p class="auth-subtitle mb-0">{{ feedback }}</p>
                </div>

                <div v-else class="alert alert-danger mb-0" role="alert">
                  <h1 class="h5 fw-bold">No se pudo validar el enlace</h1>
                  <p class="mb-3">{{ feedback }}</p>
                  <RouterLink :to="fallbackRoute" class="btn btn-dark">
                    {{ fallbackLabel }}
                  </RouterLink>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>
