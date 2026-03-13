<template>
  <div class="app-layout">
    <SidebarComponent v-model="isCollapsed" />

    <main class="main-content" :style="{ marginLeft: isCollapsed ? '68px' : '280px' }">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SidebarComponent from './components/SidebarComponent.vue'

const isCollapsed = ref(true)
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
  transition: margin-left 0.4s cubic-bezier(0.075, 0.82, 0.165, 1);
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
