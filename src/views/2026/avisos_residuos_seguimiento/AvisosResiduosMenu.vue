<script setup>
import { RouterLink, useRoute } from 'vue-router'

defineProps({
  currentTab: { type: String, required: true },
})

const route = useRoute()
const tabs = [
  { id: 'barrios', label: 'Barrios', icon: 'bi-geo-alt' },
  { id: 'por-barrio', label: 'Por barrio', icon: 'bi-graph-up' },
  { id: 'calendario', label: 'Calendario', icon: 'bi-calendar3' },
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
  gap: 0.3rem;
  margin-bottom: var(--avisos-panel-gap);
  padding-bottom: 0.35rem;
}

.avisos-residuos-nav-tab {
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  color: var(--avisos-muted);
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.avisos-residuos-nav-tab:hover {
  color: var(--avisos-green-text);
  background: var(--avisos-soft);
}

.avisos-residuos-nav-tab.active {
  color: var(--avisos-green-text);
  background: var(--avisos-green-soft);
}

.avisos-residuos-nav-tab:focus-visible {
  outline: 2px solid var(--avisos-green);
  outline-offset: 2px;
}

@media (max-width: 450px) {
  .avisos-residuos-nav {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.2rem;
  }

  .avisos-residuos-nav-tab {
    flex-direction: column;
    justify-content: center;
    gap: 0.1rem;
    padding: 0.3rem 0.1rem;
    font-size: 0.76rem;
    text-align: center;
  }
}
</style>
