// Estas keys coinciden con los valores que la aplicación guarda actualmente.
export const PROFILE_ROLE_KEYS = Object.freeze({
  SUBSCRIBER: 'subscriber',
  EDITOR: 'editor',
  ADMIN: 'admin',
})

export const PROFILE_ROLES = Object.freeze([
  { key: PROFILE_ROLE_KEYS.SUBSCRIBER, label: 'Suscriptor' },
  { key: PROFILE_ROLE_KEYS.EDITOR, label: 'Editor' },
  { key: PROFILE_ROLE_KEYS.ADMIN, label: 'Administrador' },
])

export const PROFILE_ROLE_VALUES = Object.freeze(PROFILE_ROLES.map(({ key }) => key))
export const PROFILE_ROLE_LABELS = Object.freeze(
  Object.fromEntries(PROFILE_ROLES.map(({ key, label }) => [key, label])),
)

export const PROFILE_GENDERS = Object.freeze([
  { key: '', label: 'Sin especificar' },
  { key: 'Hombre', label: 'Hombre' },
  { key: 'Mujer', label: 'Mujer' },
  { key: 'Otro', label: 'Otro' },
  { key: 'Prefiero no decirlo', label: 'Prefiero no decirlo' },
])

export const PROFILE_GENDER_VALUES = Object.freeze(PROFILE_GENDERS.map(({ key }) => key))

const ROLE_ALIASES = Object.freeze({
  administrator: PROFILE_ROLE_KEYS.ADMIN,
  administrador: PROFILE_ROLE_KEYS.ADMIN,
  administradora: PROFILE_ROLE_KEYS.ADMIN,
  suscriptor: PROFILE_ROLE_KEYS.SUBSCRIBER,
  suscriptora: PROFILE_ROLE_KEYS.SUBSCRIBER,
})

export function normalizeProfileRole(value, fallback = '') {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('es')
  const key = ROLE_ALIASES[normalized] || normalized
  return PROFILE_ROLE_VALUES.includes(key) ? key : fallback
}

export function getProfileRoleLabel(value) {
  return PROFILE_ROLE_LABELS[normalizeProfileRole(value)] || 'Sin rol'
}
