// Mantener estas keys hasta migrar los valores existentes de posts en Supabase.
export const POST_TYPE_KEYS = Object.freeze({ NEWS: 'noticia' })

export const POST_TYPES = Object.freeze([{ key: POST_TYPE_KEYS.NEWS, label: 'Noticia' }])

export const POST_VISIBILITY_KEYS = Object.freeze({
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
  HIDDEN: 'Oculto',
})

export const POST_VISIBILITY = Object.freeze([
  { key: POST_VISIBILITY_KEYS.HIDDEN, label: 'Oculto' },
  { key: POST_VISIBILITY_KEYS.PRIVATE, label: 'Privado' },
  { key: POST_VISIBILITY_KEYS.PUBLIC, label: 'Público' },
])

export const POST_TYPE_LABELS = Object.freeze(
  Object.fromEntries(POST_TYPES.map(({ key, label }) => [key, label])),
)

export const POST_VISIBILITY_LABELS = Object.freeze(
  Object.fromEntries(POST_VISIBILITY.map(({ key, label }) => [key, label])),
)

export function normalizePostType(value) {
  return String(value || POST_TYPE_KEYS.NEWS).trim().toLowerCase()
}

export function getPostTypeLabel(value) {
  const normalized = normalizePostType(value)
  return POST_TYPE_LABELS[normalized] || String(value || 'Sin tipo')
}

export function normalizePostVisibility(value) {
  const normalized = String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
  return Object.values(POST_VISIBILITY_KEYS).find(
    (option) => option.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es') === normalized,
  ) || POST_VISIBILITY_KEYS.HIDDEN
}

export function getPostVisibilityLabel(value) {
  return POST_VISIBILITY_LABELS[normalizePostVisibility(value)] || 'Oculto'
}
