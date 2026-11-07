<script setup>
import { RouterLink, useRoute } from 'vue-router'

defineProps({
  currentTab: { type: String, required: true },
})

const route = useRoute()
const tabs = [
  { id: 'barrios', label: 'Barrios', icon: 'bi-geo-alt' },
  { id: 'calendario', label: 'Calendario', icon: 'bi-calendar3' },
  { id: 'tablas', label: 'Tablas', icon: 'bi-table' },
]

const getTabLocation = (tab) => ({
  path: route.path,
  query: {
    ...route.query,
    tab,
  },
})
</script>

<template>
  <nav class="avisos-residuos-nav" aria-label="Secciones de avisos de residuos">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.id"
      :to="getTabLocation(tab.id)"
      class="avisos-residuos-nav-tab"
      :class="{ active: currentTab === tab.id }"
      :aria-current-value="currentTab === tab.id ? 'page' : 'false'"
    >
      <i class="bi" :class="tab.icon" aria-hidden="true"></i>
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.avisos-residuos-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
  padding: 0 0 0.65rem;
}

.avisos-residuos-nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  border-radius: 10px;
  color: #5c6972;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.avisos-residuos-nav-tab:hover,
.avisos-residuos-nav-tab:focus {
  color: #225e37;
  background: #edf5ef;
}

.avisos-residuos-nav-tab.active {
  color: #1d5631;
  background: #dfeee3;
}

.avisos-residuos-nav-tab:focus-visible {
  outline: 3px solid rgba(49, 116, 73, 0.22);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .avisos-residuos-nav-tab {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
