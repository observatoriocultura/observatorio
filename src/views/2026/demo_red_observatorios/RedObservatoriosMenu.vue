<template>
  <nav class="red-observatorios-nav" aria-label="Secciones de la Red de Observatorios">
    <RouterLink
      :to="getTabLocation('explorar')"
      class="red-observatorios-nav-tab"
      :class="{ active: currentTab === 'explorar' }"
      :aria-current="currentTab === 'explorar' ? 'page' : undefined"
    >
      <i class="bi bi-search" aria-hidden="true"></i>
      Explorar
    </RouterLink>

    <RouterLink
      :to="getTabLocation('mapa')"
      class="red-observatorios-nav-tab"
      :class="{ active: currentTab === 'mapa' }"
      :aria-current="currentTab === 'mapa' ? 'page' : undefined"
    >
      <i class="bi bi-map" aria-hidden="true"></i>
      Lugares
    </RouterLink>

    <RouterLink
      :to="getTabLocation('conexiones')"
      class="red-observatorios-nav-tab"
      :class="{ active: currentTab === 'conexiones' }"
      :aria-current="currentTab === 'conexiones' ? 'page' : undefined"
    >
      <i class="bi bi-diagram-3" aria-hidden="true"></i>
      Conexiones
    </RouterLink>

    <RouterLink
      :to="getTabLocation('informacion')"
      class="red-observatorios-nav-tab"
      :class="{ active: currentTab === 'informacion' }"
      :aria-current="currentTab === 'informacion' ? 'page' : undefined"
    >
      <i class="bi bi-info-circle" aria-hidden="true"></i>
      Información
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const currentTab = computed(() => {
  const tab = route.query.tab

  return ['explorar', 'mapa', 'conexiones', 'informacion'].includes(tab) ? tab : 'explorar'
})

const getTabLocation = (tab) => ({
  name: 'Demo Red de Observatorios',
  query: {
    ...route.query,
    tab,
  },
})
</script>

<style scoped>
.red-observatorios-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(0.75rem, 3vw, 2.5rem);
  padding: 0.25rem 0 1rem;
}

.red-observatorios-nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  border-bottom: 1px solid transparent;
  padding: 0.5rem 0.1rem;
  color: var(--red-muted);
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.red-observatorios-nav-tab:hover,
.red-observatorios-nav-tab:focus {
  color: var(--red-ink);
  border-bottom-color: var(--red-ink);
}

.red-observatorios-nav-tab.active {
  border-bottom-color: var(--red-ink);
  color: var(--red-ink);
}

.red-observatorios-nav-tab:focus-visible {
  outline: 2px solid var(--red-focus);
  outline-offset: 5px;
}

@media (max-width: 600px) {
  .red-observatorios-nav-tab {
    padding: 0.6rem 0.1rem;
    font-size: 0.75rem;
  }
}
</style>
