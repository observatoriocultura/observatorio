import registrationPolicy from '../../supabase/config/registration-policy.json' with { type: 'json' }

export const ALLOWED_EMAIL_DOMAINS = Object.freeze(
  registrationPolicy.allowedEmailDomains.map(domain => domain.trim().toLowerCase()),
)

export const AUTH_EMAIL_DOMAIN_HINT = `Dominios permitidos: ${ALLOWED_EMAIL_DOMAINS.map(domain => `@${domain}`).join(', ')}.`

export function normalizeAuthEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function getAuthEmailValidationError(value) {
  const email = normalizeAuthEmail(value)
  if (!email) return 'Ingresa tu correo electrónico para continuar.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Ingresa un correo electrónico válido.'
  }

  // Comparar el dominio completo evita aceptar subdominios o direcciones similares.
  const domain = email.split('@')[1]
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return `Este dominio de correo no está permitido. ${AUTH_EMAIL_DOMAIN_HINT}`
  }

  return ''
}
