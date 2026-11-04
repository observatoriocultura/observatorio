<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { getProfileRoleLabel } from '../../constants/catalogs'

const route = useRoute()
const profileId = computed(() => String(route.params.id || ''))
const profile = ref(null)
const loading = ref(true)
const loadError = ref('')
let requestVersion = 0

function formatDate(value, includeTime = false) {
  if (!value) return 'Sin registrar'
  // Birth dates are calendar dates; parse them locally to avoid shifting the day.
  const date = new Date(includeTime ? value : `${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Sin registrar'
  return new Intl.DateTimeFormat('es-CO', includeTime
    ? { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Bogota' }
    : { dateStyle: 'long' },
  ).format(date)
}

async function fetchProfile() {
  const version = ++requestVersion
  const id = profileId.value
  loading.value = true
  loadError.value = ''
  profile.value = null

  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error('PROFILE_NOT_FOUND')
    }

    const [profileResult, emailResult] = await Promise.all([
      supabase.from('profiles')
        .select('id, full_name, about, birth_date, gender, role, updated_at')
        .eq('id', id)
        .maybeSingle(),
      supabase.rpc('list_profile_emails').eq('id', id).maybeSingle(),
    ])

    if (version !== requestVersion) return
    if (profileResult.error) throw profileResult.error
    if (emailResult.error) throw emailResult.error
    if (!profileResult.data) throw new Error('PROFILE_NOT_FOUND')

    profile.value = { ...profileResult.data, email: emailResult.data?.email || '' }
  } catch (error) {
    if (version !== requestVersion) return
    console.error('Error al consultar el perfil:', error)
    loadError.value = error.message === 'PROFILE_NOT_FOUND'
      ? 'El perfil solicitado no existe o ya no está disponible.'
      : error.code === '42501'
        ? 'No tienes permisos para consultar este perfil. Se requiere un usuario administrador.'
        : 'No se pudo cargar el perfil. Comprueba tu conexión e inténtalo de nuevo.'
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

watch(profileId, fetchProfile, { immediate: true })
onBeforeUnmount(() => { requestVersion++ })
</script>

<template>
  <main class="container-fluid read-profile-page py-3">
    <div class="mx-auto read-profile-shell">
      <div v-if="loading" class="profile-state-card text-center" aria-live="polite">
        <div class="spinner-border text-dark" role="status">
          <span class="visually-hidden">Cargando perfil...</span>
        </div>
      </div>

      <section v-else-if="loadError" class="profile-state-card text-center" role="alert">
        <i class="bi bi-person-x fs-2 text-danger" aria-hidden="true"></i>
        <h1 class="h5 fw-bold mt-2">No se pudo abrir el perfil</h1>
        <p class="text-muted mb-3">{{ loadError }}</p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <button type="button" class="btn pcrn-btn-primary" @click="fetchProfile">
            <i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>Reintentar
          </button>
          <router-link :to="{ name: 'profiles' }" class="btn btn-outline-secondary">
            Volver a usuarios
          </router-link>
        </div>
      </section>

      <article v-else-if="profile" class="card border-0 shadow-sm profile-card">
        <div class="card-header profile-header">
          <h1 class="h5 fw-bold mb-0">Perfil de usuario</h1>
        </div>
        <div class="card-body p-3 p-md-4">
          <div class="profile-summary d-flex align-items-start gap-3 mb-4 pb-4">
            <div class="profile-avatar d-flex align-items-center justify-content-center flex-shrink-0" aria-hidden="true">
              <i class="bi bi-person fs-2"></i>
            </div>
            <div class="profile-identity">
              <h2 class="h4 fw-bold mb-1">{{ profile.full_name || 'Sin nombre registrado' }}</h2>
              <p class="text-muted mb-2 profile-email">{{ profile.email || 'Sin correo registrado' }}</p>
              <span class="badge profile-role">{{ getProfileRoleLabel(profile.role) }}</span>
            </div>
          </div>

          <dl class="row g-4 mb-0">
            <div class="col-sm-6">
              <dt>Género</dt>
              <dd>{{ profile.gender || 'Sin especificar' }}</dd>
            </div>
            <div class="col-sm-6">
              <dt>Fecha de nacimiento</dt>
              <dd>{{ formatDate(profile.birth_date) }}</dd>
            </div>
            <div class="col-12">
              <dt>Acerca de</dt>
              <dd class="profile-about">{{ profile.about || 'Sin descripción registrada' }}</dd>
            </div>
            <div class="col-12">
              <dt>Última actualización</dt>
              <dd>{{ formatDate(profile.updated_at, true) }}</dd>
            </div>
          </dl>
        </div>
        <div class="card-footer profile-actions d-flex flex-wrap justify-content-end gap-2 p-3">
          <router-link :to="{ name: 'profiles' }" class="btn btn-light border">
            Volver a usuarios
          </router-link>
          <router-link :to="{ name: 'edit-profile', params: { id: profile.id } }" class="btn pcrn-btn-primary">
            <i class="bi bi-pencil me-2" aria-hidden="true"></i>Editar perfil
          </router-link>
        </div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.read-profile-page {
  color: var(--pcrn-text);
}

.read-profile-shell {
  max-width: 760px;
}

.profile-card,
.profile-state-card {
  border-radius: 0.75rem;
  overflow: hidden;
}

.profile-state-card {
  background: var(--pcrn-surface);
  border: 1px solid var(--pcrn-border-soft);
  padding: 3rem 1.5rem;
}

.profile-header {
  background: var(--pcrn-surface);
  border-bottom: 1px solid var(--pcrn-border-soft);
  padding: 1rem 1.25rem;
}

.profile-summary {
  border-bottom: 1px solid var(--pcrn-border-soft);
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--pcrn-primary-soft);
  color: var(--pcrn-primary);
}

.profile-identity {
  min-width: 0;
  overflow-wrap: anywhere;
}

.profile-role {
  background: var(--pcrn-surface-muted);
  color: var(--pcrn-text);
}

dt {
  color: var(--pcrn-muted);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

dd {
  margin-bottom: 0;
  overflow-wrap: anywhere;
}

.profile-about {
  white-space: pre-wrap;
}

.profile-actions {
  background: var(--pcrn-surface-muted);
  border-top: 1px solid var(--pcrn-border-soft);
}

.btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 575.98px) {
  .profile-actions .btn {
    width: 100%;
  }
}
</style>
