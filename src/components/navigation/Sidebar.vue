<template>
  <aside
    :class="['sidebar-container', { 'is-collapsed': isCollapsed }]"
    aria-label="Navegación principal"
  >
    <div class="sidebar-header" :class="{ 'is-collapsed': isCollapsed }">
      <RouterLink
        to="/"
        class="header-main-area"
        :title="isCollapsed ? 'Expandir menú' : 'Ir al inicio'"
        @click="handleHeaderClick"
      >
        <span class="logo-wrapper">
          <img :src="logoUrl" alt="Logo Observatorio" class="sidebar-logo" />
        </span>
        <span class="sidebar-title sidebar-text" :aria-hidden="isCollapsed">OBSERVATORIO</span>
      </RouterLink>

      <button
        class="collapse-btn"
        :class="{ 'is-hidden': isCollapsed }"
        type="button"
        title="Colapsar menú"
        :aria-hidden="isCollapsed"
        :tabindex="isCollapsed ? -1 : 0"
        aria-label="Colapsar menú"
        @click.stop="isCollapsed = true"
      >
        <i class="bi bi-layout-sidebar" aria-hidden="true"></i>
      </button>
    </div>

    <div class="sidebar-content">
      <nav class="nav-links" aria-label="Secciones">
        <div class="nav-group-label sidebar-text" :aria-hidden="isCollapsed">Explorar</div>

        <RouterLink
          v-for="item in visibleMenuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'is-active': isMenuItemActive(item.path) }"
          :title="isCollapsed ? item.label : undefined"
          @click="handleNavigate"
        >
          <i class="bi" :class="item.icon" aria-hidden="true"></i>
          <span class="sidebar-text" :aria-hidden="isCollapsed">{{ item.label }}</span>
        </RouterLink>

        <div v-if="sessionLoading" class="session-loading" aria-live="polite">
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span class="sidebar-text">Comprobando sesión...</span>
        </div>
      </nav>
    </div>

    <footer v-if="user && !sessionLoading" class="sidebar-footer">
      <div class="user-summary" :title="isCollapsed ? userDisplayName : undefined">
        <span class="user-avatar" aria-hidden="true">{{ userInitials }}</span>
        <span class="user-details sidebar-text" :aria-hidden="isCollapsed">
          <strong>{{ userDisplayName }}</strong>
          <small>{{ userRoleLabel }}</small>
        </span>
      </div>

      <button
        type="button"
        class="logout-btn"
        :disabled="logoutLoading"
        :title="isCollapsed ? 'Cerrar sesión' : undefined"
        @click="emit('logout')"
      >
        <span
          v-if="logoutLoading"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        <i v-else class="bi bi-box-arrow-right" aria-hidden="true"></i>
        <span class="sidebar-text" :aria-hidden="isCollapsed">
          {{ logoutLoading ? 'Cerrando...' : 'Cerrar sesión' }}
        </span>
      </button>
    </footer>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { REGISTRATION_ENABLED } from '../../constants/auth.js'

defineOptions({ name: 'NavigationSidebar' })

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  sessionLoading: {
    type: Boolean,
    default: false,
  },
  logoutLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['logout', 'navigate'])
const isCollapsed = defineModel({ default: true })
const route = useRoute()

const logoUrl = `${import.meta.env.BASE_URL}resources/images/app/logo-navbar.png`

const HOME_ITEM = {
  path: '/',
  label: 'Panel principal',
  icon: 'bi-house',
}

const AUTHENTICATED_ITEMS = [
  {
    path: '/profiles',
    label: 'Administrar usuarios',
    icon: 'bi-people',
    roles: ['admin'],
  },
  {
    path: '/profile',
    label: 'Mi perfil',
    icon: 'bi-person-circle',
    roles: ['admin', 'editor', 'subscriber'],
  },
  {
    path: '/change_password',
    label: 'Cambiar contraseña',
    icon: 'bi-key',
    roles: ['admin', 'editor', 'subscriber'],
  },
]

const PUBLIC_ITEMS = [
  {
    path: '/login',
    label: 'Iniciar sesión',
    icon: 'bi-box-arrow-in-right',
  },
  ...(REGISTRATION_ENABLED
    ? [
        {
          path: '/register',
          label: 'Registrarse',
          icon: 'bi-person-plus',
        },
      ]
    : []),
]

const ROLE_ALIASES = {
  administrator: 'admin',
  administrador: 'admin',
  administradora: 'admin',
  suscriptor: 'subscriber',
  suscriptora: 'subscriber',
}

const ROLE_LABELS = {
  admin: 'Administrador',
  editor: 'Editor',
  subscriber: 'Suscriptor',
}

const userRole = computed(() => normalizeUserRole(props.user))

const visibleMenuItems = computed(() => {
  if (!props.user) return [HOME_ITEM, ...PUBLIC_ITEMS]

  return [
    HOME_ITEM,
    ...AUTHENTICATED_ITEMS.filter((item) => item.roles.includes(userRole.value)),
  ]
})

const userDisplayName = computed(
  () =>
    props.user?.full_name ||
    props.user?.user_metadata?.full_name ||
    props.user?.email?.split('@')[0] ||
    'Usuario',
)

const userRoleLabel = computed(() => ROLE_LABELS[userRole.value] || 'Usuario')

const userInitials = computed(() => {
  const initials = userDisplayName.value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')

  return initials.toUpperCase() || 'U'
})

function normalizeUserRole(user) {
  for (const candidate of [user?.role, user?.app_metadata?.role]) {
    const normalized = String(candidate || '').trim().toLowerCase()
    const mappedRole = ROLE_ALIASES[normalized] || normalized
    if (ROLE_LABELS[mappedRole]) return mappedRole
  }

  return 'subscriber'
}

