<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '../../lib/supabase'

const route = useRoute()
const toast = useToast()

const FILE_MANAGER_ROLES = ['admin', 'editor']

const loading = ref(true)
const saving = ref(false)
const loadingError = ref('')
const formSubmitted = ref(false)
const previewFailed = ref(false)
const availablePosts = ref([])
const postsError = ref('')
const initialFormState = ref('')

const fileData = ref({
  title: '',
  description: '',
  alt_text: '',
  keywords: '',
  is_main: false,
  post_id: '',
})

const fileMeta = ref(null)

const keywordCount = computed(() => normalizeKeywords(fileData.value.keywords).length)
const titleLength = computed(() => fileData.value.title.trim().length)
const currentFormState = computed(() => serializeFormState(fileData.value))
const hasUnsavedChanges = computed(() => (
  Boolean(initialFormState.value)
  && currentFormState.value !== initialFormState.value
))
const canSave = computed(() => hasUnsavedChanges.value && !saving.value)
const fileTypeLabel = computed(() => {
  const extension = fileMeta.value?.extension?.toUpperCase()
  return extension || 'ARCHIVO'
})
const canShowPreview = computed(() => Boolean(fileMeta.value?.is_image && !previewFailed.value))

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  fetchFileData()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(() => confirmDiscardChanges())

onBeforeRouteUpdate(() => confirmDiscardChanges())

watch(() => route.params.id, (fileId, previousFileId) => {
  if (fileId !== previousFileId) fetchFileData(fileId)
})

async function assertFileManager() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('AUTH_REQUIRED')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  const role = String(profile?.role || '').trim().toLowerCase()
  if (profileError || !FILE_MANAGER_ROLES.includes(role)) {
    throw new Error('MANAGER_REQUIRED')
  }

  return userData.user
}

async function fetchFileData(fileId = route.params.id) {
  loading.value = true
  loadingError.value = ''
  previewFailed.value = false
  formSubmitted.value = false
  initialFormState.value = ''

  try {
    await assertFileManager()

    const { data: posts, error: postsLoadError } = await supabase
      .from('posts').select('id, title').order('title')
    availablePosts.value = posts || []
    postsError.value = postsLoadError ? 'No se pudo cargar la lista de publicaciones.' : ''

    const { data, error } = await supabase
      .from('files')
      .select(`
        id,
        bucket_id,
        file_name,
        extension,
        storage_path,
        mime_type,
        size_bytes,
        is_image,
        width,
        height,
        post_id,
        user_id,
        title,
        description,
        alt_text,
        keywords,
        is_main,
        posts (title)
      `)
      .eq('id', fileId)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('FILE_NOT_FOUND')

    fileMeta.value = data
    fileData.value = {
      title: data.title || '',
      description: data.description || '',
      alt_text: data.alt_text || '',
      keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : '',
      is_main: Boolean(data.is_main),
      post_id: data.post_id || '',
    }
    syncInitialFormState()
  } catch (error) {
    console.error('Error al cargar el archivo:', error)
    loadingError.value = getLoadErrorMessage(error)
  } finally {
    loading.value = false
  }
}

