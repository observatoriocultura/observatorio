const PASSWORD_RECOVERY_SESSION_KEY = 'observatorio-culturas-bogota:password-recovery-session'
const PASSWORD_RECOVERY_SESSION_MAX_AGE_MS = 15 * 60 * 1000

function getSessionStorage() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

export function rememberPasswordRecoverySession() {
  try {
    getSessionStorage()?.setItem(PASSWORD_RECOVERY_SESSION_KEY, String(Date.now()))
  } catch {
    // sessionStorage can be unavailable in strict privacy modes.
  }
}

export function forgetPasswordRecoverySession() {
  try {
    getSessionStorage()?.removeItem(PASSWORD_RECOVERY_SESSION_KEY)
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}

export function hasPasswordRecoverySession() {
  try {
    const validatedAt = Number(getSessionStorage()?.getItem(PASSWORD_RECOVERY_SESSION_KEY) || 0)
    return validatedAt > 0 && Date.now() - validatedAt < PASSWORD_RECOVERY_SESSION_MAX_AGE_MS
  } catch {
    return false
  }
}