function isMenuItemActive(path) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

function handleHeaderClick(event) {
  if (isCollapsed.value) {
    event.preventDefault()
    isCollapsed.value = false
    return
  }

  emit('navigate')
}

function handleNavigate() {
  emit('navigate')
}
</script>

<style scoped>
.sidebar-container {
  --sidebar-expanded-width: 240px;
  --sidebar-collapsed-width: 50px;
  --sidebar-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --sidebar-duration: 320ms;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 1050;
  display: flex;
  width: var(--sidebar-expanded-width);
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #fcdea0;
  background-color: #fcfcfc;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.03);
  color: #1a202c;
  transition: width var(--sidebar-duration) var(--sidebar-ease);
  will-change: width;
}

.sidebar-container.is-collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  display: flex;
  height: 50px;
  flex: 0 0 50px;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  border-bottom: 1px solid rgba(252, 222, 160, 0.3);
  transition: background-color 180ms ease;
}

.sidebar-header.is-collapsed {
  justify-content: center;
  padding: 0;
}

.sidebar-header:hover {
  background: rgba(252, 222, 160, 0.05);
}

.header-main-area {
  display: flex;
  min-width: 0;
  height: 100%;
  flex: 1;
  align-items: center;
  gap: 8px;
  color: inherit;
  text-decoration: none;
  transition: gap var(--sidebar-duration) var(--sidebar-ease);
}

.sidebar-container.is-collapsed .header-main-area {
  flex: 0 0 100%;
  justify-content: center;
  gap: 0;
}

.logo-wrapper {
  display: flex;
  flex: 0 0 32px;
  justify-content: center;
}

.sidebar-logo {
  width: auto;
  height: 22px;
  transition: transform 220ms ease;
}

.sidebar-header:hover .sidebar-logo {
  transform: scale(1.1);
}

.sidebar-title {
  margin: 0;
  color: #1a202c;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.collapse-btn {
  display: flex;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #a0aec0;
  cursor: pointer;
  opacity: 1;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    flex-basis var(--sidebar-duration) var(--sidebar-ease),
    opacity 160ms ease,
    transform var(--sidebar-duration) var(--sidebar-ease);
}

.collapse-btn:hover {
  background: rgba(252, 222, 160, 0.2);
  color: #1a202c;
}

.collapse-btn.is-hidden {
  width: 0;
  flex-basis: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(6px);
}

.collapse-btn i {
  font-size: 1.1rem;
}

.sidebar-content {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-group-label {
  padding: 8px 8px 4px;
  color: #a0aec0;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.nav-item,
.logout-btn,
.session-loading {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 8px 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #4a5568;
  font: inherit;
  font-weight: 500;
  text-decoration: none;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    padding var(--sidebar-duration) var(--sidebar-ease),
    gap var(--sidebar-duration) var(--sidebar-ease);
}

.sidebar-container:not(.is-collapsed) .nav-item,
.sidebar-container:not(.is-collapsed) .logout-btn,
.sidebar-container:not(.is-collapsed) .session-loading {
  justify-content: flex-start;
  gap: 8px;
  padding: 8px;
}

.sidebar-container.is-collapsed .nav-item,
.sidebar-container.is-collapsed .logout-btn,
.sidebar-container.is-collapsed .session-loading {
  width: 34px;
  height: 34px;
  min-height: 34px;
  padding: 0;
}

.nav-item:hover,
.logout-btn:hover:not(:disabled) {
  background: rgba(252, 222, 160, 0.15);
  color: #1a202c;
}

.nav-item.is-active {
  background: #fcdea0;
  color: #1a202c;
  font-weight: 700;
}

.nav-item i,
.logout-btn i {
  display: flex;
  min-width: 24px;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.session-loading {
  color: #718096;
  font-size: 0.78rem;
}

.sidebar-footer {
  display: grid;
  gap: 4px;
  padding: 8px;
  border-top: 1px solid rgba(252, 222, 160, 0.45);
}

.user-summary {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  overflow: hidden;
}

.sidebar-container.is-collapsed .user-summary {
  justify-content: center;
  padding: 5px 0;
}

.user-avatar {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fcdea0;
  color: #1a202c;
  font-size: 0.68rem;
  font-weight: 800;
}

.user-details {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.user-details strong {
  overflow: hidden;
  font-size: 0.78rem;
  text-overflow: ellipsis;
}

.user-details small {
  color: #718096;
  font-size: 0.67rem;
}

.logout-btn {
  cursor: pointer;
  color: #8b3a3a;
  font-size: 0.82rem;
}

.logout-btn:disabled {
  cursor: wait;
  opacity: 0.65;
}

.sidebar-text {
  display: inline-block;
  max-width: 170px;
  overflow: hidden;
  opacity: 1;
  transform: translateX(0);
  transition:
    max-width var(--sidebar-duration) var(--sidebar-ease),
    opacity 180ms ease 80ms,
    transform var(--sidebar-duration) var(--sidebar-ease);
  white-space: nowrap;
  will-change: max-width, opacity, transform;
}

.sidebar-container.is-collapsed .sidebar-text {
  max-width: 0;
  opacity: 0;
  transform: translateX(-6px);
  transition:
    max-width 240ms var(--sidebar-ease),
    opacity 120ms ease,
    transform 240ms var(--sidebar-ease);
}

.sidebar-container.is-collapsed .nav-group-label {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(252, 222, 160, 0.5);
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-container,
  .header-main-area,
  .sidebar-logo,
  .collapse-btn,
  .nav-item,
  .logout-btn,
  .sidebar-text {
    transition-duration: 1ms;
  }
}
</style>