async function updateFile() {
  if (saving.value) return

  formSubmitted.value = true

  if (!fileData.value.title.trim()) return

  saving.value = true

  try {
    const currentUser = await assertFileManager()
    const normalizedKeywords = normalizeKeywords(fileData.value.keywords)
    const normalizedValues = {
      title: fileData.value.title.trim(),
      description: fileData.value.description.trim() || null,
      alt_text: fileData.value.alt_text.trim() || null,
      keywords: normalizedKeywords,
      is_main: fileData.value.is_main,
      post_id: fileData.value.post_id || null,
      updater_id: currentUser.id,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('files')
      .update(normalizedValues)
      .eq('id', route.params.id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data?.id) throw new Error('FILE_NOT_UPDATED')

    fileData.value = {
      title: normalizedValues.title,
      description: normalizedValues.description || '',
      alt_text: normalizedValues.alt_text || '',
      keywords: normalizedKeywords.join(', '),
      is_main: normalizedValues.is_main,
      post_id: normalizedValues.post_id || '',
    }
    fileMeta.value = { ...fileMeta.value, ...normalizedValues }
    syncInitialFormState()
    toast.success('Archivo actualizado correctamente.')
  } catch (error) {
    console.error('Error al actualizar el archivo:', error)
    toast.error(getSaveErrorMessage(error))
  } finally {
    saving.value = false
  }
}

function normalizeKeywords(value) {
  return [...new Set(String(value || '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean))]
}

function serializeFormState(value) {
  return JSON.stringify({
    title: String(value.title || '').trim(),
    description: String(value.description || '').trim(),
    alt_text: String(value.alt_text || '').trim(),
    keywords: normalizeKeywords(value.keywords),
    is_main: Boolean(value.is_main),
    post_id: value.post_id || '',
  })
}

function syncInitialFormState() {
  initialFormState.value = serializeFormState(fileData.value)
}

function confirmDiscardChanges() {
  if (saving.value) return false
  if (!hasUnsavedChanges.value) return true
  return window.confirm('Tienes cambios sin guardar. ¿Quieres salir y descartarlos?')
}

function handleBeforeUnload(event) {
  if (!hasUnsavedChanges.value && !saving.value) return
  event.preventDefault()
  event.returnValue = ''
}

function getFileUrl(path) {
  if (!path) return ''
  return supabase.storage
    .from(fileMeta.value?.bucket_id || 'media')
    .getPublicUrl(path).data.publicUrl
}

function getRelationshipTitle() {
  const postTitle = Array.isArray(fileMeta.value?.posts)
    ? fileMeta.value.posts[0]?.title
    : fileMeta.value?.posts?.title

  if (postTitle) return postTitle
  if (fileMeta.value?.post_id) return 'Artículo relacionado · título no disponible'
  if (fileMeta.value?.user_id) return 'Perfil relacionado'
  return 'Archivo general'
}

function formatSize(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const size = value / (1024 ** unitIndex)
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function getLoadErrorMessage(error) {
  if (error?.message === 'AUTH_REQUIRED') return 'Tu sesión terminó. Inicia sesión nuevamente.'
  if (error?.message === 'MANAGER_REQUIRED') return 'No tienes permisos para editar archivos.'
  if (error?.message === 'FILE_NOT_FOUND') return 'No se encontró el archivo o no tienes acceso a él.'
  return 'No se pudo cargar el archivo.'
}

function getSaveErrorMessage(error) {
  if (error?.message === 'AUTH_REQUIRED') return 'Tu sesión terminó. Inicia sesión nuevamente.'
  if (error?.message === 'MANAGER_REQUIRED') return 'No tienes permisos para editar archivos.'
  if (error?.message === 'FILE_NOT_UPDATED') return 'No se encontró el archivo o no se pudo actualizar.'
  return error?.message || 'No se pudieron actualizar los metadatos.'
}
</script>

<template>
  <div class="container py-3 edit-file-view pcrn-form">
    <div class="row justify-content-center">
      <div class="col-12 col-xxl-10">
        <header class="edit-page-header">
          <router-link to="/files" class="back-link">
            <i class="bi bi-arrow-left" aria-hidden="true"></i>
            Volver a archivos
          </router-link>
          <p class="section-kicker mb-1">Biblioteca de archivos</p>
          <h1>Editar archivo</h1>
          <p class="page-description mb-0">
            Actualiza la información descriptiva, accesibilidad y clasificación del recurso.
          </p>
        </header>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-dark" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-muted small mt-3 mb-0">Cargando archivo...</p>
        </div>

        <div v-else-if="loadingError" class="edit-state-card text-center">
          <i class="bi bi-file-earmark-x" aria-hidden="true"></i>
          <h1 class="h5 mb-2">No se pudo abrir el archivo</h1>
          <p class="text-muted mb-4">{{ loadingError }}</p>
          <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
            <button type="button" class="btn pcrn-btn-primary px-4" @click="fetchFileData()">
              Reintentar
            </button>
            <router-link to="/files" class="btn btn-light border px-4">
              Volver a archivos
            </router-link>
          </div>
        </div>

        <div v-else class="edit-file-card">
          <div class="card-body p-3 p-lg-4">
            <form novalidate @submit.prevent="updateFile">
              <section class="form-section border-bottom pb-4 mb-4">
                <div class="d-flex flex-column flex-lg-row justify-content-between gap-2 mb-3">
                  <div>
                    <p class="section-kicker mb-1">Archivo</p>
                    <h2 class="section-title mb-0">Vista previa e información</h2>
                  </div>
                  <a
                    :href="getFileUrl(fileMeta?.storage_path)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-light border compact-link align-self-start"
                    aria-label="Ver archivo original en una pestaña nueva"
                  >
                    <i class="bi bi-box-arrow-up-right me-2" aria-hidden="true"></i>
                    Ver original
                  </a>
                </div>

                <div class="file-context">
                  <div class="preview-box">
                    <img
                      v-if="canShowPreview"
                      :src="getFileUrl(fileMeta?.storage_path)"
                      :alt="fileData.alt_text || fileData.title || fileMeta?.file_name"
                      @error="previewFailed = true"
                    >
                    <div
                      v-else
                      class="file-placeholder"
                      role="img"
                      :aria-label="`Vista previa no disponible. Archivo ${fileTypeLabel}`"
                    >
                      <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
                      <span>{{ fileTypeLabel }}</span>
                    </div>
                  </div>

                  <div class="file-context-body">
                    <h4 class="file-name text-break mb-2">{{ fileMeta?.file_name }}</h4>
                    <dl class="technical-list mb-0">
                      <div>
                        <dt>Formato</dt>
                        <dd>{{ fileTypeLabel }}</dd>
                      </div>
                      <div>
                        <dt>Tamaño</dt>
                        <dd>{{ formatSize(fileMeta?.size_bytes) }}</dd>
                      </div>
                      <div v-if="fileMeta?.width && fileMeta?.height">
                        <dt>Dimensiones</dt>
                        <dd>{{ fileMeta.width }} × {{ fileMeta.height }} px</dd>
                      </div>
                      <div>
                        <dt>Tipo MIME</dt>
                        <dd class="text-break">{{ fileMeta?.mime_type || 'No disponible' }}</dd>
                      </div>
                      <div>
                        <dt>Relación</dt>
                        <dd>{{ getRelationshipTitle() }}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              <section class="form-section border-bottom pb-4 mb-4">
                <div class="d-flex flex-column flex-lg-row justify-content-between gap-2 mb-3">
                  <div>
                    <p class="section-kicker mb-1">Contenido principal</p>
                    <h2 class="section-title mb-0">Título y descripción</h2>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between gap-3">
                    <label class="form-label fw-semibold" for="file-title">Título <span class="text-danger">*</span></label>
                    <span class="form-hint">{{ titleLength }} / 160 caracteres</span>
                  </div>
                  <input
                    id="file-title"
                    v-model="fileData.title"
                    type="text"
                    class="form-control form-control-lg"
                    :class="{ 'is-invalid': formSubmitted && !fileData.title.trim() }"
                    maxlength="160"
                    placeholder="Escribe un título descriptivo"
                    :disabled="saving"
                    required
                  >
                  <div class="invalid-feedback">El título es obligatorio.</div>
                </div>

                <div>
                  <label class="form-label fw-semibold" for="file-description">Descripción</label>
                  <textarea
                    id="file-description"
                    v-model="fileData.description"
                    class="form-control"
                    rows="4"
                    placeholder="Explica el contenido y el uso previsto del archivo"
                    :disabled="saving"
                  ></textarea>
                  <div class="form-text">Ayuda a identificar el archivo dentro de la biblioteca.</div>
                </div>
              </section>

              <section class="form-section border-bottom pb-4 mb-4">
                <label class="form-label fw-semibold" for="file-post">Publicación relacionada</label>
                <select
                  id="file-post"
                  v-model="fileData.post_id"
                  class="form-select"
                  :disabled="saving || Boolean(postsError)"
                >
                  <option value="">Sin publicación</option>
                  <option
                    v-if="fileData.post_id && !availablePosts.some((post) => post.id === fileData.post_id)"
                    :value="fileData.post_id"
                  >
                    Publicación actual
                  </option>
                  <option v-for="post in availablePosts" :key="post.id" :value="post.id">
                    {{ post.title || 'Sin título' }}
                  </option>
                </select>
                <div v-if="postsError" class="form-text text-danger">{{ postsError }}</div>
                <div v-else class="form-text">Asocia este archivo con una publicación existente.</div>
              </section>

              <section class="form-section mb-4">
                <div class="mb-3">
                  <p class="section-kicker mb-1">Búsqueda</p>
                  <h2 class="section-title mb-0">Accesibilidad y etiquetas</h2>
                </div>

                <div class="row g-3">
                  <div v-if="fileMeta?.is_image" class="col-12 col-lg-6">
                    <label class="form-label fw-semibold" for="file-alt">Texto alternativo</label>
                    <input
                      id="file-alt"
                      v-model="fileData.alt_text"
                      type="text"
                      class="form-control"
                      placeholder="Describe brevemente lo que muestra la imagen"
                      :disabled="saving"
                    >
                    <div class="form-text">Mejora la accesibilidad cuando la imagen no puede verse.</div>
                  </div>

                  <div class="col-12" :class="fileMeta?.is_image ? 'col-lg-6' : 'col-lg-8'">
                    <div class="d-flex justify-content-between gap-3">
                      <label class="form-label fw-semibold" for="file-keywords">Palabras clave</label>
                      <span class="form-hint">{{ keywordCount }} etiquetas</span>
                    </div>
                    <input
                      id="file-keywords"
                      v-model="fileData.keywords"
                      type="text"
                      class="form-control"
                      placeholder="campaña, portada, institucional"
                      :disabled="saving"
                    >
                    <div class="form-text">Separa cada palabra clave con una coma.</div>
                  </div>
                </div>

                <div class="form-check form-switch main-file-switch mt-4">
                  <input
                    id="file-main"
                    v-model="fileData.is_main"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    aria-describedby="file-main-help"
                    :disabled="saving"
                  >
                  <label class="form-check-label fw-semibold" for="file-main">Archivo principal</label>
                  <div id="file-main-help" class="form-text switch-help">
                    Identifica este recurso como destacado. Esta opción no desmarca automáticamente otros archivos.
                  </div>
                </div>
              </section>

              <div class="form-actions border-top pt-3">
                <p class="action-status mb-0" aria-live="polite">
                  {{ hasUnsavedChanges ? 'Tienes cambios sin guardar.' : 'Todos los cambios están guardados.' }}
                </p>
                <div class="action-stack">
                  <button
                    type="submit"
                    class="btn pcrn-btn-primary px-4"
                    :disabled="!canSave"
                    :title="!hasUnsavedChanges ? 'No hay cambios pendientes' : undefined"
                  >
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    {{ saving ? 'Guardando...' : 'Guardar cambios' }}
                  </button>
                  <router-link
                    to="/files"
                    class="btn btn-light border px-4"
                    :class="{ disabled: saving }"
                    :aria-disabled="saving"
                    :tabindex="saving ? -1 : undefined"
                    @click="saving && $event.preventDefault()"
                  >
                    Cancelar
                  </router-link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-file-view {
  min-height: calc(100vh - 4rem);
}

.edit-page-header,
.edit-file-card,
.edit-state-card {
  max-width: 64rem;
  margin-inline: auto;
}

.edit-page-header {
  margin-bottom: 1.25rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  color: #5f6673;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover,
.back-link:focus-visible {
  color: #212529;
}

.edit-page-header h1 {
  margin: 0;
  color: #111827;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 750;
  letter-spacing: -0.035em;
}

.page-description {
  margin-top: 0.4rem;
  color: #687080;
  font-size: 0.95rem;
}

.edit-file-card {
  border-radius: 0.5em;
}

.edit-file-card > .card-body,
.edit-state-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 0.5rem 1.5rem rgba(17, 24, 39, 0.06);
}

.edit-state-card {
  padding: clamp(2rem, 6vw, 4rem) 1.25rem;
}

.edit-state-card > i {
  display: block;
  margin-bottom: 1rem;
  color: #9ca3af;
  font-size: 2.5rem;
}

.compact-link {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.file-context {
  display: grid;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  background: #ffffff;
  grid-template-columns: minmax(12rem, 18rem) minmax(0, 1fr);
}

.preview-box {
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-right: 1px solid #e5e7eb;
  background-color: #f8f9fa;
  background-image:
    linear-gradient(45deg, #e9ecef 25%, transparent 25%),
    linear-gradient(-45deg, #e9ecef 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e9ecef 75%),
    linear-gradient(-45deg, transparent 75%, #e9ecef 75%);
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  background-size: 16px 16px;
}

.preview-box img {
  width: 100%;
  height: 100%;
  padding: 1rem;
  object-fit: contain;
}

.file-placeholder {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0.5rem;
  color: #6c757d;
}

.file-placeholder i {
  font-size: 2.75rem;
}

.file-placeholder span {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.file-context-body {
  min-width: 0;
  padding: 1rem 1.25rem;
}

.file-name {
  color: #212529;
  font-size: 0.95rem;
  font-weight: 700;
}

.technical-list {
  display: grid;
  gap: 0.75rem 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.technical-list > div {
  min-width: 0;
}

.technical-list dt {
  margin-bottom: 0.15rem;
  color: #6c757d;
  font-size: 0.72rem;
  font-weight: 600;
}

.technical-list dd {
  margin: 0;
  color: #212529;
  font-size: 0.825rem;
  font-weight: 600;
}

.main-file-switch {
  color: #495057;
}

.switch-help {
  margin-left: 0;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.action-stack {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  width: min(100%, 22rem);
  margin-left: auto;
}

.action-stack .btn {
  flex: 1 1 0;
}

.action-status {
  color: #6c757d;
  font-size: 0.825rem;
}

@media (max-width: 767.98px) {
  .file-context {
    grid-template-columns: 1fr;
  }

  .preview-box {
    min-height: 9rem;
    border-right: 0;
    border-bottom: 1px solid #e5e7eb;
  }
}

@media (max-width: 575.98px) {
  .edit-file-view {
    padding-inline: 0.25rem;
  }

  .edit-page-header {
    margin-bottom: 1rem;
  }

  .technical-list {
    grid-template-columns: 1fr;
  }

  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .action-stack {
    flex-direction: column;
    width: 100%;
  }
}
</style>
