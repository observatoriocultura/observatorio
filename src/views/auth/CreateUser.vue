<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getInvitationRedirectUrl } from '../../lib/authCallback'
import { hasSupabaseConfig, supabase } from '../../lib/supabase'

const router = useRouter()
const toast = useToast()

const ALLOWED_ROLES = ['subscriber', 'editor', 'admin']
const EMPTY_FORM = Object.freeze({ email: '', display_name: '', role: 'subscriber' })

const form = ref({ ...EMPTY_FORM })
const feedback = ref({ type: '', message: '' })
const isSubmitting = ref(false)

const canSubmit = computed(
  () =>
    hasSupabaseConfig &&
    !isSubmitting.value &&
    form.value.email.trim() &&
    form.value.display_name.trim() &&
    ALLOWED_ROLES.includes(form.value.role),
)

function validateForm() {
  const email = form.value.email.trim().toLowerCase()
  const displayName = form.value.display_name.trim()

  if (!email || !displayName) return 'Completa todos los campos para continuar.'
  if (displayName.length > 120) return 'El nombre no puede superar los 120 caracteres.'
  if (!ALLOWED_ROLES.includes(form.value.role)) return 'Selecciona un rol válido.'

  return ''
}

async function handleSubmit() {
  feedback.value = { type: '', message: '' }

  if (!supabase) {
    feedback.value = {
      type: 'danger',
      message: 'La configuración de Supabase no está completa en esta aplicación.',
    }
    return
  }

  const validationError = validateForm()
  if (validationError) {
    feedback.value = { type: 'warning', message: validationError }
    return
  }

  isSubmitting.value = true

  try {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: {
        email: form.value.email.trim().toLowerCase(),
        display_name: form.value.display_name.trim(),
        role: form.value.role,
        redirect_to: getInvitationRedirectUrl(),
      },
    })

    if (error) {
      let functionMessage = ''
      try {
        const errorBody = await error.context?.json()
        functionMessage = errorBody?.error || ''
      } catch {
        // The response body is optional for transport-level failures.
      }
      const functionError = new Error(functionMessage || error.message)
      functionError.status = error.context?.status
      throw functionError
    }
    if (!data?.user?.id) throw new Error(data?.error || 'Supabase no devolvió el usuario creado.')

    form.value = { ...EMPTY_FORM }
    toast.success('Usuario creado. La invitación fue enviada por correo.')
    await router.push({ name: 'profiles' })
  } catch (error) {
    console.error('Error al crear e invitar al usuario:', error)
    feedback.value = {
      type: 'danger',
      message:
        error?.status === 409
          ? 'Ya existe un usuario registrado con ese correo.'
          : error.message || 'No se pudo crear el usuario ni enviar la invitación.',
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="container-fluid create-user-page py-3">
    <div class="mx-auto create-user-shell">
      <form novalidate @submit.prevent="handleSubmit">
        <div class="card border-0 shadow-sm user-card">
          <div class="card-header user-header d-flex align-items-center gap-3">
            <router-link
              :to="{ name: 'profiles' }"
              class="btn btn-sm btn-light border"
              aria-label="Volver a usuarios"
            >
              <i class="bi bi-arrow-left"></i>
            </router-link>
            <div>
              <h1 class="h5 fw-bold mb-1">Crear usuario</h1>
              <p class="text-muted small mb-0">
                Crea el perfil y envía una invitación para activar la cuenta.
              </p>
            </div>
          </div>

          <div class="card-body p-4">
            <div
              v-if="feedback.message"
              class="alert py-2"
              :class="`alert-${feedback.type}`"
              role="alert"
            >
              {{ feedback.message }}
            </div>

            <div class="row g-3">
              <div class="col-12">
                <label for="create-user-email" class="form-label">Correo electrónico</label>
                <input
                  id="create-user-email"
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  placeholder="usuario@correo.com"
                  autocomplete="email"
                  maxlength="254"
                  required
                  :disabled="isSubmitting"
                />
              </div>

              <div class="col-12 col-md-7">
                <label for="create-user-display-name" class="form-label">Nombre para mostrar</label>
                <input
                  id="create-user-display-name"
                  v-model="form.display_name"
                  type="text"
                  class="form-control"
                  placeholder="Nombre y apellido"
                  autocomplete="name"
                  maxlength="120"
                  required
                  :disabled="isSubmitting"
                />
              </div>

              <div class="col-12 col-md-5">
                <label for="create-user-role" class="form-label">Rol</label>
                <select
                  id="create-user-role"
                  v-model="form.role"
                  class="form-select"
                  required
                  :disabled="isSubmitting"
                >
                  <option value="subscriber">Suscriptor</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          </div>

          <div
            class="card-footer user-actions d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 p-3"
          >
            <router-link :to="{ name: 'profiles' }" class="btn btn-light border action-button px-4">
              Cancelar
            </router-link>
            <button type="submit" class="btn btn-dark action-button px-4" :disabled="!canSubmit">
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              ></span>
              <i v-else class="bi bi-send me-2" aria-hidden="true"></i>
              {{ isSubmitting ? 'Creando...' : 'Crear y enviar invitación' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.create-user-page {
  color: #202124;
}
.create-user-shell {
  max-width: 760px;
}
.user-card {
  border-radius: 0.75rem;
  overflow: hidden;
}
.user-header {
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.25rem;
}
.form-label {
  color: #343a40;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.form-control,
.form-select {
  border-color: #ced4da;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  height: 2.5rem;
}
.form-control:focus,
.form-select:focus {
  border-color: #495057;
  box-shadow: 0 0 0 0.18rem rgba(33, 37, 41, 0.08);
}
.user-actions {
  background: #fafafa;
  border-top: 1px solid #e9ecef;
}
.action-button {
  align-items: center;
  border-radius: 0.5rem;
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 600;
  height: 2.5rem;
  justify-content: center;
}

@media (max-width: 575.98px) {
  .user-actions .btn {
    width: 100%;
  }
}
</style>
