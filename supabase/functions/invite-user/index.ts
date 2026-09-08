import { createClient } from 'npm:@supabase/supabase-js@2.106.1'
import { corsHeaders } from 'npm:@supabase/supabase-js@2.106.1/cors'

const ALLOWED_ROLES = new Set(['subscriber', 'editor', 'admin'])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Método no permitido.' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const authorization = request.headers.get('Authorization') ?? ''

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[invite-user] Faltan variables de entorno de Supabase.')
    return jsonResponse({ error: 'El servicio no está configurado.' }, 500)
  }
  if (!authorization.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Debes iniciar sesión.' }, 401)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const token = authorization.slice('Bearer '.length)
    const { data: userData, error: userError } = await adminClient.auth.getUser(token)
    if (userError || !userData.user) return jsonResponse({ error: 'La sesión no es válida.' }, 401)

    const { data: requesterProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle()

    if (profileError) throw profileError
    if (requesterProfile?.role !== 'admin') {
      return jsonResponse({ error: 'No tienes permisos para crear usuarios.' }, 403)
    }

    const body = await request.json()
    const email = String(body?.email ?? '')
      .trim()
      .toLowerCase()
    const displayName = String(body?.display_name ?? '').trim()
    const role = String(body?.role ?? '')
      .trim()
      .toLowerCase()
    const redirectTo = String(body?.redirect_to ?? '').trim()

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return jsonResponse({ error: 'El correo electrónico no es válido.' }, 400)
    }
    if (!displayName || displayName.length > 120) {
      return jsonResponse({ error: 'El nombre debe tener entre 1 y 120 caracteres.' }, 400)
    }
    if (!ALLOWED_ROLES.has(role)) {
      return jsonResponse({ error: 'El rol seleccionado no es válido.' }, 400)
    }

    const inviteOptions: { data: Record<string, string>; redirectTo?: string } = {
      data: { display_name: displayName, full_name: displayName },
    }
    if (redirectTo) inviteOptions.redirectTo = redirectTo

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      inviteOptions,
    )

    if (inviteError) {
      const status = inviteError.status === 422 ? 409 : inviteError.status || 400
      return jsonResponse({ error: inviteError.message }, status)
    }

    const invitedUser = inviteData.user
    if (!invitedUser) throw new Error('Supabase no devolvió el usuario invitado.')

    const { error: updateError } = await adminClient
      .from('profiles')
      .upsert(
        { id: invitedUser.id, full_name: displayName, role, updated_at: new Date().toISOString() },
        { onConflict: 'id' },
      )

    if (updateError) {
      const { error: rollbackError } = await adminClient.auth.admin.deleteUser(invitedUser.id)
      if (rollbackError)
        console.error('[invite-user] No se pudo revertir el usuario:', rollbackError)
      throw updateError
    }

    return jsonResponse(
      {
        user: { id: invitedUser.id, email: invitedUser.email },
        profile: { display_name: displayName, role },
      },
      201,
    )
  } catch (error) {
    console.error('[invite-user] Error inesperado:', error)
    return jsonResponse({ error: 'No se pudo crear el usuario ni enviar la invitación.' }, 500)
  }
})
