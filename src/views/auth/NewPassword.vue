<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { hasSupabaseConfig, supabase } from '../../lib/supabase'
import {
  forgetPasswordRecoverySession,
  hasPasswordRecoverySession,
} from '../../lib/passwordRecoveryFlow'
import '../../assets/styles/auth.css'

const router = useRouter()
const toast = useToast()
const authLogoUrl = `${import.meta.env.BASE_URL}resources/images/app/logotipo-navbar.png`

const form = ref({
  password: '',
  confirmPassword: '',
})
const feedback = ref({
  type: '',
  message: '',
})
const isCheckingSession = ref(true)
const isSubmitting = ref(false)
const hasRecoverySession = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const feedbackClasses = {
  error: 'alert-danger',
  success: 'alert-success',
  warning: 'alert-warning',
}

const canSubmit = computed(
  () =>
    hasSupabaseConfig &&
    hasRecoverySession.value &&
    !isCheckingSession.value &&
    !isSubmitting.value,
)

function setFeedback(type, message) {
  feedback.value = { type, message }
}

function getPasswordValidationError() {
  const password = form.value.password.trim()
  const confirmPassword = form.value.confirmPassword.trim()

  if (!password || !confirmPassword) {
    return 'Completa ambos campos para continuar.'
  }

  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.'
  }

  return ''
}

function enableRecoverySession() {
  hasRecoverySession.value = true
  isCheckingSession.value = false
  setFeedback('', '')
}

async function checkRecoverySession() {
  if (!supabase) {
    setFeedback('error', 'La configuración de Supabase no está completa en esta app.')
    isCheckingSession.value = false
    return
  }

  if (!hasPasswordRecoverySession()) {
    setFeedback('warning', 'Abre el enlace de invitación o recuperación enviado a tu correo.')
    isCheckingSession.value = false
    return
  }

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    if (!data?.user) {
      setFeedback(
        'warning',
        'No existe una sesión válida para asignar la contraseña. Solicita un enlace nuevo.',
      )
      return
    }

    enableRecoverySession()
  } catch (error) {
    console.error('Error al validar recuperación de contraseña:', error)
    setFeedback('error', error.message || 'No se pudo validar el enlace. Solicita uno nuevo.')
  } finally {
    isCheckingSession.value = false
  }
}

async function handlePasswordUpdate() {
  setFeedback('', '')

  if (!supabase) {
    setFeedback('error', 'La configuración de Supabase no está completa en esta app.')
    return
  }

  const validationError = getPasswordValidationError()

  if (validationError) {
    setFeedback('warning', validationError)
    return
  }

  isSubmitting.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: form.value.password.trim(),
    })

    if (error) throw error

    form.value = {
      password: '',
      confirmPassword: '',
    }
    setFeedback('success', 'Tu contraseña se actualizó correctamente.')
    toast.success('Contraseña actualizada.')
    forgetPasswordRecoverySession()

    await supabase.auth.signOut()

    setTimeout(() => {
      router.push({ name: 'login' })
    }, 1200)
  } catch (error) {
    console.error('Error al actualizar contraseña:', error)
    setFeedback('error', error.message || 'No se pudo actualizar la contraseña.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(checkRecoverySession)
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

              <div class="auth-form-container">
                <div class="auth-heading">
                  <h2 class="auth-title h3 fw-bold">Nueva contraseña</h2>
                  <p class="auth-subtitle">
                    Asigna una contraseña segura para acceder a tu cuenta.
                  </p>
                </div>

                <form class="auth-form" novalidate @submit.prevent="handlePasswordUpdate">
                  <div class="auth-field">
                    <label for="new-password" class="form-label">Contraseña</label>
                    <div class="input-group">
                      <input
                        id="new-password"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control"
                        placeholder="Mínimo 6 caracteres"
                        autocomplete="new-password"
                        required
                        :disabled="!canSubmit"
                      />
                      <button
                        type="button"
                        class="btn password-toggle"
                        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                        :disabled="!canSubmit"
                        @click="showPassword = !showPassword"
                      >
                        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="auth-field">
                    <label for="confirm-new-password" class="form-label">
                      Confirmar contraseña
                    </label>
                    <div class="input-group">
                      <input
                        id="confirm-new-password"
                        v-model="form.confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        class="form-control"
                        placeholder="Repite tu contraseña"
                        autocomplete="new-password"
                        required
                        :disabled="!canSubmit"
                      />
                      <button
                        type="button"
                        class="btn password-toggle"
                        :aria-label="
                          showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                        "
                        :disabled="!canSubmit"
                        @click="showConfirmPassword = !showConfirmPassword"
                      >
                        <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                  </div>

                  <div
                    v-if="feedback.message"
                    class="alert alert-dismissible fade show"
                    :class="feedbackClasses[feedback.type]"
                    role="alert"
                  >
                    {{ feedback.message }}
                    <button
                      type="button"
                      class="btn-close"
                      aria-label="Cerrar"
                      @click="feedback.message = ''"
                    ></button>
                  </div>

                  <button
                    type="submit"
                    class="auth-submit btn btn-dark btn-lg w-100 fw-bold"
                    :disabled="!canSubmit"
                  >
                    <span
                      v-if="isSubmitting || isCheckingSession"
                      class="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    ></span>
                    {{
                      isCheckingSession
                        ? 'Validando enlace...'
                        : isSubmitting
                          ? 'Actualizando...'
                          : 'Asignar contraseña'
                    }}
                  </button>
                </form>
              </div>

              <div class="auth-footer">
                <p class="text-muted mb-0">
                  ¿Necesitas otro enlace?
                  <RouterLink to="/forgot-password" class="auth-link fw-bold text-decoration-none">
                    Solicitar recuperación
                  </RouterLink>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>
