<template>
  <main class="red-observatorios">
    <div class="red-observatorios-shell">
      <RedObservatoriosMenu />

      <div class="red-observatorios-content">
        <RedObservatoriosLista v-show="currentTab === 'explorar'" />
        <RedObservatoriosDataviz v-show="currentTab === 'conexiones'" />
        <RedObservatoriosInfo v-show="currentTab === 'informacion'" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RedObservatoriosDataviz from './RedObservatoriosDataviz.vue'
import RedObservatoriosInfo from './RedObservatoriosInfo.vue'
import RedObservatoriosLista from './RedObservatoriosLista.vue'
import RedObservatoriosMenu from './RedObservatoriosMenu.vue'

const route = useRoute()

const currentTab = computed(() => {
  const tab = route.query.tab

  return ['explorar', 'conexiones', 'informacion'].includes(tab) ? tab : 'explorar'
})
</script>

<style scoped>
.red-observatorios {
  --red-purple: #654096;
  --red-purple-dark: #32204a;
  --red-ink: #18232b;
  --red-muted: #5c6871;
  --red-border: #e2e6ea;
  min-height: 100vh;
  padding: 0.5rem clamp(0.9rem, 3vw, 2rem) 3.5rem;
  background: #f8f9fa;
  color: var(--red-ink);
}

.red-observatorios-shell {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.red-observatorios-content {
  animation: fade-in 0.35s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
