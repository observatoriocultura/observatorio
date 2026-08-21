<template>
  <nav class="red-observatorios-nav" aria-label="Secciones de la Red de Observatorios">
    <RouterLink
      :to="getTabLocation('explorar')"
      class="red-observatorios-nav-tab"
      :class="{ active: currentTab === 'explorar' }"
    >
      <i class="bi bi-search" aria-hidden="true"></i>
      Explorar
    </RouterLink>

    <RouterLink
      :to="getTabLocation('conexiones')"
      class="red-observatorios-nav-tab"
      :class="{ active: currentTab === 'conexiones' }"
    >
      <i class="bi bi-diagram-3" aria-hidden="true"></i>
      Conexiones
    </RouterLink>

    <RouterLink
      :to="getTabLocation('informacion')"
      class="red-observatorios-nav-tab"
      :class="{ active: currentTab === 'informacion' }"
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

  return ['explorar', 'conexiones', 'informacion'].includes(tab) ? tab : 'explorar'
})

const getTabLocation = (tab) => ({
  path: route.path,
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
  gap: 0.25rem;
  padding: 0.3rem 0 0.8rem;
}

.red-observatorios-nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 10px;
  padding: 0.45rem 1rem;
  color: var(--red-muted, #5c6972);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.red-observatorios-nav-tab:hover,
.red-observatorios-nav-tab:focus {
  background: #f2eef7;
  color: var(--red-purple-dark, #32204a);
}

.red-observatorios-nav-tab.active {
  background: #e9e2f1;
  color: var(--red-purple-dark, #32204a);
}

.red-observatorios-nav-tab:focus-visible {
  outline: 3px solid rgba(101, 64, 150, 0.2);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .red-observatorios-nav-tab {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
