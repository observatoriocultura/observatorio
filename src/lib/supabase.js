import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

const isValidUrl = (value) => {
  try {
    return Boolean(new URL(value))
  } catch {
    return false
  }
}

export const hasSupabaseConfig = Boolean(
  supabaseUrl && supabasePublishableKey && isValidUrl(supabaseUrl),
)

if (import.meta.env.DEV && !hasSupabaseConfig) {
  console.warn(
    'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.',
  )
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
