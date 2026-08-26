<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const currentTab = computed(() => {
  const tab = route.query.tab
  return ['calendario', 'tablas'].includes(tab) ? tab : 'calendario'
})

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
      :to="getTabLocation('calendario')"
      class="avisos-residuos-nav-tab"
      :class="{ active: currentTab === 'calendario' }"
    >
      <i class="bi bi-calendar3" aria-hidden="true"></i>
      Calendario
    </RouterLink>

    <RouterLink
      :to="getTabLocation('tablas')"
      class="avisos-residuos-nav-tab"
      :class="{ active: currentTab === 'tablas' }"
    >
      <i class="bi bi-table" aria-hidden="true"></i>
      Tablas
    </RouterLink>
  </nav>
</template>

<style scoped>
.avisos-residuos-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.3rem 0 0.8rem;
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
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
