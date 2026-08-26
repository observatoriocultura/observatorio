<template>
  <div class="app-layout">
    <Sidebar
      v-model="isCollapsed"
      :user="sidebarUser"
      :session-loading="sessionLoading"
      :logout-loading="logoutLoading"
      @logout="handleLogout"
      @navigate="handleSidebarNavigate"
    />

    <main class="main-content" :style="{ marginLeft: isCollapsed ? '50px' : '240px' }">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import Sidebar from './components/navigation/Sidebar.vue'
import { supabase } from './lib/supabase'

const isCollapsed = ref(true)
const authUser = ref(null)
const profile = ref(null)
const sessionLoading = ref(true)
const logoutLoading = ref(false)
const router = useRouter()
const toast = useToast()

let authSubscription = null
let sessionRequestId = 0

const sidebarUser = computed(() => {
  if (!authUser.value) return null

  return {
    ...authUser.value,
    full_name:
      profile.value?.full_name ||
      authUser.value.user_metadata?.full_name ||
      authUser.value.email?.split('@')[0] ||
      'Usuario',
    role: profile.value?.role || 'subscriber',
  }
})

async function syncSession(session, showLoading = false) {
  const requestId = ++sessionRequestId
  if (showLoading) sessionLoading.value = true

  if (!session?.user) {
    authUser.value = null
    profile.value = null
    sessionLoading.value = false
    return
  }

  authUser.value = session.user
  profile.value = null

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (requestId !== sessionRequestId) return

  if (error) {
    console.error('No se pudo cargar el perfil de la sesión:', error)
  } else {
    profile.value = data
  }

  sessionLoading.value = false
}

async function initializeSession() {
  if (!supabase) {
    sessionLoading.value = false
    return
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('No se pudo recuperar la sesión:', error)
    sessionLoading.value = false
  } else {
    await syncSession(data.session, true)
  }

  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    // La consulta del perfil se agenda fuera del callback de autenticación.
    window.setTimeout(() => {
      void syncSession(session)
    }, 0)
  })

  authSubscription = authListener.subscription
}

async function handleLogout() {
  if (!supabase || logoutLoading.value) return

  logoutLoading.value = true
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  logoutLoading.value = false

  if (error) {
    console.error('No se pudo cerrar la sesión:', error)
    toast.error('No se pudo cerrar la sesión. Inténtalo de nuevo.')
    return
  }

  authUser.value = null
  profile.value = null
  await router.push({ name: 'login' })
}

function handleSidebarNavigate() {
  if (window.matchMedia('(max-width: 767px)').matches) {
    isCollapsed.value = true
  }
}

onMounted(initializeSession)

onBeforeUnmount(() => {
  authSubscription?.unsubscribe()
})
</script>

<style>
/* Estilos globales para el layout */
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa; /* Fondo claro para el contenido principal */
}

.main-content {
  flex: 1;
  transition: margin-left 320ms cubic-bezier(0.22, 1, 0.36, 1);
  min-height: 100vh;
  position: relative;
}

/* Transición suave entre páginas */
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Reset de márgenes si el sidebar es fixed */
body {
  margin: 0;
  padding: 0;
}
</style>
