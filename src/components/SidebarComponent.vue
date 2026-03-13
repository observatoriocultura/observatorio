<template>
  <aside
    :class="['sidebar-container', { 'is-collapsed': isCollapsed }]"
    aria-label="Sidebar Navigation"
  >
    <!-- Header with Logo - The Toggle Trigger -->
    <div class="sidebar-header" @click="toggleSidebar" title="Alternar menú">
      <div class="logo-wrapper">
        <img
          src="/resources/images/app/logo-navbar.png"
          alt="Logo Observatorio"
          class="sidebar-logo"
        />
      </div>
      <transition name="fade">
        <h1 v-if="!isCollapsed" class="sidebar-title">OBSERVATORIO</h1>
      </transition>
    </div>

    <!-- Main Navigation Content -->
    <div class="sidebar-content">
      <!-- Navigation Links -->
      <nav class="nav-links">
        <div class="nav-group-label" v-if="!isCollapsed">Explorar</div>

        <RouterLink to="/" class="nav-item" active-class="is-active">
          <i class="bi bi-house"></i>
          <transition name="fade">
            <span v-if="!isCollapsed">Panel Principal</span>
          </transition>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import {} from 'vue'
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
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background-color: #fcfcfc;
  color: #1a202c;
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.075, 0.82, 0.165, 1);
  z-index: 1050;
  border-right: 1px solid #fcdea0;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* Estado Colapsado */
.sidebar-container.is-collapsed {
  width: 68px;
}

/* Encabezado con Logo */
.sidebar-header {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(252, 222, 160, 0.3);
}

.sidebar-header:hover {
  background: rgba(252, 222, 160, 0.05);
}

.logo-wrapper {
  min-width: 36px;
  display: flex;
  justify-content: center;
}

.sidebar-logo {
  height: 28px;
  width: auto;
  transition: transform 0.3s ease;
}

.sidebar-header:hover .sidebar-logo {
  transform: scale(1.1);
}

.sidebar-title {
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #1a202c;
  margin: 0;
  white-space: nowrap;
}

/* Area de Contenido Scrolleable */
.sidebar-content {
  flex: 1;
  padding: 12px;
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
  padding: 12px 12px 4px 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center; /* Centrado por defecto (para colapsado) */
  gap: 12px;
  padding: 10px 0; /* Padding lateral en 0 para centrado puro */
  border-radius: 8px;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

/* Alineación a la izquierda cuando está expandido */
.sidebar-container:not(.is-collapsed) .nav-item {
  justify-content: flex-start;
  padding: 10px 12px;
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

/* Animaciones de Desvanecimiento */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
</style>
