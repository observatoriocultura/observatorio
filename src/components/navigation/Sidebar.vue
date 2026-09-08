<template>
  <button
    v-if="isCollapsed"
    ref="mobileTrigger"
    type="button"
    class="sidebar-mobile-trigger"
    aria-label="Abrir menú principal"
    aria-controls="application-sidebar"
    @click="expandSidebar"
  >
    <i class="bi bi-list" aria-hidden="true"></i>
  </button>

  <button
    v-if="!isCollapsed"
    type="button"
    class="sidebar-backdrop"
    aria-label="Cerrar menú principal"
    @click="collapseSidebar(true)"
  ></button>

  <aside
    id="application-sidebar"
    :class="['sidebar-container', { 'is-collapsed': isCollapsed }]"
    aria-label="Navegación principal"
  >
    <header class="sidebar-header">
      <RouterLink
        v-if="!isCollapsed"
        to="/"
        class="sidebar-brand"
        aria-label="Ir al panel principal"
        @click="handleNavigate"
      >
        <img :src="logoUrl" alt="" class="sidebar-logo" aria-hidden="true" />
        <span class="sidebar-brand-copy">
          <strong>Observatorio</strong>
          <small>Culturas Bogotá</small>
        </span>
      </RouterLink>

      <button
        ref="sidebarToggle"
        type="button"
        class="sidebar-toggle"
        :class="{ 'is-centered': isCollapsed }"
        :aria-label="isCollapsed ? 'Expandir menú' : 'Colapsar menú'"
        :title="isCollapsed ? 'Expandir menú' : 'Colapsar menú'"
        :aria-expanded="!isCollapsed"
        aria-controls="sidebar-navigation"
        @click="toggleSidebar"
      >
        <i
          class="bi"
          :class="isCollapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'"
          aria-hidden="true"
        ></i>
      </button>
    </header>

    <div class="sidebar-content">
      <nav id="sidebar-navigation" class="nav-links" aria-label="Secciones">
        <div class="nav-group-label" :aria-hidden="isCollapsed">Explorar</div>

        <RouterLink
          v-for="item in visibleMenuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'is-active': isMenuItemActive(item.path) }"
          :title="isCollapsed ? item.label : undefined"
          :aria-label="isCollapsed ? item.label : undefined"
          :aria-current="isMenuItemActive(item.path) ? 'page' : undefined"
          @click="handleNavigate"
        >
          <i class="bi" :class="item.icon" aria-hidden="true"></i>
          <span class="sidebar-text" :aria-hidden="isCollapsed">{{ item.label }}</span>
        </RouterLink>

        <div
          v-if="sessionLoading"
          class="session-loading"
          aria-live="polite"
          :aria-label="isCollapsed ? 'Comprobando sesión' : undefined"
        >
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span class="sidebar-text" :aria-hidden="isCollapsed">Comprobando sesión...</span>
        </div>
      </nav>
    </div>

    <footer v-if="user && !sessionLoading" ref="userMenu" class="sidebar-footer">
      <button
        type="button"
        class="user-summary"
        :title="isCollapsed ? `${userDisplayName} · ${userRoleLabel}` : undefined"
        :aria-expanded="isUserMenuOpen"
        aria-haspopup="menu"
        aria-controls="sidebar-user-menu"
        @click="toggleUserMenu"
      >
        <span class="user-avatar" aria-hidden="true">
          <i class="bi bi-person-fill"></i>
        </span>
        <span class="user-details sidebar-text" :aria-hidden="isCollapsed">
          <strong>{{ userDisplayName }}</strong>
          <small>{{ userRoleLabel }}</small>
        </span>
        <i
          class="bi bi-chevron-up user-menu-chevron sidebar-text"
          :class="{ 'is-open': isUserMenuOpen }"
          aria-hidden="true"
        ></i>
      </button>

      <Transition name="user-menu">
        <div
          v-if="isUserMenuOpen"
          id="sidebar-user-menu"
          class="user-menu"
          role="menu"
          aria-label="Opciones de usuario"
        >
          <RouterLink to="/profile" class="user-menu-item" role="menuitem" @click="handleNavigate">
            <i class="bi bi-person-circle" aria-hidden="true"></i>
            <span>Mi Perfil</span>
          </RouterLink>

          <button
            type="button"
            class="user-menu-item is-logout"
            role="menuitem"
            :disabled="logoutLoading"
            @click="handleLogout"
          >
            <span
              v-if="logoutLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <i v-else class="bi bi-box-arrow-right" aria-hidden="true"></i>
            <span>{{ logoutButtonLabel }}</span>
          </button>
        </div>
      </Transition>
    </footer>
  </aside>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
