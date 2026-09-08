import { getAppRootUrl, getAppUrl } from './appUrl'

// Centraliza las rutas de destino para cada flujo de autenticación de Supabase.
const AUTH_FLOW_DESTINATIONS = Object.freeze({
  'magic-link': '/profile',
  invitation: '/new-password',
  registration: '/profile',
  recovery: '/new-password',
})

// Construye la URL de retorno que Supabase usa después de validar un enlace de acceso.
export function getAuthCallbackUrl(flow) {
  if (!Object.hasOwn(AUTH_FLOW_DESTINATIONS, flow)) {
    throw new Error(`Flujo de autenticación no reconocido: ${flow}`)
  }

  const query = new URLSearchParams({ flow })
  return getAppUrl(`auth/callback?${query.toString()}`)
}

// Las invitaciones regresan a la raíz porque Supabase entrega sus tokens en el fragmento URL.
export function getInvitationRedirectUrl() {
  const redirectUrl = new URL(getAppRootUrl())
  redirectUrl.searchParams.set('auth_flow', 'invitation')
  return redirectUrl.toString()
}

// Obtiene la pantalla final del flujo y normaliza parámetros repetidos del router.
export function getAuthCallbackDestination(flow) {
  const normalizedFlow = Array.isArray(flow) ? flow[0] : flow
  return AUTH_FLOW_DESTINATIONS[normalizedFlow] || null
}
