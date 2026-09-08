import { getAppRootUrl } from './appUrl'
import { rememberPasswordRecoverySession } from './passwordRecoveryFlow'
import { supabase } from './supabase'

// Reemplaza la URL actual por una ruta válida del router con hash, sin recargar la página.
function replaceAppRoute(route) {
  window.history.replaceState(window.history.state, document.title, `${getAppRootUrl()}#${route}`)
}

function getInvitationUrlState() {
  const parameters = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const searchParameters = new URLSearchParams(window.location.search)
  const callbackError =
    parameters.get('error_description') || parameters.get('error_code') || parameters.get('error')
  const isInvitation =
    parameters.get('type') === 'invite' || searchParameters.get('auth_flow') === 'invitation'

  return { callbackError, isInvitation, parameters }
}

// Indica si el arranque debe mostrar el estado de validación de una invitación.
export function hasInvitationInUrl() {
  const { callbackError, isInvitation } = getInvitationUrlState()
  return Boolean(isInvitation || callbackError)
}

// Captura una invitación de Supabase, crea la sesión y dirige al formulario de contraseña.
export async function completeInvitationFromUrl() {
  const { callbackError, isInvitation, parameters } = getInvitationUrlState()

  // Ignora enlaces normales para no interferir con el arranque habitual de la aplicación.
  if (!isInvitation && !callbackError) return false

  const accessToken = parameters.get('access_token')
  const refreshToken = parameters.get('refresh_token')

  if (callbackError || !supabase || !accessToken || !refreshToken) {
    const message = callbackError || 'El enlace de invitación no contiene una sesión válida.'
    replaceAppRoute(`/auth/callback?flow=invitation&invite_error=${encodeURIComponent(message)}`)
    return true
  }

  // Convierte los tokens temporales de la invitación en una sesión autenticada.
  try {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) throw error
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo validar la invitación.'
    replaceAppRoute(`/auth/callback?flow=invitation&invite_error=${encodeURIComponent(message)}`)
    return true
  }

  // Autoriza temporalmente la asignación de contraseña y limpia los tokens de la URL.
  rememberPasswordRecoverySession()
  replaceAppRoute('/new-password')
  return true
}
