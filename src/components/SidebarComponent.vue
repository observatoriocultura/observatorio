<template>
  <aside
    :class="['sidebar-container', { 'is-collapsed': isCollapsed }]"
    aria-label="Sidebar Navigation"
  >
    <!-- Header with Logo - The Toggle Trigger -->
    <div class="sidebar-header" :class="{ 'is-collapsed': isCollapsed }">
      <div 
        class="header-main-area" 
        @click="isCollapsed = false" 
        :title="isCollapsed ? 'Expandir menú' : 'Ir al inicio'"
      >
        <div class="logo-wrapper">
          <img
            src="/resources/images/app/logo-navbar.png"
            alt="Logo Observatorio"
            class="sidebar-logo"
          />
        </div>
        <h1 class="sidebar-title sidebar-text" :aria-hidden="isCollapsed">OBSERVATORIO</h1>
      </div>

      <!-- Botón para colapsar (Tipo Split) -->
      <button
        class="collapse-btn"
        :class="{ 'is-hidden': isCollapsed }"
        @click.stop="toggleSidebar"
        title="Colapsar menu"
        :aria-hidden="isCollapsed"
        :tabindex="isCollapsed ? -1 : 0"
        aria-label="Colapsar menu"
      >
        <i class="bi bi-layout-sidebar"></i>
      </button>
    </div>

    <!-- Main Navigation Content -->
    <div class="sidebar-content">
      <!-- Navigation Links -->
      <nav class="nav-links">
        <div class="nav-group-label sidebar-text" :aria-hidden="isCollapsed">Explorar</div>

        <RouterLink to="/" class="nav-item" active-class="is-active">
          <i class="bi bi-house"></i>
          <span class="sidebar-text" :aria-hidden="isCollapsed">Panel Principal</span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router'

/**
 * SidebarComponent - Un sidebar moderno estilo ChatGPT con expansión horizontal.
 * El estado inicial es colapsado. Al hacer click en el logo se expande.
 */
const isCollapsed = defineModel({ default: true })

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
/* Contenedor Principal */
.sidebar-container {
  --sidebar-expanded-width: 240px;
  --sidebar-collapsed-width: 50px;
  --sidebar-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --sidebar-duration: 320ms;

  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-expanded-width);
  background-color: #fcfcfc;
  color: #1a202c;
  display: flex;
  flex-direction: column;
  transition: width var(--sidebar-duration) var(--sidebar-ease);
  z-index: 1050;
  border-right: 1px solid #fcdea0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  will-change: width;
}

/* Estado Colapsado */
.sidebar-container.is-collapsed {
  width: var(--sidebar-collapsed-width);
}

/* Encabezado con Logo */
.sidebar-header {
  height: 50px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Permite el efecto split */
  transition: background-color 180ms ease;
  border-bottom: 1px solid rgba(252, 222, 160, 0.3);
}

.sidebar-header.is-collapsed {
  justify-content: center;
  padding: 0;
}

.header-main-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  height: 100%;
  min-width: 0;
  transition: gap var(--sidebar-duration) var(--sidebar-ease);
}

.sidebar-container.is-collapsed .header-main-area {
  flex: 0 0 100%;
  justify-content: center;
  gap: 0;
}

.sidebar-header:hover {
  background: rgba(252, 222, 160, 0.05);
}

.logo-wrapper {
  flex: 0 0 32px;
  display: flex;
  justify-content: center;
}

.sidebar-logo {
  height: 22px;
  width: auto;
  transition: transform 220ms ease;
}

.sidebar-header:hover .sidebar-logo {
  transform: scale(1.1);
}

.sidebar-title {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #1a202c;
  margin: 0;
}

.collapse-btn {
  background: transparent;
  border: none;
  padding: 0;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #a0aec0;
  cursor: pointer;
  opacity: 1;
  overflow: hidden;
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
  flex-basis: 0;
  width: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(6px);
}

.collapse-btn i {
  font-size: 1.1rem;
}

/* Area de Contenido Scrolleable */
.sidebar-content {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Enlaces de Navegación */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-group-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #a0aec0;
  padding: 8px 8px 4px 8px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.nav-group-label.sidebar-text {
  display: block;
  max-height: 28px;
  transition:
    max-width var(--sidebar-duration) var(--sidebar-ease),
    max-height var(--sidebar-duration) var(--sidebar-ease),
    padding var(--sidebar-duration) var(--sidebar-ease),
    opacity 180ms ease 80ms,
    transform var(--sidebar-duration) var(--sidebar-ease);
}

.sidebar-container.is-collapsed .nav-group-label.sidebar-text {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center; /* Centrado por defecto (para colapsado) */
  gap: 0;
  padding: 8px 0; /* Padding lateral en 0 para centrado puro */
  width: 100%;
  border-radius: 8px;
  color: #4a5568;
  text-decoration: none;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    padding var(--sidebar-duration) var(--sidebar-ease),
    gap var(--sidebar-duration) var(--sidebar-ease);
  font-weight: 500;
  min-height: 40px;
}

.sidebar-container.is-collapsed .nav-item {
  width: 34px;
  height: 34px;
  min-height: 34px;
  padding: 0;
}

/* Alineación a la izquierda cuando está expandido */
.sidebar-container:not(.is-collapsed) .nav-item {
  justify-content: flex-start;
  gap: 8px;
  padding: 8px 8px;
}

.nav-item:hover {
  background: rgba(252, 222, 160, 0.15);
  color: #1a202c;
}

.nav-item.is-active {
  background: #fcdea0;
  color: #1a202c;
  font-weight: 700;
}

.nav-item i {
  font-size: 1.2rem;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-text {
  display: inline-block;
  max-width: 160px;
  opacity: 1;
  overflow: hidden;
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

/* Estilo del Scrollbar */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(252, 222, 160, 0.5);
  border-radius: 10px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #fcdea0;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-container,
  .header-main-area,
  .sidebar-logo,
  .collapse-btn,
  .nav-item,
  .sidebar-text {
    transition-duration: 1ms;
  }
}
</style>