const sidebarToggle = ref(null)
const mobileTrigger = ref(null)
const userMenu = ref(null)
const isUserMenuOpen = ref(false)

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

  return [HOME_ITEM, ...AUTHENTICATED_ITEMS.filter((item) => item.roles.includes(userRole.value))]
})

const userDisplayName = computed(
  () =>
    props.user?.full_name ||
    props.user?.user_metadata?.full_name ||
    props.user?.email?.split('@')[0] ||
    'Usuario',
)

const userRoleLabel = computed(() => ROLE_LABELS[userRole.value] || 'Usuario')
const logoutButtonLabel = computed(() =>
  props.logoutLoading ? 'Cerrando sesión...' : 'Cerrar sesión',
)

function normalizeUserRole(user) {
  for (const candidate of [user?.role, user?.app_metadata?.role]) {
    const normalized = String(candidate || '')
      .trim()
      .toLowerCase()
    const mappedRole = ROLE_ALIASES[normalized] || normalized
    if (ROLE_LABELS[mappedRole]) return mappedRole
  }

  return 'subscriber'
}

function isMenuItemActive(path) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

function toggleSidebar() {
  isUserMenuOpen.value = false
  isCollapsed.value = !isCollapsed.value
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function handleLogout() {
  isUserMenuOpen.value = false
  emit('logout')
}

async function expandSidebar() {
  isCollapsed.value = false
  await nextTick()
  sidebarToggle.value?.focus()
}

async function collapseSidebar(restoreFocus = false) {
  isUserMenuOpen.value = false
  isCollapsed.value = true

  if (restoreFocus) {
    await nextTick()
    mobileTrigger.value?.focus()
  }
}

function handleNavigate() {
  isUserMenuOpen.value = false
  emit('navigate')
}

function handleEscape(event) {
  if (event.key !== 'Escape') return

  if (isUserMenuOpen.value) {
    isUserMenuOpen.value = false
    return
  }

  if (!isCollapsed.value) void collapseSidebar(true)
}

function handleOutsideClick(event) {
  if (isUserMenuOpen.value && !userMenu.value?.contains(event.target)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
  document.addEventListener('pointerdown', handleOutsideClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  document.removeEventListener('pointerdown', handleOutsideClick)
})
</script>

<style scoped>
.sidebar-container {
  --sidebar-primary: #654096;
  --sidebar-primary-dark: #4b2f73;
  --sidebar-primary-soft: #f1ecf7;
  --sidebar-text: #302b36;
  --sidebar-muted: #756e7d;
  --sidebar-border: #e6e1ea;
  --sidebar-expanded-width: 260px;
  --sidebar-collapsed-width: 64px;
  --sidebar-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --sidebar-duration: 260ms;

  position: fixed;
  inset: 0 auto 0 0;
  z-index: 1050;
  display: flex;
  width: var(--sidebar-expanded-width);
  height: 100vh;
  height: 100dvh;
  flex-direction: column;
  overflow: visible;
  border-right: 1px solid var(--sidebar-border);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 6px 0 24px rgba(39, 28, 49, 0.06);
  color: var(--sidebar-text);
  transition: width var(--sidebar-duration) var(--sidebar-ease);
}

.sidebar-container.is-collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  display: flex;
  min-height: 64px;
  flex: 0 0 64px;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--sidebar-border);
}

.sidebar-brand {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 0.65rem;
  color: inherit;
  text-decoration: none;
}

