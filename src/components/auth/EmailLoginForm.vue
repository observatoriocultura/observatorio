<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { hasSupabaseConfig, supabase } from '../../lib/supabase'
import { getAuthCallbackUrl } from '../../lib/authCallback'
import { getAuthEmailValidationError, normalizeAuthEmail } from '../../lib/authEmailPolicy'

const toast = useToast()

const form = ref({
  email: '',
})
const feedback = ref({
  type: '',
  message: '',
})
const isSubmitting = ref(false)

const feedbackClasses = {
  error: 'alert-danger',
  warning: 'alert-warning',
  success: 'alert-success',
}

function getMagicLinkErrorMessage(error) {
  const message = String(error?.message || '').trim()
  const normalizedMessage = message.toLowerCase()

  if (error?.code === 'over_email_send_rate_limit' || normalizedMessage.includes('email rate limit exceeded')) {
    return 'Se alcanzó el límite de envío de correos de acceso. Inténtalo más tarde o ingresa con tu contraseña si ya tienes una configurada.'
  }

  if (error?.code === 'over_request_rate_limit') {
    return 'Se han realizado demasiadas solicitudes de acceso. Espera unos minutos antes de intentarlo de nuevo.'
  }

  if (error?.code === 'otp_disabled' || normalizedMessage.includes('signups not allowed for otp')) {
    return 'No existe un usuario registrado con este correo electrónico. Verifica la dirección o solicita la creación de una cuenta.'
  }

  return message || 'No se pudo enviar el magic link.'
}

async function handleLogin() {
  if (isSubmitting.value) return
  feedback.value = { type: '', message: '' }

  if (!supabase) {
    feedback.value = {
      type: 'error',
      message: 'La configuracion de Supabase no esta completa en esta app.',
    }
    return
  }

  const email = normalizeAuthEmail(form.value.email)
  const emailError = getAuthEmailValidationError(email)

  if (emailError) {
    feedback.value = {
      type: 'warning',
      message: emailError,
    }
    return
  }

  isSubmitting.value = true

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: getAuthCallbackUrl('magic-link'),
      },
    })

    if (error) {
      throw error
    }

    feedback.value = {
      type: 'success',
      message: 'Revisa tu correo para continuar con el acceso. Si tu cuenta aún no está confirmada, recibirás primero un enlace de confirmación.',
    }
    toast.success('Enlace enviado. Revisa tu correo para continuar.')

    form.value.email = ''
  } catch (error) {
    feedback.value = {
      type: 'error',
      message: getMagicLinkErrorMessage(error),
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="auth-form-container">
    <div class="auth-heading">
      <h2 class="auth-title h3 fw-bold">Acceso por enlace</h2>
      <p class="auth-subtitle">
        Te enviaremos un enlace de acceso seguro a tu correo.
      </p>
      <p class="small text-muted">
        Si es tu primer acceso, el correo puede pedirte confirmar la cuenta.
        Abre el enlace en el mismo navegador desde el que lo solicitaste.
      </p>
    </div>

    <form class="auth-form" @submit.prevent="handleLogin">
      <div class="auth-field">
        <label for="email-login-email" class="form-label">Correo electronico</label>
        <input
          id="email-login-email"
          v-model="form.email"
          type="email"
          class="form-control"
          placeholder="tu@correo.com"
          autocomplete="email"
          required
          :disabled="isSubmitting"
        >
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
        :disabled="isSubmitting || !hasSupabaseConfig"
      >
        <span
          v-if="isSubmitting"
          class="spinner-border spinner-border-sm me-2"
          aria-hidden="true"
        ></span>
        {{ isSubmitting ? 'Enviando...' : 'Enviar link de inicio' }}
      </button>
    </form>
  </div>
</template>