.sidebar-logo {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  object-fit: contain;
}

.sidebar-brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.15;
}

.sidebar-brand-copy strong,
.sidebar-brand-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-brand-copy strong {
  color: var(--sidebar-primary-dark);
  font-size: 0.9rem;
  font-weight: 800;
}

.sidebar-brand-copy small {
  margin-top: 0.12rem;
  color: var(--sidebar-muted);
  font-size: 0.68rem;
  font-weight: 600;
}

.sidebar-toggle,
.sidebar-mobile-trigger {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--sidebar-muted);
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease;
}

.sidebar-toggle.is-centered {
  margin: 0 auto;
}

.sidebar-toggle:hover {
  border-color: #ddd4e7;
  background: var(--sidebar-primary-soft);
  color: var(--sidebar-primary);
}

.sidebar-toggle i,
.sidebar-mobile-trigger i {
  font-size: 1.15rem;
}

.sidebar-content {
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0.75rem;
  scrollbar-color: #cfc3dc transparent;
  scrollbar-width: thin;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.nav-group-label {
  max-height: 32px;
  margin: 0.2rem 0.65rem 0.35rem;
  overflow: hidden;
  color: #91899a;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition:
    max-height var(--sidebar-duration) var(--sidebar-ease),
    opacity 140ms ease;
}

.sidebar-container.is-collapsed .nav-group-label {
  max-height: 0;
  margin: 0;
  opacity: 0;
}

.nav-item,
.session-loading {
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid transparent;
  border-radius: 0.55rem;
  background: transparent;
  color: #5f5867;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    width var(--sidebar-duration) var(--sidebar-ease);
}

.sidebar-container.is-collapsed .nav-item,
.sidebar-container.is-collapsed .session-loading {
  width: 40px;
  height: 40px;
  min-width: 40px;
  max-width: 40px;
  min-height: 40px;
  flex: 0 0 40px;
  justify-content: center;
  gap: 0;
  margin-inline: auto;
  padding: 0;
}

.nav-item:hover {
  border-color: #e7dfee;
  background: #f7f4fa;
  color: var(--sidebar-primary-dark);
}

.nav-item.is-active {
  border-color: #e0d5eb;
  background: #eee6f6;
  box-shadow: none;
  color: var(--sidebar-primary-dark);
  font-weight: 750;
}

.sidebar-container.is-collapsed .nav-item.is-active {
  box-shadow: none;
}

.nav-item i {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  font-size: 1.08rem;
}

.session-loading {
  color: var(--sidebar-muted);
  font-size: 0.76rem;
}

.sidebar-footer {
  position: relative;
  display: block;
  box-sizing: border-box;
  padding: 0.75rem;
  border-top: 1px solid var(--sidebar-border);
}

.sidebar-container.is-collapsed .sidebar-footer {
  display: block;
  width: var(--sidebar-collapsed-width);
  height: 65px;
  flex: 0 0 65px;
  padding: 0;
}

.user-summary {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-height: 46px;
  align-items: center;
  gap: 0.65rem;
  padding: 0.4rem 0.55rem;
  overflow: visible;
  border: 1px solid transparent;
  border-radius: 0.55rem;
  background: #f8f6fa;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 160ms ease,
    border-color 160ms ease;
}

.user-summary:hover,
.user-summary[aria-expanded='true'] {
  border-color: #e0d5eb;
  background: #eee6f6;
}

.sidebar-container.is-collapsed .user-summary {
  position: absolute;
  top: 12px;
  left: calc((var(--sidebar-collapsed-width) - 41px) / 2);
  width: 40px;
  height: 40px;
  min-width: 40px;
  max-width: 40px;
  min-height: 40px;
  flex: 0 0 40px;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.user-avatar {
  display: inline-flex;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--sidebar-primary);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  overflow: hidden;
  text-align: center;
}

.user-avatar i {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.user-details {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.user-details strong,
.user-details small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-details strong {
  color: var(--sidebar-text);
  font-size: 0.78rem;
}

.user-details small {
  margin-top: 0.14rem;
  color: var(--sidebar-muted);
  font-size: 0.66rem;
}

.user-menu-chevron {
  margin-left: auto;
  color: var(--sidebar-muted);
  font-size: 0.7rem;
  transition: transform 160ms ease;
}

.user-menu-chevron.is-open {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  right: 0.75rem;
  bottom: calc(100% - 0.25rem);
  left: 0.75rem;
  z-index: 10;
  padding: 0.35rem;
  border: 1px solid var(--sidebar-border);
  border-radius: 0.6rem;
  background: #fff;
  box-shadow: 0 12px 30px rgba(39, 28, 49, 0.16);
}

.sidebar-container.is-collapsed .user-menu {
  right: auto;
  bottom: 0.75rem;
  left: calc(100% + 0.5rem);
  width: 180px;
}

.user-menu-item {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.65rem;
  border: 0;
  border-radius: 0.45rem;
  background: transparent;
  color: #746c7c;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  text-align: left;
  text-decoration: none;
}

.user-menu-item:hover:not(:disabled) {
  background: var(--sidebar-primary-soft);
  color: var(--sidebar-primary-dark);
}

.user-menu-item.is-logout:hover:not(:disabled) {
  background: #fff0f2;
  color: #a33a48;
}

.user-menu-item:disabled {
  cursor: wait;
  opacity: 0.6;
}

.user-menu-item i,
.user-menu-item .spinner-border {
  display: inline-flex;
  width: 20px;
  flex: 0 0 20px;
  justify-content: center;
}

.user-menu-enter-active,
.user-menu-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.sidebar-text {
  display: inline-block;
  max-width: 174px;
  overflow: hidden;
  opacity: 1;
  text-overflow: ellipsis;
  transform: translateX(0);
  transition:
    max-width var(--sidebar-duration) var(--sidebar-ease),
    opacity 140ms ease 60ms,
    transform var(--sidebar-duration) var(--sidebar-ease);
  white-space: nowrap;
}

.sidebar-container.is-collapsed .sidebar-text {
  max-width: 0;
  opacity: 0;
  transform: translateX(-5px);
  transition:
    max-width 180ms var(--sidebar-ease),
    opacity 100ms ease,
    transform 180ms var(--sidebar-ease);
}

.sidebar-toggle:focus-visible,
.sidebar-mobile-trigger:focus-visible,
.nav-item:focus-visible,
.user-summary:focus-visible,
.user-menu-item:focus-visible,
.sidebar-brand:focus-visible {
  outline: 2px solid var(--sidebar-primary, #654096);
  outline-offset: 2px;
}

.sidebar-mobile-trigger,
.sidebar-backdrop {
  display: none;
}

.sidebar-content::-webkit-scrollbar {
  width: 5px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #cfc3dc;
}

@media (max-width: 767.98px) {
  .sidebar-container,
  .sidebar-container.is-collapsed {
    width: min(280px, 86vw);
    box-shadow: 14px 0 38px rgba(39, 28, 49, 0.18);
    transform: translateX(-100%);
    visibility: hidden;
    transition:
      transform var(--sidebar-duration) var(--sidebar-ease),
      visibility 0s linear var(--sidebar-duration);
  }

  .sidebar-container:not(.is-collapsed) {
    transform: translateX(0);
    visibility: visible;
    transition:
      transform var(--sidebar-duration) var(--sidebar-ease),
      visibility 0s linear 0s;
  }

  .sidebar-mobile-trigger {
    position: fixed;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 1040;
    display: inline-flex;
    border-color: #ded6e5;
    background: #fff;
    box-shadow: 0 6px 18px rgba(39, 28, 49, 0.12);
    color: #654096;
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1045;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: rgba(32, 24, 39, 0.35);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-container,
  .sidebar-toggle,
  .sidebar-mobile-trigger,
  .nav-item,
  .user-summary,
  .user-menu,
  .sidebar-text,
  .nav-group-label {
    transition: none;
  }
}
</style>
